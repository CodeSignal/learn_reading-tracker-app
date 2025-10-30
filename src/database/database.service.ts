import { Injectable } from '@nestjs/common';
import { users, books, readingSessions, friendRequests, User, Book, ReadingSession, FriendRequest } from './mock-db';

@Injectable()
export class DatabaseService {
  private readonly users: User[] = users;
  private readonly books: Book[] = books;
  private readonly readingSessions: ReadingSession[] = readingSessions;
  private readonly friendRequests: FriendRequest[] = friendRequests;

  /**
   * Retrieve all users.
   */
  getUsers(): User[] {
    return this.users;
  }

  /**
   * Find a user by its ID.
   */
  findUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  /**
   * Retrieve all books.
   */
  getBooks(): Book[] {
    return this.books;
  }

  /**
   * Find a book by its ID.
   */
  findBookById(id: string): Book | undefined {
    return this.books.find(book => book.id === id);
  }

  /**
   * Retrieve all reading sessions.
   */
  getReadingSessions(): ReadingSession[] {
    return this.readingSessions;
  }

  /**
   * Retrieve all friend requests.
   */
  getFriendRequests(): FriendRequest[] {
    return this.friendRequests;
  }
}
