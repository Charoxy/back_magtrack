import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "../dto/usermake.dto";

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto : CreateUserDto) :Promise<any> {
    const user = await this.usersService.finByEmail(dto.email);
    if (user) {
      throw new Error('Email already in use');
    }

    const newUser = await this.usersService.createUser(dto);

    return {
      access_token: await this.jwtService.signAsync({ sub: newUser.id, username: newUser.nom, email: newUser.email }),
    };

  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.finByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const matched = await bcrypt.compare(pass, user.password);

    if (!matched) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id , username: user.nom, email: user.email };

    return  this.jwtService.signAsync(payload)

  }

}
