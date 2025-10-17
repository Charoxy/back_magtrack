import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
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
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const newUser = await this.usersService.createUser(dto);

    const payload = { sub: newUser.id, username: newUser.nom, email: newUser.email };
    const token = await this.jwtService.signAsync(payload);

    return token;
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
