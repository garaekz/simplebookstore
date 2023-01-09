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
      const book = {
        ...createBookDto,
        authors: [new Author()],
        genres: [new Genre()],
        discount: 0,
      } as BookDocument;
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
      const book = {
        ...createBookDto,
        authors: [new Author()],
        genres: [new Genre()],
        discount: 0,
      } as BookDocument;
      jest.spyOn(service, 'findAll').mockResolvedValue([book]);
      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [book],
      });
    });

    it('should return an empty array if no books are found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Books retrieved successfully',
        data: [],
      });
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findAll();
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
      jest.spyOn(service, 'findOneById').mockResolvedValue(book);
      expect(await controller.findOne('aGoodBookId')).toEqual({
        statusCode: 200,
        message: 'Book retrieved successfully',
        data: book,
      });
    });

    it('should throw an error if no book is found', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException('Book not found'));
      try {
        await controller.findOne('someRandomBookId');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('Book not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );
      try {
        await controller.findOne('someRandomBookId');
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
