import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
