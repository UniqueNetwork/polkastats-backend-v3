import {
  Args,
  ArgsType,
  Field,
  InputType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { HolderDTO } from './holder.dto';
import { HolderService } from './holder.service';

@InputType()
class WhereClass {
  @Field(() => String)
  owner: string;
}

@ArgsType()
class GetHolderArgs {
  @Field(() => WhereClass, { nullable: true })
  where?: WhereClass;
}

@Resolver(() => HolderDTO)
export class HolderResolver {
  constructor(private service: HolderService) {}

  @Query(() => [HolderDTO])
  public async holders(@Args() args: GetHolderArgs): Promise<HolderDTO[]> {
    console.log('args', args.where.owner);
    return this.service.find();
  }
}
