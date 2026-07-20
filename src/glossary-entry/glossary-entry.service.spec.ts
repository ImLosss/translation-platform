import { Test, TestingModule } from '@nestjs/testing';
import { GlossaryEntryService } from './glossary-entry.service';

describe('GlossaryEntryService', () => {
  let service: GlossaryEntryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlossaryEntryService],
    }).compile();

    service = module.get<GlossaryEntryService>(GlossaryEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
