import { UpdateGenreDto } from './dto/update-genre.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GenresService } from './genres.service';
import { Genre, GenreDocument } from './schemas/genre.schema';

const createGenreDto = {
  name: 'Fantasy',
};

const newGenre = {
  ...createGenreDto,
  _id: 'newRandomId',
};

describe('GenresService', () => {
  let service: GenresService;
  let model: Model<GenreDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getModelToken(Genre.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    model = module.get<Model<GenreDocument>>(getModelToken(Genre.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      jest.spyOn(model, 'create').mockReturnValue(newGenre as any);

      expect(await service.create(newGenre)).toEqual(newGenre);
    });
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const genres = [newGenre];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(genres),
      } as any);

      expect(await service.findAll()).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(newGenre),
      } as any);

      expect(await service.findOne(newGenre._id)).toEqual(newGenre);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const updateGenreDto: UpdateGenreDto = {
        name: 'New Fantasy',
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...updateGenreDto,
          _id: newGenre._id,
        }),
      } as any);

      expect(await service.update(newGenre._id, updateGenreDto)).toEqual({
        ...updateGenreDto,
        _id: newGenre._id,
      });
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(newGenre),
      } as any);
      expect(await service.remove(newGenre._id)).toEqual(newGenre);
    });
  });
});
