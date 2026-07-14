import { Test, TestingModule } from '@nestjs/testing';
import { GlosaryController } from './glosary.controller';
import { GlosaryService } from './glosary.service';

describe('GlosaryController', () => {
  let controller: GlosaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlosaryController],
      providers: [GlosaryService],
    }).compile();

    controller = module.get<GlosaryController>(GlosaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
