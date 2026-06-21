import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum PerfilUsuario {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  correo!: string;

  @Prop({ required: true, unique: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  password!: string; // se guarda encriptada

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop()
  descripcion?: string;

  @Prop()
  fotoPerfilUrl?: string;

  @Prop({ type: String, enum: PerfilUsuario, default: PerfilUsuario.USUARIO })
  perfil!: PerfilUsuario;

  @Prop({ default: true })
  habilitado!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);