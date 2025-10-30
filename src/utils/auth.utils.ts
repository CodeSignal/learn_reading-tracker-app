// src/auth/auth.util.ts
import * as fs from 'fs';
import * as path from 'path';
import type { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

/**
 * Password utilities (moved from mock-db.ts)
 * Uses bcrypt for hashing and verification.
 */
const BCRYPT_ROUNDS = 10; // reasonable default for demos

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  return bcrypt.hashSync(password, salt);
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch {
    return false;
  }
}

/** Utilities for persisting user seeds (existing code) */
export function toTsLiteral(obj: any): string {
  const q = (s: string) => JSON.stringify(String(s));
  const friendIds = Array.isArray(obj.friendIds) ? `[${obj.friendIds.map((id: any) => q(String(id))).join(', ')}]` : '[]';
  const id = q(String(obj.id));
  return `{ id: ${id}, name: ${q(obj.name)}, username: ${q(
    obj.username
  )}, passwordHash: ${q(obj.passwordHash)}, role: ${q(obj.role)}, friendIds: ${friendIds} }`;
}

export function persistUserSeed(db: DatabaseService) {
  try {
    const projectRoot = path.join(__dirname, '..', '..');
    const filePath = path.join(projectRoot, 'src', 'database', 'mock-db.ts');
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /export const users: User\[\] = \[([\s\S]*?)\];/m;
    if (!regex.test(content)) return;
    const arr = db.getUsers().map((u: any) => toTsLiteral(u)).join(',\n  ');
    const replacement = `export const users: User[] = [\n  ${arr}\n];`;
    const updated = content.replace(regex, replacement);
    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
  } catch {
    // ignore persistence errors
  }
}
