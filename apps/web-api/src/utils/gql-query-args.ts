import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

interface WhereOperators {
  _eq?: number | string;
  _neq?: number | string;
}

@InputType()
export class GQLWhereOpsInt implements WhereOperators {
  @Field(() => Int, { nullable: true })
  _eq?: number;

  @Field(() => Int, { nullable: true })
  _neq?: number;
}

@InputType()
export class GQLWhereOpsString implements WhereOperators {
  @Field(() => String, { nullable: true })
  _eq?: string;

  @Field(() => String, { nullable: true })
  _neq?: string;
}

@ArgsType()
export class GQLQueryPaginationArgs {
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}
