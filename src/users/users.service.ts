import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../utils/auth.utils';
import { ReadingService } from '../reading/reading.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService, private readonly reading: ReadingService) {}

  findAll() {
    return this.db.getUsers();
  }

  findOne(id: number) {
    const user = this.db.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const users = this.db.getUsers();
    const id = Math.max(0, ...users.map((u) => u.id)) + 1;
    let base = (createUserDto.name || `user${id}`).toLowerCase().replace(/\s+/g, '');
    if (!base) base = `user${id}`;
    let username = base;
    let suffix = 1;
    const usernames = new Set(users.map((u) => u.username));
    while (usernames.has(username)) {
      username = `${base}${suffix++}`;
    }
    const newUser = {
      id,
      name: createUserDto.name,
      username,
      passwordHash: hashPassword('changeme'),
      role: 'user' as const,
      friendIds: [] as number[],
    };
    users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id);
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const exists = this.db.getUsers().some((u) => u.username === updateUserDto.username && u.id !== id);
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

  remove(id: number) {
    const users = this.db.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    const [removedUser] = users.splice(index, 1);
    return removedUser;
  }

  findFriends(userId: number) {
    const user = this.findOne(userId);
    return user.friendIds.map((fid) => this.findOne(fid));
  }

  getStats(userId: number) {
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

