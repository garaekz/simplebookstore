import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsModule } from './authors.module';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { getModelToken } from '@nestjs/mongoose';
import { Author } from './schemas/author.schema';

describe('AuthorsModule', () => {
  let module: TestingModule;
  let service: AuthorsService;
  let controller: AuthorsController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthorsModule],
    })
      .overrideProvider(getModelToken(Author.name))
      .useValue({})
      .overrideProvider(AuthorsService)
      .useValue({})
      .overrideProvider(AuthorsController)
      .useValue({})
      .compile();

    service = module.get<AuthorsService>(AuthorsService);
    controller = module.get<AuthorsController>(AuthorsController);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
