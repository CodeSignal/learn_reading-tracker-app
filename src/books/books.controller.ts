import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import { FindAllBooksDto } from './dto/find-all-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @AdminOnly()
  // Create a new book entry (admin only)
  create(@Body() createBookDto: CreateBookDto) {
    const data = this.booksService.create(createBookDto);
    return { success: true, data };
  }

  @Get()
  // Retrieve books with search/sort/pagination
  findAll(@Query() query: FindAllBooksDto) {
    const data = this.booksService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  // Retrieve a specific book by ID
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.booksService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/stats')
  // Get aggregated stats for a book
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.booksService.getStats(id);
    return { success: true, data };
  }

  @Patch(':id')
  @AdminOnly()
  // Update a book's data (admin only)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const data = this.booksService.update(id, updateBookDto);
    return { success: true, data };
  }

  @Delete(':id')
  @AdminOnly()
  // Remove a book by ID (admin only)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.booksService.remove(id);
    return { success: true, data };
  }
}
