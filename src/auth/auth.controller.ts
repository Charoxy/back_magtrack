import { Body, Controller, Get, Post, UseGuards, Request, Req, Res } from "@nestjs/common";
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CreateUserDto } from "../dto/usermake.dto";
import { LoginDto } from "../dto/login.dto";

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie, cookie JWT défini',
    schema: {
      example: { success: true, message: 'Connexion réussie', email: 'user@example.com' }
    }
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  async signIn(@Res({ passthrough: true }) res: Response, @Body() signInDto: LoginDto) {

    const jwt = await this.authService.signIn(signInDto.email, signInDto.password)

    res.cookie('token', jwt, {
      httpOnly: true,
      secure: false,    // true si HTTPS (production)
      sameSite: 'lax',  // ou 'none' si HTTPS cross-domain
      path: '/',
    });

    return { success: true, message: 'Connexion réussie', email: signInDto.email };
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      example: { access_token: 'jwt_token...', email: 'user@example.com' }
    }
  })
  @ApiResponse({ status: 400, description: 'Données invalides ou email déjà utilisé' })
  async register(@Body() userMakeDto: CreateUserDto) {
    const result = await this.authService.register(userMakeDto);
    return { ...result, email: userMakeDto.email };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur retourné' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getProfile(@Request() req) {
    return req.user;
  }


}
