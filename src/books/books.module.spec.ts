import { BooksModule } from './books.module';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Author } from '../authors/schemas/author.schema';
import { Book } from './schemas/book.schema';
import { Genre } from '../genres/schemas/genre.schema';
import { AuthorsService } from '../authors/authors.service';
import { BooksService } from './books.service';
import { GenresService } from '../genres/genres.service';

describe('BooksModule', () => {
  let module: TestingModule;
  let authorsService: AuthorsService;
  let booksService: BooksService;
  let genresService: GenresService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [BooksModule],
    })
      .overrideProvider(getModelToken(Author.name))
      .useValue({})
      .overrideProvider(getModelToken(Book.name))
      .useValue({})
      .overrideProvider(getModelToken(Genre.name))
      .useValue({})
      .overrideProvider(AuthorsService)
      .useValue({
        findAll: jest.fn(),
      })
      .overrideProvider(BooksService)
      .useValue({
        findAll: jest.fn(),
      })
      .overrideProvider(GenresService)
      .useValue({
        findAll: jest.fn(),
      })
      .compile();

    authorsService = module.get<AuthorsService>(AuthorsService);
    booksService = module.get<BooksService>(BooksService);
    genresService = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(authorsService).toBeDefined();
    expect(booksService).toBeDefined();
    expect(genresService).toBeDefined();
  });
});
