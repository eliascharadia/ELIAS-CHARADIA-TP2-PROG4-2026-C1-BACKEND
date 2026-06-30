import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { AuthGuard } from './guards/autenticacion.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    UsuariosModule,
    CloudinaryModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, AuthGuard, AdminGuard],
  exports: [JwtModule, AuthGuard, AdminGuard]
})
export class AutenticacionModule {}
