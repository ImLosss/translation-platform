import { Test, TestingModule } from '@nestjs/testing';
import { GlosaryService } from './glosary.service';

describe('GlosaryService', () => {
  let service: GlosaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlosaryService],
    }).compile();

    service = module.get<GlosaryService>(GlosaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
