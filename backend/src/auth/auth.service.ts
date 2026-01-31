import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { User } from '../database/schema';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const user = await this.usersService.create({
      name,
      email,
      passwordHash,
      role: role || 'USER',
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  async getMe(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return null;
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  // Validate JWT token (used for WebSocket authentication)
  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      return this.validateUser(payload.sub);
    } catch {
      return null;
    }
  }
}
