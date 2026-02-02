import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import {
  PasswordReset,
  PasswordResetSchema,
} from '../schemas/password-reset.schema';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => EmailModule),
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
