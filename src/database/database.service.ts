import { Injectable } from '@nestjs/common';
import { users, books, readingSessions, friendRequests, User, Book, ReadingSession, FriendRequest } from './mock-db';

@Injectable()
export class DatabaseService {
  getUsers(): User[] {
    return users;
  }

  getBooks(): Book[] {
    return books;
  }

  getReadingSessions(): ReadingSession[] {
    return readingSessions;
  }

  getFriendRequests(): FriendRequest[] {
    return friendRequests;
  }

  findUserById(id: number): User | undefined {
    return users.find((u) => u.id === id);
  }
}

