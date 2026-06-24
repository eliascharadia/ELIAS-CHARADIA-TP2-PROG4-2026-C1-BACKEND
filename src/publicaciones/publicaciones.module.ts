import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from '../publicaciones/entities/publicacion.schema';
import { Like, LikeSchema } from '../publicaciones/entities/like.schema';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
@Module({
  imports: [
     MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    CloudinaryModule,
    AutenticacionModule, // para tener acceso a JwtModule (que usa AuthGuard) y AuthGuard
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService]
})
export class PublicacionesModule {}
