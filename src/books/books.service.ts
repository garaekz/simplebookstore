import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorsService } from 'src/authors/authors.service';
import { GenresService } from 'src/genres/genres.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schemas/book.schema';

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

  async findOne(id: string): Promise<BookDocument> {
    return await this.bookModel.findById(id).exec();
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookDocument> {
    return await this.bookModel.findByIdAndUpdate(id, updateBookDto);
  }

  async remove(id: string): Promise<BookDocument> {
    return await this.bookModel.findByIdAndDelete(id);
  }
}
