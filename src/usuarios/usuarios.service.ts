import { Injectable, ConflictException, BadRequestException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument, PerfilUsuario  } from './entities/usuario.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';

@Injectable()
export class UsuariosService {
    constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async crear(datos: Partial<Usuario>): Promise<UsuarioDocument> {
    const nuevoUsuario = new this.usuarioModel(datos);
    return nuevoUsuario.save();
  }

  async buscarPorCorreoOUsuario(identificador: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({
      $or: [{ correo: identificador }, { nombreUsuario: identificador }],
    });
  }

  async existeCorreoOUsuario(correo: string, nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({
      $or: [{ correo }, { nombreUsuario }],
    });
  }

  async buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id);
  }


  // sprint 4
  async listarTodos(): Promise<UsuarioDocument[]> {
    return this.usuarioModel.find().select('-password');
  }

  async crearComoAdmin(dto: CrearUsuarioAdminDto): Promise<UsuarioDocument> {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existente = await this.existeCorreoOUsuario(dto.correo, dto.nombreUsuario);
    if (existente) {
      throw new ConflictException('El correo o el nombre de usuario ya están en uso');
    }

    const passwordEncriptada = await bcrypt.hash(dto.password, 10);

    return this.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion,
      perfil: dto.perfil as PerfilUsuario,
    });
  }

  async deshabilitar(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new ConflictException('El usuario no existe');
    }
    usuario.habilitado = false;
    return usuario.save();
  }

  async habilitar(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarioModel.findById(id);
    if (!usuario) {
      throw new ConflictException('El usuario no existe');
    }
    usuario.habilitado = true;
    return usuario.save();
  }
}
