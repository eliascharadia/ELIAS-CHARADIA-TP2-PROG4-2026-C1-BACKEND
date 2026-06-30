import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from './schema/comentarios.schema';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AutenticacionModule,
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}
