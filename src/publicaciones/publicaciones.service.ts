import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Publicacion, PublicacionDocument } from '../publicaciones/entities/publicacion.schema';
import { Like, LikeDocument } from '../publicaciones/entities/like.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
        @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
        private cloudinaryService: CloudinaryService,
    ) { }

    async crear(
        dto: CrearPublicacionDto,
        autorId: string,
        imagen?: { buffer: Buffer },
    ) {
        let imagenUrl: string | undefined;

        if (imagen) {
            const resultado = await this.cloudinaryService.uploadImage(imagen as any);
            imagenUrl = resultado.secure_url;
        }

        const nuevaPublicacion = new this.publicacionModel({
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            imagenUrl,
            autor: new Types.ObjectId(autorId),
        });

        return nuevaPublicacion.save();
    }


    async listar(query: ListarPublicacionesDto, usuarioId: string | null) {
        const offset = Number(query.offset ?? 0);
        const limit = Number(query.limit ?? 10);

        const filtro: any = { activa: true };
        if (query.usuarioId) {
            filtro.autor = new Types.ObjectId(query.usuarioId);
        }

        let publicaciones: any[];
        // Caso 1: ordenar por fecha (simple, sin agregación)
        if (query.orden !== 'likes') {
            const resultado = await this.publicacionModel
                .find(filtro)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .populate('autor', 'nombre apellido nombreUsuario fotoPerfilUrl')
                .lean();
            publicaciones = await this.agregarConteoLikes(resultado);
        } else {
            publicaciones = await this.listarOrdenadoPorLikes(filtro, offset, limit);
        }


        if (usuarioId) {
            publicaciones = await this.marcarLikesDelUsuario(publicaciones, usuarioId);
        } else {
            publicaciones = publicaciones.map((p) => ({ ...p, yaLeDiLike: false }));
        }

        return publicaciones;
    }

    private async marcarLikesDelUsuario(publicaciones: any[], usuarioId: string) {
        const ids = publicaciones.map((p) => p._id);

        const likesDelUsuario = await this.likeModel.find({
            publicacion: { $in: ids },
            usuario: new Types.ObjectId(usuarioId),
        });

        const idsConLike = new Set(likesDelUsuario.map((l) => l.publicacion.toString()));

        return publicaciones.map((p) => ({
            ...p,
            yaLeDiLike: idsConLike.has(p._id.toString()),
        }));
    }

    private async listarOrdenadoPorLikes(filtro: any, offset: number, limit: number) {
        const resultado = await this.publicacionModel.aggregate([
            { $match: filtro },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'publicacion',
                    as: 'likesArray',
                },
            },
            {
                $addFields: {
                    cantidadLikes: { $size: '$likesArray' },
                },
            },
            { $sort: { cantidadLikes: -1 } },
            { $skip: offset },
            { $limit: limit },
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'autor',
                    foreignField: '_id',
                    as: 'autor',
                },
            },
            { $unwind: '$autor' },
            {
                $project: {
                    titulo: 1,
                    descripcion: 1,
                    imagenUrl: 1,
                    activa: 1,
                    createdAt: 1,
                    cantidadLikes: 1,
                    'autor.nombre': 1,
                    'autor.apellido': 1,
                    'autor.nombreUsuario': 1,
                    'autor.fotoPerfilUrl': 1,
                },
            },
        ]);

        return resultado;
    }

    // Agrega el conteo de likes a una lista de publicaciones (para el caso de orden por fecha)
    private async agregarConteoLikes(publicaciones: any[]) {
        const ids = publicaciones.map((p) => p._id);
        const conteos = await this.likeModel.aggregate([
            { $match: { publicacion: { $in: ids } } },
            { $group: { _id: '$publicacion', total: { $sum: 1 } } },
        ]);

        const mapaConteos = new Map(conteos.map((c) => [c._id.toString(), c.total]));

        return publicaciones.map((p) => ({
            ...p,
            cantidadLikes: mapaConteos.get(p._id.toString()) ?? 0,
        }));
    }

    // ---------- BAJA LÓGICA ----------
    async eliminar(publicacionId: string, usuario: any) {
        const publicacion = await this.publicacionModel.findById(publicacionId);

        if (!publicacion || !publicacion.activa) {
            throw new NotFoundException('La publicación no existe');
        }

        const esAutor = publicacion.autor.toString() === usuario.sub;
        const esAdmin = usuario.perfil === 'administrador';

        if (!esAutor && !esAdmin) {
            throw new ForbiddenException(
                'No tenés permiso para eliminar esta publicación',
            );
        }

        publicacion.activa = false;
        await publicacion.save();

        return { mensaje: 'Publicación eliminada correctamente' };
    }

    // ---------- LIKES ----------
    async darLike(publicacionId: string, usuarioId: string) {
        const publicacion = await this.publicacionModel.findById(publicacionId);
        if (!publicacion || !publicacion.activa) {
            throw new NotFoundException('La publicación no existe');
        }

        const likeExistente = await this.likeModel.findOne({
            publicacion: new Types.ObjectId(publicacionId),
            usuario: new Types.ObjectId(usuarioId),
        });

        if (likeExistente) {
            throw new BadRequestException('Ya le diste me gusta a esta publicación');
        }

        const nuevoLike = new this.likeModel({
            publicacion: new Types.ObjectId(publicacionId),
            usuario: new Types.ObjectId(usuarioId),
        });

        await nuevoLike.save();
        return { mensaje: 'Me gusta agregado correctamente' };
    }

    async quitarLike(publicacionId: string, usuarioId: string) {
        const resultado = await this.likeModel.findOneAndDelete({
            publicacion: new Types.ObjectId(publicacionId),
            usuario: new Types.ObjectId(usuarioId),
        });

        if (!resultado) {
            throw new BadRequestException('No le habías dado me gusta a esta publicación');
        }

        return { mensaje: 'Me gusta eliminado correctamente' };
    }

}
