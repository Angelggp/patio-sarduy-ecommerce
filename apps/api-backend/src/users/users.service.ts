import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_ROLE, User } from './entities/user.entity';
import { normalizePersonName, normalizePhone } from './utils/personal-data-normalizer';

export type SafeUser = Omit<User, 'passwordHash' | 'refreshTokenHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findMany(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async findById(id: number): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no existe.`);
    }

    return this.toSafeUser(user);
  }

  async findByIdWithSecrets(id: number): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no existe.`);
    }

    return user;
  }

  async findByUsernameWithSecrets(username: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    return user;
  }

  async findByUsernameWithSecretsOrNull(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }

  async createOne(payload: CreateUserDto): Promise<SafeUser> {
    const username = payload.username.trim().toLowerCase();
    const normalizedName = normalizePersonName(payload.name);
    const normalizedPhone = payload.phone ? normalizePhone(payload.phone) : null;

    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();

    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese username.');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const created = await this.usersRepository.save(
      this.usersRepository.create({
        username,
        name: payload.name.trim(),
        phone: normalizedPhone,
        normalizedName,
        normalizedPhone,
        passwordHash,
        role: payload.role,
        isGuest: false,
      }),
    );

    return this.toSafeUser(created);
  }

  async updateOne(id: number, payload: UpdateUserDto): Promise<SafeUser> {
    const existing = await this.findByIdWithSecrets(id);
    if (!existing) {
      throw new NotFoundException(`Usuario con id ${id} no existe.`);
    }

    if (payload.username && payload.username.trim().toLowerCase() !== existing.username.toLowerCase()) {
      const usernameTaken = await this.usersRepository
        .createQueryBuilder('user')
        .where('LOWER(user.username) = LOWER(:username)', { username: payload.username.trim() })
        .andWhere('user.id != :id', { id })
        .getOne();

      if (usernameTaken) {
        throw new ConflictException('Ya existe un usuario con ese username.');
      }
    }

    let passwordHash = existing.passwordHash;
    if (payload.password) {
      passwordHash = await bcrypt.hash(payload.password, 10);
    }

    const merged = this.usersRepository.create({
      ...existing,
      username: payload.username ? payload.username.trim().toLowerCase() : existing.username,
      name: payload.name ? payload.name.trim() : existing.name,
      phone: payload.phone ? normalizePhone(payload.phone) : existing.phone,
      normalizedName: payload.name ? normalizePersonName(payload.name) : existing.normalizedName,
      normalizedPhone: payload.phone ? normalizePhone(payload.phone) : existing.normalizedPhone,
      role: payload.role ?? existing.role,
      isActive: payload.isActive ?? existing.isActive,
      passwordHash,
    });

    const updated = await this.usersRepository.save(merged);
    return this.toSafeUser(updated);
  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const user = await this.findByIdWithSecrets(userId);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.save(user);
  }

  async clearRefreshToken(userId: number): Promise<void> {
    const user = await this.findByIdWithSecrets(userId);
    user.refreshTokenHash = null;
    await this.usersRepository.save(user);
  }

  async registerClient(payload: RegisterDto): Promise<SafeUser> {
    const username = payload.username.trim().toLowerCase();
    const normalizedName = normalizePersonName(payload.name);
    const normalizedPhone = normalizePhone(payload.phone);

    const usernameTaken = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();

    if (usernameTaken) {
      throw new ConflictException('Ya existe un usuario con ese username.');
    }

    const matchingGuest = await this.findGuestByNormalizedData(normalizedName, normalizedPhone);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    if (matchingGuest) {
      matchingGuest.username = username;
      matchingGuest.name = payload.name.trim();
      matchingGuest.phone = normalizedPhone;
      matchingGuest.normalizedName = normalizedName;
      matchingGuest.normalizedPhone = normalizedPhone;
      matchingGuest.passwordHash = passwordHash;
      matchingGuest.role = USER_ROLE.CLIENT;
      matchingGuest.isGuest = false;
      matchingGuest.isActive = true;
      matchingGuest.refreshTokenHash = null;

      const updated = await this.usersRepository.save(matchingGuest);
      return this.toSafeUser(updated);
    }

    const created = await this.usersRepository.save(
      this.usersRepository.create({
        username,
        name: payload.name.trim(),
        phone: normalizedPhone,
        normalizedName,
        normalizedPhone,
        passwordHash,
        role: USER_ROLE.CLIENT,
        isGuest: false,
        isActive: true,
      }),
    );

    return this.toSafeUser(created);
  }

  async findGuestByNormalizedData(normalizedName: string, normalizedPhone: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.isGuest = true')
      .andWhere('user.role = :role', { role: USER_ROLE.CLIENT })
      .andWhere('user.normalizedName = :normalizedName', { normalizedName })
      .andWhere('user.normalizedPhone = :normalizedPhone', { normalizedPhone })
      .getOne();
  }

  async createGuestUser(name: string, phone: string): Promise<User> {
    const normalizedName = normalizePersonName(name);
    const normalizedPhone = normalizePhone(phone);

    const existingGuest = await this.findGuestByNormalizedData(normalizedName, normalizedPhone);
    if (existingGuest) {
      return existingGuest;
    }

    const guestUsername = `guest_${createHash('sha1')
      .update(`${normalizedName}|${normalizedPhone}`)
      .digest('hex')
      .slice(0, 24)}`;

    const guestPasswordHash = await bcrypt.hash(
      `${normalizedName}:${normalizedPhone}:${Date.now()}`,
      10,
    );

    const created = await this.usersRepository.save(
      this.usersRepository.create({
        username: guestUsername,
        name: name.trim(),
        phone: normalizedPhone,
        normalizedName,
        normalizedPhone,
        passwordHash: guestPasswordHash,
        role: USER_ROLE.CLIENT,
        isGuest: true,
        isActive: true,
      }),
    );

    return created;
  }

  async seedDefaultAdminIfNeeded(): Promise<void> {
    const username = 'admin';
    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();

    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash('admin', 10);

    await this.usersRepository.save(
      this.usersRepository.create({
        username: 'admin',
        name: 'admin',
        phone: null,
        normalizedName: normalizePersonName('admin'),
        normalizedPhone: null,
        role: USER_ROLE.ADMIN,
        passwordHash,
        isGuest: false,
        isActive: true,
      }),
    );
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }
}
