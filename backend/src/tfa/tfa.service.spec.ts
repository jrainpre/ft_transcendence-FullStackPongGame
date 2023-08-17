import { Test, TestingModule } from '@nestjs/testing';
import { TfaService } from './tfa.service';

describe('TfaService', () => {
  let service: TfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TfaService],
    }).compile();

    service = module.get<TfaService>(TfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
