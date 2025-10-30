import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users/users.service';
import { ReadingService } from '../reading/reading.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FriendsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly users: UsersService,
    private readonly reading: ReadingService,
  ) {}

  requestFriend(senderId: string, recipientId: string) {
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send a friend request to yourself.');
    }
    this.users.findOne(senderId);
    this.users.findOne(recipientId);

    const requests = this.db.getFriendRequests();
    const alreadyPending = requests.some(
      (r) => r.senderId === senderId && r.recipientId === recipientId && r.status === 'pending',
    );
    if (alreadyPending) {
      throw new BadRequestException('A pending request already exists.');
    }

    const id = uuidv4();
    const newReq = { id, senderId, recipientId, status: 'pending' as const };
    requests.push(newReq);
    return newReq;
  }

  getIncomingRequests(userId: string) {
    return this.db
      .getFriendRequests()
      .filter((r) => r.recipientId === userId && r.status === 'pending');
  }

  handleRequest(actingUserId: string, requestId: string, status: 'accepted' | 'declined') {
    const req = this.db.getFriendRequests().find((r) => r.id === requestId);
    if (!req) throw new NotFoundException('Friend request not found.');
    if (req.status !== 'pending') throw new BadRequestException('Request already handled.');
    if (req.recipientId !== actingUserId)
      throw new ForbiddenException('Only the recipient can act on this request.');

    req.status = status;

    if (status === 'accepted') {
      const sender = this.users.findOne(req.senderId);
      const recipient = this.users.findOne(req.recipientId);
      if (!sender.friendIds.includes(recipient.id)) sender.friendIds.push(recipient.id);
      if (!recipient.friendIds.includes(sender.id)) recipient.friendIds.push(sender.id);
    }
    return req;
  }

  getFriendProgress(requesterId: string, friendId: string) {
    const requester = this.users.findOne(requesterId);
    if (!requester.friendIds.includes(friendId)) {
      throw new ForbiddenException('You can only view progress of your friends.');
    }
    return this.reading.findAllForUser(friendId);
  }
}
