import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),MongooseModule.forRoot(process.env.MONGO_URI!),PublicacionesModule, AutenticacionModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
