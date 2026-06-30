import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CrearUsuarioAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9]).+$/, {
    message: 'La contraseña debe tener al menos una mayúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Debés repetir la contraseña' })
  repetirPassword: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser "usuario" o "administrador"' })
  perfil: string;
}