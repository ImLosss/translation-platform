import { Test, TestingModule } from '@nestjs/testing';
import { GlossaryEntryController } from './glossary-entry.controller';
import { GlossaryEntryService } from './glossary-entry.service';

describe('GlossaryEntryController', () => {
  let controller: GlossaryEntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlossaryEntryController],
      providers: [GlossaryEntryService],
    }).compile();

    controller = module.get<GlossaryEntryController>(GlossaryEntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
