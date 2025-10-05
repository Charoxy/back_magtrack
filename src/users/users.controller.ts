import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';

@ApiTags('Utilisateurs')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur',
    schema: {
      example: {
        id: 1,
        email: 'john@example.com',
        nom: 'John Doe',
        organisation: 'Ma Ferme',
        role: 'producteur',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }
}
