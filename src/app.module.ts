import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ShopsController } from './shops.controller';
import { InspectionsController } from './inspections.controller';
import { TasksController } from './tasks.controller';
import { TicketsController } from './tickets.controller';

@Module({
  controllers: [
    ShopsController,
    InspectionsController,
    TasksController,
    TicketsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
