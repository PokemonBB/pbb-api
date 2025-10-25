import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ActivationService } from '../activation/activation.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activationService: ActivationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const user: UserDocument = await this.usersService.create({
      username,
      email,
      password,
    });

    // Send activation email
    await this.activationService.sendActivationEmail(user);

    const payload: JwtPayload = {
      sub: String(user._id),
      username: user.username,
      active: user.active,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      },
      token,
      message:
        'Account created successfully. Please check your email to activate your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Try to find user by username first, then by email
    let user = await this.usersService.findByUsername(username);
    if (!user) {
      user = (await this.usersService.findByEmail(
        username,
      )) as UserDocument | null;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException(
        'Account is not activated. Please check your email and activate your account.',
      );
    }

    const payload: JwtPayload = {
      sub: String(user._id),
      username: user.username,
      active: user.active,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.active) {
      throw new UnauthorizedException(
        'Account is not activated. Please check your email and activate your account.',
      );
    }
    return user;
  }
}
