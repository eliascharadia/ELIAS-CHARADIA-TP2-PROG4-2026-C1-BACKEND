import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosModule } from './comentarios/comentarios.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),MongooseModule.forRoot(process.env.MONGO_URI!),PublicacionesModule, AutenticacionModule, UsuariosModule, ComentariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
