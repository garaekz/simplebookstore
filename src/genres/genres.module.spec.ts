import { Test, TestingModule } from '@nestjs/testing';
import { GenresModule } from './genres.module';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Genre } from './schemas/genre.schema';

describe('GenresModule', () => {
  let module: TestingModule;
  let service: GenresService;
  let controller: GenresController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GenresModule],
    })
      .overrideProvider(getModelToken(Genre.name))
      .useValue({})
      .overrideProvider(GenresService)
      .useValue({})
      .overrideProvider(GenresController)
      .useValue({})
      .compile();

    service = module.get<GenresService>(GenresService);
    controller = module.get<GenresController>(GenresController);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
