import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../utils/auth.utils';
import { ReadingService } from '../reading/reading.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService, private readonly reading: ReadingService) {}

  /**
   * Retrieve all users.
   */
  findAll() {
    return this.db.getUsers();
  }

  /**
   * Find a user by ID.
   * @throws NotFoundException if user does not exist.
   */
  findOne(id: string) {
    const user = this.db.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  /**
   * Create a new user with provided data.
   */
  create(createUserDto: CreateUserDto) {
    const users = this.db.getUsers();
    const id = uuidv4();
    let base = (createUserDto.name || `user`).toLowerCase().replace(/\s+/g, '');
    if (!base) base = `user${id}`;
    let username = base;
    let suffix = 1;
    const usernames = new Set(users.map(u => u.username));
    while (usernames.has(username)) {
      username = `${base}${suffix++}`;
    }
    const newUser = {
      id,
      name: createUserDto.name,
      username,
      passwordHash: hashPassword('changeme'),
      role: 'user' as const,
      friendIds: [] as string[],
    };
    users.push(newUser);
    return newUser;
  }

  /**
   * Update an existing user.
   */
  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id);
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const exists = this.db.getUsers().some(u => u.username === updateUserDto.username && u.id !== id);
      if (exists) {
        throw new BadRequestException('Username already exists');
      }
      user.username = updateUserDto.username;
    }
    if (typeof updateUserDto.name === 'string' && updateUserDto.name.length) {
      user.name = updateUserDto.name;
    }
    return user;
  }

  /**
   * Remove a user by ID.
   */
  remove(id: string) {
    const users = this.db.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const [removedUser] = users.splice(index, 1);
    return removedUser;
  }

  /**
   * Get a list of a user's friends (as full user objects).
   */
  findFriends(userId: string) {
    const user = this.findOne(userId);
    return user.friendIds.map(fid => this.findOne(fid));
  }

  getStats(userId: string) {
    this.findOne(userId);
    const sessions = this.reading.findAllForUser(userId);
    const books = this.db.getBooks() as any[];

    const totalPagesRead = sessions.reduce((sum: number, s: any) => sum + s.currentPage, 0);
    let booksCompleted = 0;
    let denom = 0;
    for (const s of sessions as any[]) {
      const b = books.find((bb: any) => bb.id === s.bookId);
      if (!b || !b.totalPages) continue;
      denom += b.totalPages;
      if (s.currentPage >= b.totalPages) booksCompleted += 1;
    }
    const avgProgressPct = denom > 0 ? totalPagesRead / denom : 0;

    return {
      userId,
      totalPagesRead,
      booksInShelf: sessions.length,
      booksCompleted,
      avgProgressPct,
    };
  }
}
