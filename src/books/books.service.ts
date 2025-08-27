import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly db: DatabaseService) {}

  create(createBookDto: CreateBookDto) {
    const books = this.db.getBooks();
    const newBook = {
      id: books.length ? Math.max(...books.map((b: any) => b.id)) + 1 : 1,
      ...createBookDto,
      uploadedAt: new Date().toISOString(),
    } as any;
    books.push(newBook);
    return newBook;
  }

  findAll(query: any) {
    const { q, sortBy, order = 'asc', page = 1, pageSize = 20 } = query;
    let items = [...this.db.getBooks()];
    if (q && String(q).trim().length) {
      const needle = String(q).trim().toLowerCase();
      items = items.filter(
        (b: any) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle),
      );
    }

    let avgByBookId = new Map<number, number>();
    if (sortBy === 'avgProgress') {
      const sessions = this.db.getReadingSessions();
      const totals = new Map<number, { readers: number; current: number; totalPages: number }>();
      for (const b of items as any[])
        totals.set(b.id, { readers: 0, current: 0, totalPages: (b as any).totalPages || 0 });
      for (const s of sessions as any[]) {
        const agg = totals.get((s as any).bookId);
        if (!agg || !agg.totalPages) continue;
        agg.readers += 1;
        agg.current += (s as any).currentPage;
      }
      avgByBookId = new Map(
        [...totals.entries()].map(([bookId, t]) => [bookId, t.readers ? t.current / (t.totalPages * t.readers) : 0]),
      );
    }

    if (sortBy) {
      const dir = order === 'asc' ? 1 : -1;
      items.sort((a: any, b: any) => {
        const A = sortBy === 'avgProgress' ? (avgByBookId.get(a.id) as any) : String(a[sortBy] ?? '').toLowerCase();
        const B = sortBy === 'avgProgress' ? (avgByBookId.get(b.id) as any) : String(b[sortBy] ?? '').toLowerCase();
        if (typeof A === 'number' && typeof B === 'number') return A < B ? -1 * dir : A > B ? 1 * dir : 0;
        return String(A).localeCompare(String(B)) * dir;
      });
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, page, pageSize, total };
  }

  findOne(id: number) {
    const book = this.db.getBooks().find((b: any) => b.id === id);
    if (!book) throw new NotFoundException(`Book with ID ${id} not found.`);
    return book;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    const book = this.findOne(id);
    Object.assign(book, updateBookDto);
    return book;
  }

  remove(id: number) {
    const books = this.db.getBooks();
    const index = books.findIndex((b: any) => b.id === id);
    if (index === -1) throw new NotFoundException(`Book with ID ${id} not found.`);
    const [removed] = books.splice(index, 1);
    return removed;
  }

  getStats(bookId: number) {
    const book: any = this.findOne(bookId);
    const sessions = this.db.getReadingSessions().filter((s: any) => s.bookId === bookId);
    const readers = sessions.length;
    const totalCurrent = sessions.reduce((acc: number, s: any) => acc + s.currentPage, 0);
    const avgCurrentPage = readers ? totalCurrent / readers : 0;
    const completed = sessions.filter((s: any) => book.totalPages && s.currentPage >= book.totalPages).length;
    const completionRate = readers ? completed / readers : 0;
    const avgProgressPct = readers && book.totalPages ? totalCurrent / (book.totalPages * readers) : 0;
    return { bookId, readers, avgCurrentPage, completionRate, avgProgressPct };
  }
}

