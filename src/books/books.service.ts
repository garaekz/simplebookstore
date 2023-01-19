import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthorsService } from '../authors/authors.service';
import { GenresService } from '../genres/genres.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { ObjectId } from 'mongodb';
import { generateUniqueSlug } from '../utils/generate-unique-slug';
import { calculateDiscountedPrice, roundNum } from '../utils/math';
import { CreateBookPayload } from '../types/book.types';

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
      } as CreateBookPayload;

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

  async findAll(
    page: number,
    genre?: string,
    author?: string,
    search?: string,
    sort?: string,
  ): Promise<{
    data: BookDocument[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      perPage: number;
    };
  }> {
    const limit = 9;
    const query = {};
    if (genre) query['genres.slug'] = genre;
    if (author) query['authors.slug'] = author;
    if (search) query['title'] = { $regex: search, $options: 'i' };

    let sortOrder;
    switch (sort) {
      case 'newest':
        sortOrder = { createdAt: -1 };
      case 'title':
        sortOrder = { title: 1 };
        break;
      case 'pricehigh':
        sortOrder = { price: -1 };
        break;
      case 'pricelow':
        sortOrder = { price: 1 };
        break;
      case 'discount':
        sortOrder = { discount: -1 };
        break;
      case 'rating':
        sortOrder = { rating: -1 };
        break;
      case 'newPublished':
        sortOrder = { published: -1 };
        break;
      default:
        sortOrder = { createdAt: -1 };
        break;
    }

    const books = await this.bookModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authors genres')
      .sort(sortOrder)
      .exec();
    const totalBooks = await this.bookModel.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);
    return {
      data: books,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBooks,
        perPage: limit,
      },
    };
  }

  async findFeatured(field: string, limit = 5): Promise<Book[]> {
    return this.bookModel
      .find()
      .sort({ [field]: -1 })
      .limit(limit)
      .exec();
  }

  async findRelatedBooks(bookId: string): Promise<Book[]> {
    const book = await this.bookModel.findById(new ObjectId(bookId)).exec();
    const authorsId = book.authors.map((author) => author._id);
    const genresId = book.genres.map((genre) => genre._id);
    const books = await this.bookModel
      .find({
        $or: [
          { 'authors._id': { $in: authorsId } },
          { 'genres._id': { $in: genresId } },
        ],
        _id: { $ne: new ObjectId(bookId) },
      })
      .limit(6);
    return books;
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

  async findOneBySlug(slug: string): Promise<BookDocument> {
    const book = await this.bookModel.findOne({ slug }).exec();

    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    try {
      if (!id || !ObjectId.isValid(id)) {
        throw new BadRequestException('The provided ID is invalid');
      }

      const book = await this.bookModel.findById(id);
      if (!book) {
        throw new NotFoundException('Book not found');
      }

      const updatedBook = await this.bookModel.findByIdAndUpdate(
        id,
        updateBookDto,
        { new: true },
      );

      if (updateBookDto.discount && updateBookDto.discount > 0) {
        const discountedPrice = calculateDiscountedPrice(
          updateBookDto.price,
          updateBookDto.discount,
        );
        updatedBook.discountedPrice = roundNum(discountedPrice, 2);
      }

      if (updateBookDto.authors) {
        const authors = await this.authorsService.findByIds(
          updateBookDto.authors,
        );
        if (!authors) {
          throw new BadRequestException('One or more authors are invalid');
        }
        updatedBook.authors = authors;
      }

      if (updateBookDto.genres) {
        const genres = await this.genresService.findByIds(updateBookDto.genres);
        if (!genres) {
          throw new BadRequestException('One or more genres are invalid');
        }
        updatedBook.genres = genres;
      }

      return await updatedBook.save();
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<BookDocument> {
    return await this.bookModel.findByIdAndDelete(id).exec();
  }
}
