import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from '../publicaciones/entities/publicacion.schema';
import { Like, LikeSchema } from '../publicaciones/entities/like.schema';
import { Comentario, ComentarioSchema } from './entities/comentarios.schema';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [
     MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Like.name, schema: LikeSchema },
      {name: Comentario.name, schema: ComentarioSchema}
    ]),
    CloudinaryModule,
    AutenticacionModule, // para tener acceso a JwtModule (que usa AuthGuard) y AuthGuard

  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService]
})
export class PublicacionesModule {}
