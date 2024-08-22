import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthErrorCode } from './auth.enum';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async registUser(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    const { username, password } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      username,
      password: hashPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === AuthErrorCode.DUPLICATE_USER_NAME) {
        throw new ConflictException('Username already exists!');
      }
      throw new InternalServerErrorException();
    }
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    await this.registUser(authCredentialsDto);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOneBy({
      username,
    });
    if (!user) {
      throw new NotFoundException('User not exists!');
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      (await user).password,
    );
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Please check your password');
    }

    return 'success';
  }
}
