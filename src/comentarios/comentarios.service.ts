import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schema/comentarios.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  async crear(publicacionId: string, dto: CreateComentarioDto, autorId: string) {
    const nuevoComentario = new this.comentarioModel({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
      mensaje: dto.mensaje,
    });

    const guardado = await nuevoComentario.save();
    return guardado.populate('autor', 'nombre apellido nombreUsuario fotoPerfilUrl');
  }

  async listar(publicacionId: string, query: ListarComentariosDto) {
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);

    return this.comentarioModel
      .find({ publicacion: new Types.ObjectId(publicacionId) })
      .sort({ createdAt: -1 }) // más recientes primero
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombre apellido nombreUsuario fotoPerfilUrl')
      .lean();
  }

  async editar(comentarioId: string, dto: CreateComentarioDto, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permiso para editar este comentario');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', 'nombre apellido nombreUsuario fotoPerfilUrl');
  }
}