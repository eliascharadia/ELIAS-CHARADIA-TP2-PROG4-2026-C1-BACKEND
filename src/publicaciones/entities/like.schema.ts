import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Índice compuesto: un usuario no puede tener 2 likes en la misma publicación
LikeSchema.index({ publicacion: 1, usuario: 1 }, { unique: true });