import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AuthorsService } from './authors.service';
import { Author, AuthorDocument } from './schemas/author.schema';

const createAuthorDto = {
  name: 'J.R.R. Tolkien',
};

describe('AuthorsService', () => {
  let service: AuthorsService;
  let model: Model<AuthorDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getModelToken(Author.name),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    model = module.get<Model<AuthorDocument>>(getModelToken(Author.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an author', async () => {
      const newAuthor = {
        title: 'The Lord of the Rings',
        _id: 'randomId',
      };

      jest.spyOn(model, 'create').mockReturnValue(newAuthor as any);

      expect(await service.create(createAuthorDto)).toEqual(newAuthor);
    });
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const authors = [
        {
          title: 'The Lord of the Rings',
          _id: 'randomId',
        },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(authors),
      } as any);

      expect(await service.findAll()).toEqual(authors);
    });
  });

  describe('findOne', () => {
    it('should return an author', async () => {
      const author = {
        title: 'The Lord of the Rings',
        _id: 'randomId',
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(author),
      } as any);

      expect(await service.findOne('randomId')).toEqual(author);
    });
  });

  describe('findOneByName', () => {
    it('should return an author', async () => {
      const author = {
        title: 'The Lord of the Rings',
        _id: 'randomId',
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(author),
      } as any);

      expect(await service.findOneByName('J.R.R. Tolkien')).toEqual(author);
    });
  });

  describe('findByIds', () => {
    it('should return an array of authors', async () => {
      const authors = [
        {
          title: 'The Lord of the Rings',
          _id: 'randomId',
        },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(authors),
      } as any);

      expect(await service.findByIds(['randomId'])).toEqual(authors);
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updatedAuthor = {
        title: 'The Lord of the Rings',
        _id: 'randomId',
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedAuthor),
      } as any);

      expect(await service.update('randomId', createAuthorDto)).toEqual(
        updatedAuthor,
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'randomId',
        createAuthorDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      const deletedAuthor = {
        title: 'The Lord of the Rings',
        _id: 'randomId',
      };

      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedAuthor),
      } as any);

      expect(await service.remove('randomId')).toEqual(deletedAuthor);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('randomId');
    });
  });
});
