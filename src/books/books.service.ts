import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorsService } from '../authors/authors.service';
import { GenresService } from '../genres/genres.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
    private readonly authorsService: AuthorsService,
    private readonly genresService: GenresService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<BookDocument> {
    const authors = await this.authorsService.findByIds(createBookDto.authors);
    const genres = await this.genresService.findByIds(createBookDto.genres);

    if (!authors || authors.length !== createBookDto.authors.length) {
      throw new BadRequestException('One or more authors are invalid');
    }

    if (!genres || genres.length !== createBookDto.genres.length) {
      throw new BadRequestException('One or more genres are invalid');
    }

    const book = await this.bookModel.create({
      ...createBookDto,
      authors,
      genres,
    });
    return book;
  }

  async findAll(): Promise<BookDocument[]> {
    return await this.bookModel.find().exec();
  }

  async findOneByTitle(title: string): Promise<BookDocument> {
    return await this.bookModel.findOne({ title });
  }

  async findOneById(id: string): Promise<BookDocument> {
    if (!id || !ObjectId.isValid(id)) {
      throw new NotFoundException('Book not found');
    }

    const book = await this.bookModel.findById(id);

    // I should find a way to not repeat this exception
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return await this.bookModel.findByIdAndUpdate(id, updateBookDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<BookDocument> {
    return await this.bookModel.findByIdAndDelete(id);
  }
}
