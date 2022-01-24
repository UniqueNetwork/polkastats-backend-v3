import { Block } from '@entities/Block';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  public findOne(): Promise<Block> {
    return this.blockRepository.findOne();
  }

  public find(): Promise<Block[]> {
    return this.blockRepository.find();
  }
}
