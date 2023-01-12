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
import { generateUniqueSlug } from '../utils/generate-unique-slug';
import { AuthorDocument } from '../authors/schemas/author.schema';
import { GenreDocument } from '../genres/schemas/genre.schema';
import { calculateDiscountedPrice, roundNum } from 'src/utils/math';

interface NewBook {
  title: string;
  slug: string;
  saga?: string;
  sagaNumber?: number;
  description: string;
  authors: AuthorDocument[];
  genres: GenreDocument[];
  published: Date;
  rating: number;
  price: number;
  cover: string;
  discount?: number;
  discountedPrice?: number;
}

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
    private readonly authorsService: AuthorsService,
    private readonly genresService: GenresService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<BookDocument> {
    try {
      const authors = await this.authorsService.findByIds(
        createBookDto.authors,
      );
      const genres = await this.genresService.findByIds(createBookDto.genres);

      if (!authors || authors.length !== createBookDto.authors.length) {
        throw new BadRequestException('One or more authors are invalid');
      }

      if (!genres || genres.length !== createBookDto.genres.length) {
        throw new BadRequestException('One or more genres are invalid');
      }

      createBookDto.slug = await generateUniqueSlug(
        this.bookModel,
        createBookDto.title,
      );

      const bookPayload = {
        ...createBookDto,
        authors,
        genres,
      } as NewBook;

      if (createBookDto.discount && createBookDto.discount > 0) {
        const discountedPrice = calculateDiscountedPrice(
          createBookDto.price,
          createBookDto.discount,
        );
        bookPayload.discountedPrice = roundNum(discountedPrice, 2);
      }

      return await this.bookModel.create(bookPayload);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<BookDocument[]> {
    return await this.bookModel.find().exec();
  }

  async findFeatured(field: string, limit = 5): Promise<Book[]> {
    return this.bookModel
      .find()
      .sort({ [field]: -1 })
      .limit(limit)
      .exec();
  }

  async findOneByTitle(title: string): Promise<BookDocument> {
    return await this.bookModel.findOne({ title }).exec();
  }

  async findOneById(id: string): Promise<BookDocument> {
    if (!id || !ObjectId.isValid(id)) {
      throw new BadRequestException('The provided ID is invalid');
    }
    const book = await this.bookModel.findById(id).exec();

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string): Promise<BookDocument> {
    return await this.bookModel.findByIdAndDelete(id).exec();
  }
}
