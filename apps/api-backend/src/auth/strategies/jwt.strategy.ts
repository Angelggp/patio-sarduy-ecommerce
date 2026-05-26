import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { USER_ROLE } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

export type AccessTokenPayload = {
  sub: number;
  username: string;
  name: string;
  role: USER_ROLE;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'jwt-access-dev-secret',
    });
  }

  async validate(payload: AccessTokenPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo.');
    }

    return {
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }
}
