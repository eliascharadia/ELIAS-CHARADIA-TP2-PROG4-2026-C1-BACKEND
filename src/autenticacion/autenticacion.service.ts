import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PerfilUsuario } from '../usuarios/entities/usuario.schema';

@Injectable()
export class AutenticacionService {
  constructor(
    private usuariosService: UsuariosService,
    private cloudinaryService: CloudinaryService,
    private jwtService: JwtService,
  ) { }

  async registrar(dto: RegisterDto, foto?: { buffer: Buffer }) {
    // 1. Verificar que las contraseñas coincidan
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2. Verificar que correo y nombreUsuario no existan ya
    const existente = await this.usuariosService.existeCorreoOUsuario(
      dto.correo,
      dto.nombreUsuario,
    );
    if (existente) {
      throw new BadRequestException(
        'El correo o el nombre de usuario ya están en uso',
      );
    }

    // 3. Encriptar la contraseña
    const passwordEncriptada = await bcrypt.hash(dto.password, 10);

    // 4. Subir la foto de perfil a Cloudinary (si vino)
    let fotoPerfilUrl: string | undefined;
    if (foto) {
      const resultado = await this.cloudinaryService.uploadImage(foto as any);
      fotoPerfilUrl = resultado.secure_url;
    }

    // 5. Guardar el usuario
    const nuevoUsuario = await this.usuariosService.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion,
      fotoPerfilUrl,
      perfil: PerfilUsuario.USUARIO, // por defecto siempre "usuario"
    });

    // 6. Generar el token, igual que en login
    const token = this.generarToken(nuevoUsuario);

    return {
      token,
      usuario: this.armarRespuestaUsuario(nuevoUsuario),
    };
  }

  async login(dto: LoginDto) {
    // 1. Buscar al usuario por correo o nombre de usuario
    const usuario = await this.usuariosService.buscarPorCorreoOUsuario(
      dto.identificador,
    );
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Comparar la contraseña recibida con la encriptada guardada
    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar el token
    const token = this.generarToken(usuario);

    return {
      token,
      usuario: this.armarRespuestaUsuario(usuario),
    };
  }

  // Método privado reutilizable, evita repetir el armado del payload
  private generarToken(usuario: any): string {
    const payload = {
      sub: usuario._id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.sign(payload);
  }

  private armarRespuestaUsuario(usuario: any) {
    // Nunca devolvemos el password, ni encriptado
    const { password, ...resto } = usuario.toObject
      ? usuario.toObject()
      : usuario;
    return resto;
  }

  async autorizar(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return this.armarRespuestaUsuario(usuario);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async refrescar(token: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    // Generamos un nuevo token con la misma payload (sin el "exp" viejo,
    // que jwtService.sign() recalcula automáticamente según signOptions)
    const nuevaPayload = {
      sub: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };

    const nuevoToken = this.jwtService.sign(nuevaPayload);

    return { token: nuevoToken };
  }
}
