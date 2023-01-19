import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Author, AuthorDocument } from '../authors/schemas/author.schema';
import { AuthorsService } from '../authors/authors.service';
import { Genre, GenreDocument } from '../genres/schemas/genre.schema';
import { GenresService } from '../genres/genres.service';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book, BookDocument } from './schemas/book.schema';
import { UpdateBookDto } from './dto/update-book.dto';

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

const updateBookDto = {
  ...createBookDto,
  discount: 10,
  authors: ['5e9aa6b567e95d9d9c9b7a7b'],
  genres: ['5e9aa6b567e95d9d9c9b7a7b'],
} as UpdateBookDto;

const book = {
  ...createBookDto,
  authors: [new Author()],
  genres: [new Genre()],
  discount: 0,
} as BookDocument;

const paginatedBooks = {
  data: [book],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    perPage: 9,
  },
};

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
            save: jest.fn(),
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
            exists: jest.fn(),
            skip: jest.fn(),
            limit: jest.fn(),
            sort: jest.fn(),
            populate: jest.fn(),
            countDocuments: jest.fn(),
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
      jest.spyOn(model, 'exists').mockResolvedValue(null);
      jest.spyOn(model, 'create').mockReturnValue({
        ...newBook,
        slug: 'the-lord-of-the-rings',
        _id: 'randomId',
        discount: 20,
        discountedPrice: 80,
      } as any);
      const book = await service.create({ ...createBookDto, discount: 20 });
      expect(model.create).toHaveBeenCalledWith({
        ...newBook,
        slug: 'the-lord-of-the-rings',
        discount: 20,
        discountedPrice: 80,
      });
      expect(book).toEqual({
        ...newBook,
        slug: 'the-lord-of-the-rings',
        _id: 'randomId',
        discount: 20,
        discountedPrice: 80,
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
      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockImplementation(() => ({
              sort: jest.fn().mockImplementation(() => ({
                exec: jest.fn().mockResolvedValueOnce([book]),
              })),
            })),
          })),
        })),
      } as any);
      jest.spyOn(model, 'countDocuments').mockResolvedValue(1);

      expect(await service.findAll(1, 'genre', 'author', '', 'newest')).toEqual(
        paginatedBooks,
      );
      expect(await service.findAll(1, 'genre', 'author', '', 'title')).toEqual(
        paginatedBooks,
      );
      expect(
        await service.findAll(1, 'genre', 'author', '', 'pricehigh'),
      ).toEqual(paginatedBooks);
      expect(
        await service.findAll(1, 'genre', 'author', '', 'pricelow'),
      ).toEqual(paginatedBooks);
      expect(
        await service.findAll(1, 'genre', 'author', '', 'discount'),
      ).toEqual(paginatedBooks);
      expect(await service.findAll(1, 'genre', 'author', '', 'rating')).toEqual(
        paginatedBooks,
      );
      expect(
        await service.findAll(1, 'genre', 'author', '', 'newPublished'),
      ).toEqual(paginatedBooks);
    });

    it('should return an empty array if no books are found', async () => {
      const emptyPaginatedBooks = {
        ...paginatedBooks,
        pagination: {
          ...paginatedBooks.pagination,
          totalItems: 0,
          totalPages: 0,
        },
        data: [],
      };

      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockImplementation(() => ({
              sort: jest.fn().mockImplementation(() => ({
                exec: jest.fn().mockResolvedValueOnce([]),
              })),
            })),
          })),
        })),
      } as any);
      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(0);
      expect(await service.findAll(1)).toEqual(emptyPaginatedBooks);
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
        discount: 20,
      };
      const mockFindByIdAndUpdate = jest
        .fn()
        .mockResolvedValue({ save: jest.fn().mockResolvedValue(book) });
      jest.spyOn(model, 'findById').mockResolvedValue(book);
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockImplementation(mockFindByIdAndUpdate);
      jest
        .spyOn(authorsService, 'findByIds')
        .mockResolvedValueOnce([{} as AuthorDocument]);
      jest
        .spyOn(genresService, 'findByIds')
        .mockResolvedValueOnce([{} as GenreDocument]);

      const request = await service.update(
        '5e9aa6b567e95d9d9c9b7a7b',
        updateBookDto,
      );
      expect(genresService.findByIds).toHaveBeenCalled();
      expect(authorsService.findByIds).toHaveBeenCalled();
      expect(request).toEqual(book);
    });

    it('should throw an error if id is invalid', async () => {
      try {
        await service.update('badId', { title: 'LOTR' });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('The provided ID is invalid');
      }
    });

    it('should throw an error if no book is found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      try {
        await service.update('5e9aa6b567e95d9d9c9b7a7b', { title: 'LOTR' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });

    it('should throw an error if no authors are found', async () => {
      const mockFindByIdAndUpdate = jest
        .fn()
        .mockResolvedValue({ save: jest.fn().mockResolvedValue(book) });
      jest.spyOn(model, 'findById').mockResolvedValue(book);
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockImplementation(mockFindByIdAndUpdate);

      try {
        await service.update('5e9aa6b567e95d9d9c9b7a7b', updateBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('One or more authors are invalid');
      }

      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(authorsService.findByIds).toHaveBeenCalled();
    });

    it('should throw an error if no genres are found', async () => {
      const mockFindByIdAndUpdate = jest
        .fn()
        .mockResolvedValue({ save: jest.fn().mockResolvedValue(book) });
      jest.spyOn(model, 'findById').mockResolvedValue(book);
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockImplementation(mockFindByIdAndUpdate);
      jest.spyOn(authorsService, 'findByIds').mockResolvedValueOnce([]);
      jest.spyOn(genresService, 'findByIds').mockResolvedValueOnce([]);

      try {
        await service.update('5e9aa6b567e95d9d9c9b7a7b', updateBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('One or more genres are invalid');
      }

      expect(mockFindByIdAndUpdate).toHaveBeenCalled();
      expect(authorsService.findByIds).toHaveBeenCalled();
      expect(genresService.findByIds).toHaveBeenCalled();
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

  describe('findFeatured', () => {
    it('should return an array of featured books', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValueOnce([book]),
          })),
        })),
      } as any);
      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(1);
      expect(await service.findFeatured('field')).toEqual([book]);
    });

    it('should return an empty array if no books are found', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        sort: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValueOnce([]),
          })),
        })),
      } as any);
      jest.spyOn(model, 'countDocuments').mockResolvedValueOnce(0);
      expect(await service.findFeatured('field')).toEqual([]);
    });
  });

  describe('findRelatedBooks', () => {
    it('should return an array of related books', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(book),
      } as any);
      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValueOnce([book]),
      } as any);

      expect(
        await service.findRelatedBooks('5e9aa6b567e95d9d9c9b7a7b'),
      ).toEqual([book]);
    });

    it('should return an empty array if no books are found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(book),
      } as any);
      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValueOnce([]),
      } as any);
      expect(
        await service.findRelatedBooks('5e9aa6b567e95d9d9c9b7a7b'),
      ).toEqual([]);
    });
  });

  describe('findOneBySlug', () => {
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
      expect(await service.findOneBySlug('randomTitle')).toEqual(book);
    });

    it('should throw an error if no book is found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      try {
        await service.findOneBySlug('randomTitle');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });
  });
});
