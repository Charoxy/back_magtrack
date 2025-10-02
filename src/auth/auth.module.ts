import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') || '7d' },
      }),
      inject: [ConfigService],
    })
    ,],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
