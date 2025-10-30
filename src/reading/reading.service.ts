import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BooksService } from '../books/books.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { FindShelfDto } from './dto/find-shelf.dto';

@Injectable()
export class ReadingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly booksService: BooksService,
  ) {}

  private deriveStatus(currentPage: number, totalPages: number): 'not-started' | 'in-progress' | 'completed' {
    if (currentPage <= 0) return 'not-started';
    if (totalPages > 0 && currentPage >= totalPages) return 'completed';
    return 'in-progress';
  }

  /**
   * Update or create a reading session for a user and book.
   */
  updateProgress(dto: UpdateProgressDto) {
    // Ensure user and book exist
    // Validate user exists
    if (!this.db.findUserById(dto.userId)) {
      throw new NotFoundException('User not found');
    }
    const book: any = this.booksService.findOne(dto.bookId);

    let session = this.db
      .getReadingSessions()
      .find((s: any) => s.userId === dto.userId && s.bookId === dto.bookId);

    const normalized =
      dto.status === 'want-to-read'
        ? { currentPage: 0, status: 'want-to-read' as const }
        : { currentPage: dto.currentPage, status: dto.status ?? this.deriveStatus(dto.currentPage, book.totalPages) };

    if (session) {
      session.currentPage = normalized.currentPage;
      (session as any).status = normalized.status;
      (session as any).updatedAt = new Date().toISOString();
    } else {
      session = { userId: dto.userId, bookId: dto.bookId, currentPage: normalized.currentPage, status: normalized.status, updatedAt: new Date().toISOString() };
      this.db.getReadingSessions().push(session);
    }
    return session;
  }

  /**
   * Get reading progress for a specific book across all users.
   */
  getProgressByBook(bookId: string) {
    this.booksService.findOne(bookId);
    const sessions = this.db.getReadingSessions().filter((s: any) => String((s as any).bookId) === String(bookId));
    return sessions.map(s => ({
      user: this.db.findUserById(s.userId),
      currentPage: s.currentPage,
    }));
  }

  /**
   * Get all reading sessions for a specific user (friend viewing).
   */
  findAllForUser(userId: string) {
    if (!this.db.findUserById(userId)) throw new NotFoundException('User not found');
    return this.db.getReadingSessions().filter((s) => s.userId === userId);
  }

  getShelf(userId: string, query: FindShelfDto) {
    if (!this.db.findUserById(userId)) throw new NotFoundException('User not found');
    const books = this.db.getBooks();
    const byId = new Map(books.map((b: any) => [String((b as any).id), b]));

    let items = this.findAllForUser(userId).map((s: any) => {
      const book = byId.get(String((s as any).bookId))! as any;
      const total = book.totalPages || 0;
      const status = (s as any).status ?? this.deriveStatus(s.currentPage, total);
      const progress = total ? s.currentPage / total : 0;
      return {
        bookId: book.id,
        title: book.title,
        author: book.author,
        totalPages: total,
        currentPage: s.currentPage,
        status,
        progress,
        updatedAt: (s as any).updatedAt ?? null,
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
