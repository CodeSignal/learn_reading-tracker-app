import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ReadingService {
  constructor(private readonly db: DatabaseService) {}

  findAllForUser(userId: number) {
    return this.db.getReadingSessions().filter((s) => s.userId === userId);
  }

  updateProgress(dto: UpdateProgressDto) {
    const user = this.db.findUserById(dto.userId);
    if (!user) throw new NotFoundException('User not found');
    const book = this.db.getBooks().find((b) => b.id === dto.bookId);
    if (!book) throw new NotFoundException('Book not found');
    if (dto.currentPage < 0 || dto.currentPage > (book.totalPages || Infinity)) {
      throw new BadRequestException('Invalid currentPage');
    }
    const sessions = this.db.getReadingSessions();
    const existing = sessions.find((s) => s.userId === dto.userId && s.bookId === dto.bookId);
    const updatedAt = new Date().toISOString();
    if (existing) {
      existing.currentPage = dto.currentPage;
      if (dto.status) existing.status = dto.status;
      existing.updatedAt = updatedAt;
      return existing;
    }
    const created = { userId: dto.userId, bookId: dto.bookId, currentPage: dto.currentPage, status: dto.status, updatedAt };
    sessions.push(created);
    return created;
  }

  findShelf(userId: number, query: { status?: string; sortBy?: string; order?: 'asc' | 'desc' }) {
    const sessions = this.findAllForUser(userId);
    const books = this.db.getBooks();
    let items = sessions.map((s: any) => {
      const b = books.find((bb: any) => bb.id === s.bookId) as any;
      return {
        bookId: s.bookId,
        title: b?.title || '',
        author: b?.author || '',
        progress: b?.totalPages ? s.currentPage / b.totalPages : 0,
        currentPage: s.currentPage,
        status: s.status,
        updatedAt: s.updatedAt,
      };
    });

    if (query.status) items = items.filter((i) => i.status === query.status);

    const order = query.order ?? 'asc';
    const cmpNum = (a: number, b: number) => (a < b ? (order === 'asc' ? -1 : 1) : a > b ? (order === 'asc' ? 1 : -1) : 0);
    const cmpStr = (a: string, b: string) => cmpNum(a.localeCompare(b), 0);

    if (query.sortBy === 'title') items.sort((a, b) => cmpStr(a.title, b.title));
    if (query.sortBy === 'author') items.sort((a, b) => cmpStr(a.author, b.author));
    if (query.sortBy === 'progress') items.sort((a, b) => cmpNum(a.progress, b.progress));
    if (query.sortBy === 'updatedAt') items.sort((a, b) => cmpStr(a.updatedAt || '', b.updatedAt || ''));

    return items;
  }
}

