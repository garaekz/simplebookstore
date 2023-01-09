import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';
import { AuthorsService } from 'src/authors/authors.service';
import { GenresService } from 'src/genres/genres.service';
import { Author, AuthorSchema } from 'src/authors/schemas/author.schema';
import { Genre, GenreSchema } from 'src/genres/schemas/genre.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: Author.name, schema: AuthorSchema }]),
    MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }]),
  ],
  controllers: [BooksController],
  providers: [AuthorsService, BooksService, GenresService],
})
export class BooksModule {}
