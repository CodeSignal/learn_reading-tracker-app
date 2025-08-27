// src/database/mock-db.ts
import { hashPassword } from '../utils/auth.utils';

export interface User {
  id: number;
  name: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  friendIds: number[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  totalPages: number;
  publishDate?: string;
  uploadedAt: string;
}

export interface ReadingSession {
  userId: number;
  bookId: number;
  currentPage: number;
  status?: 'not-started' | 'in-progress' | 'completed' | 'want-to-read';
  updatedAt?: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  recipientId: number;
  status: 'pending' | 'accepted' | 'declined';
}

const adminPassword = 'admin';
const userPassword = 'user123';

function ensureUniqueUsers(arr: User[]): User[] {
  const seen = new Set<string>();
  const out: User[] = [];
  for (const u of arr) {
    if (seen.has(u.username)) continue;
    seen.add(u.username);
    out.push(u);
  }
  return out;
}

const seedUsers: User[] = [
  { id: 1, name: 'Admin', username: 'admin', passwordHash: hashPassword(adminPassword), role: 'admin', friendIds: [] },
  { id: 2, name: 'Alice', username: 'alice', passwordHash: hashPassword(userPassword), role: 'user', friendIds: [] },
];

export const users: User[] = ensureUniqueUsers(seedUsers);

export const books: Book[] = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', totalPages: 310, publishDate: '1937-09-21', uploadedAt: new Date().toISOString() },
  { id: 2, title: 'Dune', author: 'Frank Herbert', totalPages: 412, publishDate: '1965-08-01', uploadedAt: new Date().toISOString() },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', totalPages: 464, publishDate: '2008-08-01', uploadedAt: new Date().toISOString() },
  { id: 4, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', totalPages: 352, publishDate: '1999-10-30', uploadedAt: new Date().toISOString() },
  { id: 5, title: '1984', author: 'George Orwell', totalPages: 328, publishDate: '1949-06-08', uploadedAt: new Date().toISOString() },
  { id: 6, title: 'To Kill a Mockingbird', author: 'Harper Lee', totalPages: 281, publishDate: '1960-07-11', uploadedAt: new Date().toISOString() },
  { id: 7, title: 'The Name of the Wind', author: 'Patrick Rothfuss', totalPages: 662, publishDate: '2007-03-27', uploadedAt: new Date().toISOString() },
  { id: 8, title: 'Sapiens', author: 'Yuval Noah Harari', totalPages: 443, publishDate: '2011-01-01', uploadedAt: new Date().toISOString() },
];

export const readingSessions: ReadingSession[] = [
  { userId: 1, bookId: 1, currentPage: 50, status: 'in-progress', updatedAt: new Date().toISOString() },
  { userId: 2, bookId: 2, currentPage: 100, status: 'in-progress', updatedAt: new Date().toISOString() },
  { userId: 2, bookId: 3, currentPage: 0, status: 'want-to-read', updatedAt: new Date().toISOString() },
  { userId: 1, bookId: 4, currentPage: 352, status: 'completed', updatedAt: new Date().toISOString() },
];

export const friendRequests: FriendRequest[] = [];

