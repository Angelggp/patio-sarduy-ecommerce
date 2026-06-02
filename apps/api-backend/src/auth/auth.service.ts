import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { USER_ROLE, User } from '../users/entities/user.entity';
import { SafeUser, UsersService } from '../users/users.service';
import { INACTIVE_ACCOUNT_MESSAGE } from './auth.constants';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenPayload } from './strategies/jwt.strategy';

type AuthSessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginDto): Promise<AuthSessionResponse> {
    const user = await this.usersService.findByUsernameWithSecrets(payload.username.trim());
    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    this.assertCredentialsAllowLogin(user, isPasswordValid);

    const tokens = await this.createTokenPair({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    const safeUser = await this.usersService.findById(user.id);

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async register(payload: RegisterDto): Promise<AuthSessionResponse> {
    const safeUser = await this.usersService.registerClient(payload);

    const tokens = await this.createTokenPair({
      sub: safeUser.id,
      username: safeUser.username,
      name: safeUser.name,
      role: safeUser.role,
    });

    await this.usersService.updateRefreshToken(safeUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async customerLogin(payload: CustomerLoginDto): Promise<AuthSessionResponse> {
    const normalizedUsername = payload.username.trim().toLowerCase();
    const existingUser = await this.usersService.findByUsernameWithSecretsOrNull(normalizedUsername);

    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(payload.password, existingUser.passwordHash);
      this.assertCredentialsAllowLogin(existingUser, isPasswordValid);

      const tokens = await this.createTokenPair({
        sub: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
        role: existingUser.role,
      });

      await this.usersService.updateRefreshToken(existingUser.id, tokens.refreshToken);
      const safeUser = await this.usersService.findById(existingUser.id);

      return {
        ...tokens,
        user: safeUser,
      };
    }

    if (!payload.name?.trim() || !payload.phone?.trim()) {
      throw new BadRequestException(
        'Para crear una cuenta nueva debes enviar name y phone junto con username y password.',
      );
    }

    return this.register({
      username: normalizedUsername,
      name: payload.name,
      phone: payload.phone,
      password: payload.password,
    });
  }

  async refresh(refreshToken: string): Promise<AuthSessionResponse> {
    let payload: AccessTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'jwt-refresh-dev-secret',
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado.');
    }

    const user = await this.usersService.findByIdWithSecrets(payload.sub);
    if (!user.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    const refreshMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!refreshMatches) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    const tokens = await this.createTokenPair({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    const safeUser = await this.usersService.findById(user.id);

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async getSessionUser(userId: number): Promise<SafeUser> {
    return this.usersService.findById(userId);
  }

  private assertCredentialsAllowLogin(user: User, isPasswordValid: boolean): void {
    if (!isPasswordValid || user.isGuest) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(INACTIVE_ACCOUNT_MESSAGE);
    }
  }

  private async createTokenPair(payload: {
    sub: number;
    username: string;
    name: string;
    role: USER_ROLE;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'jwt-access-dev-secret',
      expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'jwt-refresh-dev-secret',
      expiresIn: (process.env.JWT_REFRESH_TTL ?? '7d') as `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`,
    });

    return { accessToken, refreshToken };
  }
}
