import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import typeormConfig from '@common/typeorm.config';
import { GraphQLModule } from '@nestjs/graphql';
import { Block } from '@entities/Block';
import { HolderModule } from './holder/holder.module';
import { Tokens } from '@entities/Tokens';
import { Collections } from '@entities/Collections';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...typeormConfig,
      entities: [Block, Tokens, Collections],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      debug: true,
      playground: true,
      sortSchema: true,
    }),
    HolderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
