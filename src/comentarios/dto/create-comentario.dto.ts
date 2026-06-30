import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateComentarioDto {
    @IsString()
    @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
    mensaje: string;
}
