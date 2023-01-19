import { AuthorDocument } from './schemas/author.schema';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

const createAuthorDto = {
  name: 'J.R.R. Tolkien',
  slug: 'j-r-r-tolkien',
};

describe('AuthorsController', () => {
  let controller: AuthorsController;
  let service: AuthorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuthorsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            findOneByName: jest.fn(),
            findByIds: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an author', async () => {
      jest.spyOn(service, 'create').mockResolvedValue({} as AuthorDocument);

      expect(await controller.create(createAuthorDto)).toEqual({
        statusCode: 201,
        message: 'Author created successfully',
        data: {} as AuthorDocument,
      });
    });

    it('should throw an error if the author already exists', async () => {
      jest
        .spyOn(service, 'findOneByName')
        .mockResolvedValue({} as AuthorDocument);

      try {
        await controller.create(createAuthorDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Author already exists');
      }
    });

    it('should throw an error if something went wrong', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );

      try {
        await controller.create(createAuthorDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const result = [{} as AuthorDocument];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Authors retrieved successfully',
        data: result,
      });
    });

    it('should return an empty array if no authors are found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Authors retrieved successfully',
        data: [],
      });
    });

    it('should throw an error if something went wrong', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new InternalServerErrorException());

      try {
        await controller.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('findOne', () => {
    it('should return an author', async () => {
      const result = {
        ...createAuthorDto,
      } as AuthorDocument;
      jest.spyOn(service, 'findOneById').mockResolvedValue(result);

      expect(await controller.findOne('5e9aa6b567e95d9d9c9b7a7b')).toEqual({
        statusCode: 200,
        message: 'Author retrieved successfully',
        data: result,
      });
    });

    it('should throw an error if the ID is invalid', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(
          new BadRequestException('The provided ID is invalid'),
        );
      try {
        await controller.findOne('badId');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('The provided ID is invalid');
      }
    });

    it('should throw an error if the author is not found', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException('Author not found'));

      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Author not found');
      }
    });

    it('should throw an error if something went wrong', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );

      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      jest.spyOn(service, 'update').mockResolvedValue({} as AuthorDocument);

      expect(await controller.update('1', createAuthorDto)).toEqual({
        statusCode: 200,
        message: 'Author updated successfully',
        data: {} as AuthorDocument,
      });
    });

    it('should throw an error if the author is not found', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);

      try {
        await controller.update('1', createAuthorDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Author not found');
      }
    });

    it('should throw an error if something went wrong', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );

      try {
        await controller.update('1', createAuthorDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('remove', () => {
    it('should delete an author', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({} as AuthorDocument);

      expect(await controller.remove('1')).toEqual({
        statusCode: 200,
        message: 'Author deleted successfully',
        data: {} as AuthorDocument,
      });
    });

    it('should throw an error if the author is not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(null);

      try {
        await controller.remove('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Author not found');
      }
    });

    it('should throw an error if something went wrong', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );

      try {
        await controller.remove('1');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });
});
