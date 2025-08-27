import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { hashPassword, verifyPassword } from '../utils/auth.utils';
import { signJwt } from './jwt.util';
import { persistUserSeed } from '../utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(name: string, username: string, password: string) {
    if (!name || !username || !password) {
      throw new BadRequestException('Missing required fields');
    }
    const users = this.db.getUsers();
    const exists = users.some((u) => u.username === username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }
    const id = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUser = {
      id,
      name,
      username,
      passwordHash: hashPassword(password),
      role: 'user' as const,
      friendIds: [] as number[],
    };
    this.db.getUsers().push(newUser);
    persistUserSeed(this.db);
    return { message: 'User registered successfully' };
  }

  async login(username: string, password: string) {
    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = this.db.getUsers().find((u) => u.username === username);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = signJwt({ sub: user.id, role: user.role }, 60 * 60);
    return { access_token };
  }
}

