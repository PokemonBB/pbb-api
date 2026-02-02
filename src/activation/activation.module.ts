import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationService } from './activation.service';
import { ActivationController } from './activation.controller';
import {
  ActivationCode,
  ActivationCodeSchema,
} from '../schemas/activation-code.schema';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivationCode.name, schema: ActivationCodeSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => EmailModule),
  ],
  controllers: [ActivationController],
  providers: [ActivationService],
  exports: [ActivationService],
})
export class ActivationModule {}
