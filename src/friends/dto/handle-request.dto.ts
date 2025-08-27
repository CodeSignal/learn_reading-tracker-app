import { IsEnum } from 'class-validator';

export class HandleRequestDto {
  @IsEnum(['accepted', 'declined'])
  status!: 'accepted' | 'declined';
}

