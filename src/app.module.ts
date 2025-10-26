import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { EmailModule } from './email/email.module';
import { ActivationModule } from './activation/activation.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { FriendsModule } from './friends/friends.module';
import { InvitationsModule } from './invitations/invitations.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { AuditModule } from './audit/audit.module';
import { SeedHook } from './seed/seed.hook';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('database.username')}:${configService.get('database.password')}@${configService.get('database.host')}:${configService.get('database.port')}/${configService.get('database.database')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AdminModule,
    SeedModule,
    EmailModule,
    ActivationModule,
    PasswordResetModule,
    FriendsModule,
    InvitationsModule,
    HealthcheckModule,
    AuditModule,
  ],
  providers: [SeedHook],
})
export class AppModule {}
