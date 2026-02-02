import { FastifyRequest } from 'fastify';
import { UserDocument } from '../../schemas/user.schema';

export interface RequestWithUser extends FastifyRequest {
  user: UserDocument;
}
