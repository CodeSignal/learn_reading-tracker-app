import { IsInt } from 'class-validator';

export class CreateFriendRequestDto {
  @IsInt()
  recipientId!: number;
}

