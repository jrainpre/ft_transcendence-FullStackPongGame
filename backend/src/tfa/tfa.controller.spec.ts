import { Test, TestingModule } from '@nestjs/testing';
import { TfaController } from './tfa.controller';

describe('TfaController', () => {
  let controller: TfaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TfaController],
    }).compile();

    controller = module.get<TfaController>(TfaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
