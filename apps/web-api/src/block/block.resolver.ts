import { Block } from '@entities/Block';
import { Query, Resolver } from '@nestjs/graphql';
import { BlockService } from './block.service';

@Resolver(() => Block)
export class BlockResolver {
  constructor(private blockService: BlockService) {}
  @Query(() => [Block])
  public block(): Promise<Block[]> {
    return this.blockService.find();
  }
}
