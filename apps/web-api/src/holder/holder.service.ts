import { Tokens } from '@entities/Tokens';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class HolderService {
  constructor(@InjectRepository(Tokens) private repo: Repository<Tokens>) {}

  public async find(): Promise<Tokens[]> {
    const qb = this.repo.createQueryBuilder();
    qb.select(['collection_id', 'owner']);
    qb.addSelect('count(token_id)', 'count');
    qb.addGroupBy('Tokens.collection_id');
    qb.addGroupBy('owner');
    // qb.where({
    //   owner: Equal('5CQ3p41Br2djPnhX1gSHyi9bBsPVQU8zh6GFxtE8R1D85uV2'),
    // });
    const tokens = await qb.getRawMany();
    return tokens;
  }
}
