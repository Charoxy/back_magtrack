import { Body, Controller, Get, Post, UseGuards, Request, Req, Res } from "@nestjs/common";
import { Response } from 'express';
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CreateUserDto } from "../dto/usermake.dto";
import { LoginDto } from "../dto/login.dto";

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  async signIn(@Res({ passthrough: true }) res: Response, @Body() signInDto: LoginDto) {

    const jwt = await this.authService.signIn(signInDto.email, signInDto.password)

    res.cookie('token', jwt, {
      httpOnly: true,
      secure: false,    // true si HTTPS (production)
      sameSite: 'lax',  // ou 'none' si HTTPS cross-domain
      path: '/',
    });


  }

  @Post('register')
  async register(@Body() userMakeDto: CreateUserDto) {
    return await this.authService.register(userMakeDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }


}
