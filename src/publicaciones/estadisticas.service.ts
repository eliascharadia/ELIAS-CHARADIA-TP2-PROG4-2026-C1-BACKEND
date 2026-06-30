import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicacion.schema';
import { Comentario, ComentarioDocument } from './entities/comentarios.schema';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  private armarFiltroFechas(query: FiltroFechasDto): any {
    const filtro: any = {};
    if (query.desde || query.hasta) {
      filtro.createdAt = {};
      if (query.desde) filtro.createdAt.$gte = new Date(query.desde);
      if (query.hasta) filtro.createdAt.$lte = new Date(query.hasta);
    }
    return filtro;
  }

  // ---------- 1. Publicaciones por usuario ----------
  async publicacionesPorUsuario(query: FiltroFechasDto) {
    const filtroFechas = this.armarFiltroFechas(query);

    return this.publicacionModel.aggregate([
      { $match: { activa: true, ...filtroFechas } },
      {
        $group: {
          _id: '$autor',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$usuario.nombreUsuario',
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  // ---------- 2. Comentarios por lapso de tiempo (agrupados por día) ----------
  async comentariosPorTiempo(query: FiltroFechasDto) {
    const filtroFechas = this.armarFiltroFechas(query);

    return this.comentarioModel.aggregate([
      { $match: filtroFechas },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          cantidad: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
      { $sort: { fecha: 1 } },
    ]);
  }

  // ---------- 3. Comentarios por publicación ----------
  async comentariosPorPublicacion(query: FiltroFechasDto) {
    const filtroFechas = this.armarFiltroFechas(query);

    return this.comentarioModel.aggregate([
      { $match: filtroFechas },
      {
        $group: {
          _id: '$publicacion',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'publicacions',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }
}