import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BooksService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Create and store a new book.
   */
  create(createBookDto: CreateBookDto) {
    const books = this.db.getBooks();
    const newBook = {
      id: uuidv4(),
      ...createBookDto,
      uploadedAt: new Date().toISOString(),
    };
    books.push(newBook);
    return newBook;
  }

  /**
   * Get books with optional search/sort/pagination.
   */
  findAll(query: any) {
    const { q, sortBy, order = 'asc', page = 1, pageSize = 20 } = query;

    let items = [...this.db.getBooks()];

    if (q && String(q).trim().length) {
      const needle = String(q).trim().toLowerCase();
      items = items.filter(
        (b: any) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle),
      );
    }

    // Pre-compute average progress per book for sorting if requested
    let avgByBookId = new Map<string, number>();
    if (sortBy === 'avgProgress') {
      const sessions = this.db.getReadingSessions();
      const totals = new Map<string, { readers: number; current: number; totalPages: number }>();
      for (const b of items as any[]) totals.set((b as any).id, { readers: 0, current: 0, totalPages: (b as any).totalPages || 0 });
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
        const A = sortBy === 'avgProgress' ? (avgByBookId.get((a as any).id) as any) : String((a as any)[sortBy] ?? '').toLowerCase();
        const B = sortBy === 'avgProgress' ? (avgByBookId.get((b as any).id) as any) : String((b as any)[sortBy] ?? '').toLowerCase();
        if (typeof A === 'number' && typeof B === 'number') return A < B ? -1 * dir : A > B ? 1 * dir : 0;
        return String(A).localeCompare(String(B)) * dir;
      });
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, page, pageSize, total };
  }

  /**
   * Get a single book by ID.
   * @throws NotFoundException if book is not found.
   */
  findOne(id: string) {
    const book = this.db.getBooks().find((b: any) => String((b as any).id) === String(id));
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    return book;
  }

  /**
   * Update an existing book's information.
   */
  update(id: string, updateBookDto: UpdateBookDto) {
    const book = this.findOne(id);
    Object.assign(book, updateBookDto);
    return book;
  }

  /**
   * Remove a book by ID.
   */
  remove(id: string) {
    const books = this.db.getBooks();
    const index = books.findIndex((b: any) => String((b as any).id) === String(id));
    if (index === -1) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
    const [removedBook] = books.splice(index, 1);
    return removedBook;
  }

  getStats(bookId: string) {
    const book: any = this.findOne(bookId);
    const sessions = this.db.getReadingSessions().filter((s: any) => String((s as any).bookId) === String(bookId));
    const readers = sessions.length;
    const totalCurrent = sessions.reduce((acc: number, s: any) => acc + s.currentPage, 0);
    const avgCurrentPage = readers ? totalCurrent / readers : 0;
    const completed = sessions.filter((s: any) => book.totalPages && s.currentPage >= book.totalPages).length;
    const completionRate = readers ? completed / readers : 0;
    const avgProgressPct = readers && book.totalPages ? totalCurrent / (book.totalPages * readers) : 0;

    return { bookId, readers, avgCurrentPage, completionRate, avgProgressPct };
  }
}
