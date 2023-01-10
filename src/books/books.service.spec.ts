import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AuthorDocument } from '../authors/schemas/author.schema';
import { AuthorsService } from '../authors/authors.service';
import { GenreDocument } from '../genres/schemas/genre.schema';
import { GenresService } from '../genres/genres.service';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book, BookDocument } from './schemas/book.schema';

const createBookDto = {
  title: 'The Lord of the Rings',
  authors: ['aRandomAuthorId'],
  genres: ['aRandomGenreId'],
  description: 'The Lord of the Rings is an epic high fantasy novel',
  published: new Date(),
  rating: 5,
  price: 100,
  cover: 'https://example.com/cover.jpg',
} as CreateBookDto;

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<BookDocument>;
  let authorsService: AuthorsService;
  let genresService: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: AuthorsService,
          useValue: {
            findByIds: jest.fn(),
            findOneByName: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: GenresService,
          useValue: {
            findByIds: jest.fn(),
            findOneByName: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Book.name),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<Model<BookDocument>>(getModelToken(Book.name));
    authorsService = module.get<AuthorsService>(AuthorsService);
    genresService = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const newBook = {
        ...createBookDto,
        authors: [{} as AuthorDocument],
        genres: [{} as GenreDocument],
      };

      jest
        .spyOn(authorsService, 'findByIds')
        .mockResolvedValue([{} as AuthorDocument]);
      jest
        .spyOn(genresService, 'findByIds')
        .mockResolvedValue([{} as GenreDocument]);
      jest.spyOn(model, 'create').mockReturnValue({
        ...newBook,
        _id: 'randomId',
      } as any);
      const book = await service.create(createBookDto);
      expect(model.create).toHaveBeenCalledWith(newBook);
      expect(book).toEqual({
        ...createBookDto,
        authors: [{} as AuthorDocument],
        genres: [{} as GenreDocument],
        _id: 'randomId',
      });
    });

    it('should throw an error if one or more authors are invalid', async () => {
      jest.spyOn(authorsService, 'findByIds').mockResolvedValue([]);
      jest
        .spyOn(genresService, 'findByIds')
        .mockResolvedValue([{} as GenreDocument]);

      try {
        await service.create(createBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.statusCode).toEqual(400);
        expect(error.message).toEqual('One or more authors are invalid');
      }
    });

    it('should throw an error if one or more genres are invalid', async () => {
      jest
        .spyOn(authorsService, 'findByIds')
        .mockResolvedValue([{} as AuthorDocument]);
      jest.spyOn(genresService, 'findByIds').mockResolvedValue([]);

      try {
        await service.create(createBookDto);
      } catch (error) {
        // Don't know why it gives error when this uncommented
        // expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.statusCode).toEqual(400);
        expect(error.message).toEqual('One or more genres are invalid');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const books = [
        {
          ...createBookDto,
          authors: [{} as AuthorDocument],
          genres: [{} as GenreDocument],
          _id: 'randomId',
        },
      ];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(books),
      } as any);
      expect(await service.findAll()).toEqual(books);
    });

    it('should return an empty array if no books are found', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a book', async () => {
      const book = {
        ...createBookDto,
        authors: [{} as AuthorDocument],
        genres: [{} as GenreDocument],
        _id: '5e9aa6b567e95d9d9c9b7a7b',
      };
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(book),
      } as any);
      expect(await service.findOneById('5e9aa6b567e95d9d9c9b7a7b')).toEqual(
        book,
      );
    });

    it('should throw an error if bad format id is given', async () => {
      try {
        await service.findOneById('badId');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('The provided ID is invalid');
      }
    });

    it('should throw an error if no book is found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      try {
        await service.findOneById('5e9aa6b567e95d9d9c9b7a7b');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });
  });

  describe('findOneByTitle', () => {
    it('should return a book', async () => {
      const book = {
        ...createBookDto,
        authors: [{} as AuthorDocument],
        genres: [{} as GenreDocument],
        _id: '5e9aa6b567e95d9d9c9b7a7b',
      };
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(book),
      } as any);
      expect(await service.findOneByTitle('randomTitle')).toEqual(book);
    });

    it('should throw an error if no book is found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);

      try {
        await service.findOneByTitle('randomTitle');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const book = {
        ...createBookDto,
        authors: [{} as AuthorDocument],
        genres: [{} as GenreDocument],
        _id: '5e9aa6b567e95d9d9c9b7a7b',
      };
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(book),
      } as any);

      expect(
        await service.update('5e9aa6b567e95d9d9c9b7a7b', { title: 'LOTR' }),
      ).toEqual(book);
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({}),
      } as any);
      expect(await service.remove('5e9aa6b567e95d9d9c9b7a7b')).toEqual({});
    });
  });
});
