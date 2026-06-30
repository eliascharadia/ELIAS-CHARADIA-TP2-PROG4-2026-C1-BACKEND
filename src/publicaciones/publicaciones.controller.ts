import {
    Controller,
    Post,
    Get,
    Delete,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { AuthGuard } from 'src/autenticacion/guards/autenticacion.guard';
import { UsuarioActual } from 'src/autenticacion/decoradores/usuario-actual.decorador';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private publicacionesService: PublicacionesService,
        private jwtService: JwtService,
    ) { }

    // POST /publicaciones - crear una publicación
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('imagen'))
    crear(
        @Body() dto: CrearPublicacionDto,
        @UsuarioActual() usuario: any,
        @UploadedFile() imagen?: { buffer: Buffer },
    ) {
        return this.publicacionesService.crear(dto, usuario.sub, imagen);
    }

    // GET /publicaciones - listar con orden, filtro y paginación
  @Get()
  @HttpCode(HttpStatus.OK)
  async listar(@Query() query: ListarPublicacionesDto, @Req() request: Request) {
    const usuarioId = await this.extraerUsuarioIdSiExiste(request);
    return this.publicacionesService.listar(query, usuarioId);
  }

  // GET /publicaciones:id - obtener una publicacion por id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async buscarPorId(@Param('id') id: string, @Req() request: Request) {
    const usuarioId = await this.extraerUsuarioIdSiExiste(request);
    return this.publicacionesService.buscarPorId(id, usuarioId);
  }

  // DELETE /publicaciones/:id - baja lógica
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  // POST /publicaciones/:id/like - dar me gusta
  @Post(':id/like')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  darLike(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.publicacionesService.darLike(id, usuario.sub);
  }

  // DELETE /publicaciones/:id/like - quitar me gusta
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  quitarLike(@Param('id') id: string, @UsuarioActual() usuario: any) {
    return this.publicacionesService.quitarLike(id, usuario.sub);
  }

  private async extraerUsuarioIdSiExiste(request: Request): Promise<string | null> {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) return null;

    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload.sub;
    } catch {
      return null; // token inválido o vencido: tratamos como "sin usuario"
    }
  }

  // ################## COMENTARIOS #############################
  // POST /publicaciones/:publicacionId/comentarios
    @Post('/:publicacionId/comentarios')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    crearComentario(
      @Param('publicacionId') publicacionId: string,
      @Body() dto: CreateComentarioDto,
      @UsuarioActual() usuario: any,
    ) {
      return this.publicacionesService.crearComentario(publicacionId, dto, usuario.sub);
    }

    // GET /publicaciones/:publicacionId/comentarios
      @Get('/:publicacionId/comentarios')
      @HttpCode(HttpStatus.OK)
      listarComentarios(
        @Param('publicacionId') publicacionId: string,
        @Query() query: ListarComentariosDto,
      ) {
        return this.publicacionesService.listarComentarios(publicacionId, query);
      }

    // PUT /publicaciones/:publicacionId/comentarios/:comentarioId
      @Put('/:publicacionId/comentarios/:comentarioId')
      @HttpCode(HttpStatus.OK)
      @UseGuards(AuthGuard)
      editar(
        @Param('comentarioId') comentarioId: string,
        @Body() dto: CreateComentarioDto,
        @UsuarioActual() usuario: any,
      ) {
        return this.publicacionesService.editar(comentarioId, dto, usuario.sub);
      }
}
