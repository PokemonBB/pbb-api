import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailController } from './email.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailTemplatesService],
  exports: [EmailService, EmailTemplatesService],
})
export class EmailModule {}
