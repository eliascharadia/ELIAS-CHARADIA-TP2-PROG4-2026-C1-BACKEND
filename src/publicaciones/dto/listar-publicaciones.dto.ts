import { IsOptional, IsIn, IsNumberString, IsMongoId } from 'class-validator';

export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'likes'], { message: 'El ordenamiento debe ser "fecha" o "likes"' })
  orden?: 'fecha' | 'likes';

  @IsOptional()
  @IsMongoId({ message: 'El usuarioId no es válido' })
  usuarioId?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El offset debe ser un número' })
  offset?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El limit debe ser un número' })
  limit?: string;
}