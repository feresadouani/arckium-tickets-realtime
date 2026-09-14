import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './tickets.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
