import { CreateBookDto } from './dto/create-book.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Author } from '../authors/schemas/author.schema';
import { Genre } from '../genres/schemas/genre.schema';
import { BookDocument } from './schemas/book.schema';
import { GenresService } from '../genres/genres.service';
import { AuthorsService } from '../authors/authors.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
  title: 'The Lord of the Rings: The Fellowship of the Ring',
  discount: 10,
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

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;
  let authorsService: AuthorsService;
  let genresService: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: AuthorsService,
          useValue: {
            findOneByName: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: BooksService,
          useValue: {
            findOneByTitle: jest.fn(),
            findOneBySlug: jest.fn(),
            findFeatured: jest.fn(),
            findRelatedBooks: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: GenresService,
          useValue: {
            findOneByName: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
    authorsService = module.get<AuthorsService>(AuthorsService);
    genresService = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(null);
      jest.spyOn(service, 'create').mockResolvedValue(book);
      expect(await controller.create(createBookDto)).toEqual({
        statusCode: 201,
        message: 'Book created successfully',
        data: book,
      });
    });
    it('should not create a book if it already exists', async () => {
      jest
        .spyOn(service, 'findOneByTitle')
        .mockResolvedValue({} as BookDocument);
      try {
        await controller.create(createBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Book already exists');
      }
    });

    it('should not create a book if author does not exist', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(null);
      jest
        .spyOn(authorsService, 'findOneByName')
        .mockRejectedValue(
          new BadRequestException('One or more authors are invalid'),
        );

      try {
        await controller.create({
          ...createBookDto,
          authors: ['someOtherAuthorId'],
        });
      } catch (error) {
        expect(error.status).toEqual(400);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('One or more authors are invalid');
      }
    });

    it('should not create a book if genre does not exist', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(null);
      jest
        .spyOn(authorsService, 'findOneByName')
        .mockRejectedValue(
          new BadRequestException('One or more genres are invalid'),
        );
      jest.spyOn(genresService, 'findOneByName').mockResolvedValue(null);

      try {
        await controller.create({
          ...createBookDto,
          authors: ['aRandomAuthorId'],
          genres: ['someOtherGenreId'],
        });
      } catch (error) {
        expect(error.status).toEqual(400);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('One or more genres are invalid');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedBooks);
      expect(await controller.findAll(1)).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        ...paginatedBooks,
      });
    });

    it('should return an empty array if no books are found', async () => {
      const emptyPaginatedBooks = { ...paginatedBooks, data: [] };
      jest.spyOn(service, 'findAll').mockResolvedValue(emptyPaginatedBooks);
      expect(await controller.findAll(1)).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        ...emptyPaginatedBooks,
      });
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findAll(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });

  describe('findFeatured', () => {
    it('should return an array of featured books', async () => {
      jest.spyOn(service, 'findFeatured').mockResolvedValue([book]);
      expect(await controller.findFeatured()).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [book],
      });
    });

    it('should return an empty array if no featured books are found', async () => {
      jest.spyOn(service, 'findFeatured').mockResolvedValue([]);
      expect(await controller.findFeatured()).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [],
      });
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findFeatured')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findFeatured();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });

  describe('findRelated', () => {
    it('should return an array of related books', async () => {
      jest.spyOn(service, 'findRelatedBooks').mockResolvedValue([book]);
      expect(await controller.findRelated('slug')).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [book],
        total: 1,
      });
    });

    it('should return an empty array if no related books are found', async () => {
      jest.spyOn(service, 'findRelatedBooks').mockResolvedValue([]);
      expect(await controller.findRelated('slug')).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [],
        total: 0,
      });
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findRelatedBooks')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findRelated('slug');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      const book = {
        ...createBookDto,
        authors: [new Author()],
        genres: [new Genre()],
        discount: 0,
      } as BookDocument;
      jest.spyOn(service, 'findOneBySlug').mockResolvedValue(book);
      expect(await controller.findOne('slug')).toEqual({
        statusCode: 200,
        message: 'Book retrieved successfully',
        data: book,
      });
    });

    it('should throw an error if no book is found', async () => {
      jest
        .spyOn(service, 'findOneBySlug')
        .mockRejectedValue(new NotFoundException('Book not found'));
      try {
        await controller.findOne('someRandomSlug');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findOneBySlug')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findOne('someRandomSlug');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const book = {
        ...updateBookDto,
        authors: [new Author()],
        genres: [new Genre()],
        discount: 0,
      } as BookDocument;
      jest.spyOn(service, 'findOneById').mockResolvedValue(book);
      jest.spyOn(service, 'update').mockResolvedValue(book);
      expect(await controller.update('aGoodBookId', updateBookDto)).toEqual({
        statusCode: 200,
        message: 'Book updated successfully',
        data: book,
      });
    });

    it('should throw an error if no book is found', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException('Book not found'));
      try {
        await controller.update('someRandomBookId', updateBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.update('someRandomBookId', updateBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({} as BookDocument);
      expect(await controller.remove('aGoodBookId')).toEqual({
        statusCode: 200,
        message: 'Book deleted successfully',
        data: {},
      });
    });

    it('should throw an error if no book is found', async () => {
      try {
        jest.spyOn(service, 'remove').mockResolvedValue(null);
        await controller.remove('someRandomBookId');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.remove('someRandomBookId');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual('Something went wrong');
      }
    });
  });
});
