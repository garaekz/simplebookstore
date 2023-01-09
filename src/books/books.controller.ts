import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    try {
      const book = await this.booksService.findOneByTitle(createBookDto.title);
      if (book) {
        throw new BadRequestException('Book already exists');
      }
      const newBook = await this.booksService.create(createBookDto);
      return {
        statusCode: 201,
        message: 'Book created successfully',
        data: newBook,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  @Get()
  async findAll() {
    try {
      const books = await this.booksService.findAll();
      return {
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: books,
      };
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const book = await this.booksService.findOneById(id);
      return {
        statusCode: 200,
        message: 'Book retrieved successfully',
        data: book,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    try {
      const book = await this.booksService.update(id, updateBookDto);

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      return {
        statusCode: 200,
        message: 'Book updated successfully',
        data: book,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const book = await this.booksService.remove(id);

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      return {
        statusCode: 200,
        message: 'Book deleted successfully',
        data: book,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
