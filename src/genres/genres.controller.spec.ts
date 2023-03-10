import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { GenreDocument } from './schemas/genre.schema';

const createGenreDto = {
  name: 'Fantasy',
  slug: 'fantasy',
  image: 'fantasy.jpg',
} as CreateGenreDto;

describe('GenresController', () => {
  let controller: GenresController;
  let service: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneByName: jest.fn(),
            findByIds: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      jest.spyOn(service, 'create').mockResolvedValue({} as GenreDocument);

      expect(await controller.create(createGenreDto)).toEqual({
        statusCode: 201,
        message: 'Genre created successfully',
        data: {} as GenreDocument,
      });
    });

    it('should throw an error if the genre already exists', async () => {
      jest
        .spyOn(service, 'findOneByName')
        .mockResolvedValue({} as GenreDocument);

      try {
        await controller.create(createGenreDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Genre already exists');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([{} as GenreDocument]);

      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Genres retrieved successfully',
        data: [{} as GenreDocument],
      });
    });

    it('should return an empty array if no genres are found', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      expect(await controller.findAll()).toEqual({
        statusCode: 200,
        message: 'Genres retrieved successfully',
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
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({} as GenreDocument);

      expect(await controller.findOne('1')).toEqual({
        statusCode: 200,
        message: 'Genre retrieved successfully',
        data: {} as GenreDocument,
      });
    });

    it('should throw an error if the genre is not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Genre not found'));

      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Genre not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'findOne')
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
    it('should update a genre', async () => {
      jest.spyOn(service, 'update').mockResolvedValue({} as GenreDocument);

      expect(await controller.update('1', createGenreDto)).toEqual({
        statusCode: 200,
        message: 'Genre updated successfully',
        data: {} as GenreDocument,
      });
    });

    it('should throw an error if the genre is not found', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);

      try {
        await controller.update('1', createGenreDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Genre not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new InternalServerErrorException('Something went wrong'),
        );

      try {
        await controller.update('1', createGenreDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Something went wrong');
      }
    });
  });

  describe('remove', () => {
    it('should delete a genre', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({} as GenreDocument);

      expect(await controller.remove('1')).toEqual({
        statusCode: 200,
        message: 'Genre deleted successfully',
        data: {} as GenreDocument,
      });
    });

    it('should throw an error if the genre is not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(null);

      try {
        await controller.remove('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Genre not found');
      }
    });

    it('should throw an error if something goes wrong', async () => {
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
