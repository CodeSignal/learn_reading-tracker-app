import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsISO8601 } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsInt()
  @Min(1)
  totalPages!: number;

  @IsOptional()
  @IsISO8601()
  publishDate?: string;
}
