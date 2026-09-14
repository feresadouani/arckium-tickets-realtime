import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { UsersModule } from './users/users.module';
import { Users } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/tickets.entity';
import { EquipmentsModule } from './equipments/equipments.module';
import { Equipment } from './equipments/equipments.entity';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      ...(process.env.MONGODB_URI
        ? { url: process.env.MONGODB_URI }
        : {
            host: process.env.MONGO_HOST || 'localhost',
            port: parseInt(process.env.MONGO_PORT || '27017', 10),
            database: process.env.MONGO_DATABASE || 'tickets',
          }),
      entities: [Users, Ticket, Equipment],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TicketsModule,
    EquipmentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
