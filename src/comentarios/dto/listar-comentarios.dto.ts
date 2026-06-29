import { IsOptional, IsNumberString } from 'class-validator';

export class ListarComentariosDto {
  @IsOptional()
  @IsNumberString({}, { message: 'El offset debe ser un número' })
  offset?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'El limit debe ser un número' })
  limit?: string;
}