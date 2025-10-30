// src/database/mock-db.ts
import { hashPassword } from '../utils/auth.utils';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // hashed password (bcrypt)
  role: 'user' | 'admin';
  friendIds: string[]; // NEW: list of confirmed friend user IDs
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  publishDate?: string; // ISO 8601
  uploadedAt: string;   // ISO 8601
}

export interface ReadingSession {
  userId: string;
  bookId: string;
  currentPage: number;
  status?: 'not-started' | 'in-progress' | 'completed' | 'want-to-read';
  updatedAt?: string; // ISO 8601
}

// NEW: Friend request structure
export interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
}

// Seed users with an admin account and a sample user
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

const adminId = uuidv4();
const aliceId = uuidv4();

const seedUsers: User[] = [
  { id: adminId, name: 'Admin', username: 'admin', passwordHash: hashPassword(adminPassword), role: 'admin', friendIds: [] },
  { id: aliceId, name: 'Alice', username: 'alice', passwordHash: hashPassword(userPassword), role: 'user', friendIds: [] },
];

export const users: User[] = ensureUniqueUsers(seedUsers);

// Enriched book seed data with analytics-friendly fields.
export const books: Book[] = [
  {
    id: uuidv4(),
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    totalPages: 310,
    publishDate: '1937-09-21',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Dune',
    author: 'Frank Herbert',
    totalPages: 412,
    publishDate: '1965-08-01',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Clean Code',
    author: 'Robert C. Martin',
    totalPages: 464,
    publishDate: '2008-08-01',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    totalPages: 352,
    publishDate: '1999-10-30',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: '1984',
    author: 'George Orwell',
    totalPages: 328,
    publishDate: '1949-06-08',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    totalPages: 281,
    publishDate: '1960-07-11',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    totalPages: 662,
    publishDate: '2007-03-27',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    totalPages: 443,
    publishDate: '2011-01-01',
    uploadedAt: new Date().toISOString(),
  },
];

// Seed reading sessions include status and timestamps
export const readingSessions: ReadingSession[] = [
  { userId: adminId, bookId: books[0].id, currentPage: 50, status: 'in-progress', updatedAt: new Date().toISOString() },
  { userId: aliceId, bookId: books[1].id, currentPage: 100, status: 'in-progress', updatedAt: new Date().toISOString() },
  { userId: aliceId, bookId: books[2].id, currentPage: 0, status: 'want-to-read', updatedAt: new Date().toISOString() },
  { userId: adminId, bookId: books[3].id, currentPage: 352, status: 'completed', updatedAt: new Date().toISOString() },
];

// NEW: in-memory friend requests store
export const friendRequests: FriendRequest[] = [];
