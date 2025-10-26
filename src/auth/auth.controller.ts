import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import type { RequestWithUser } from './interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActiveUserGuard } from './guards/active-user.guard';

const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.COOKIE_DOMAIN;
const baseCookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none' | boolean;
  path: string;
} & { domain?: string } = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};
const clearCookieOptions: {
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none' | boolean;
  path: string;
} & { domain?: string } = {
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user with invitation code',
    description:
      'Register a new user. Requires a valid invitation code to complete registration.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        summary: 'User registration with invitation code',
        value: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'SecurePassword123!',
          invitationCode:
            'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired invitation code',
  })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async register(@Body() registerDto: RegisterDto, @Res() res: FastifyReply) {
    const result = await this.authService.register(registerDto);

    res.cookie('token', result.token, {
      ...baseCookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.CREATED);
    return res.send({
      message: 'User registered successfully',
      user: result.user,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login with username or email',
    description:
      'Login using either username or email address with optional remember me functionality',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Login with username',
        value: {
          username: 'johndoe',
          password: 'SecurePassword123!',
        },
      },
      example2: {
        summary: 'Login with email',
        value: {
          username: 'john@example.com',
          password: 'SecurePassword123!',
        },
      },
      example3: {
        summary: 'Login with remember me',
        value: {
          username: 'johndoe',
          password: 'SecurePassword123!',
          rememberMe: true,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res() res: FastifyReply) {
    const result = await this.authService.login(loginDto);

    const maxAge = loginDto.rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000; // 24 hours

    res.cookie('token', result.token, {
      ...baseCookieOptions,
      maxAge,
    });

    res.status(HttpStatus.OK);
    return res.send({
      message: 'Login successful',
      user: result.user,
    });
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Res() res: FastifyReply) {
    res.clearCookie('token', clearCookieOptions);
    res.status(HttpStatus.OK);
    return res.send({
      message: 'Logout successful',
    });
  }

  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  @Get('verify')
  @ApiOperation({ summary: 'Verify authentication status' })
  @ApiCookieAuth('token')
  @ApiResponse({ status: 200, description: 'Authentication verified' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  verify(@Req() req: RequestWithUser) {
    return {
      message: 'Authentication verified',
      authenticated: true,
      user: req.user,
    };
  }
}
