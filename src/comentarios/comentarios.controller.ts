import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { AuthGuard } from '../autenticacion/guards/autenticacion.guard';
import { UsuarioActual } from '../autenticacion/decoradores/usuario-actual.decorador';

@Controller('publicaciones/:publicacionId/comentarios')
export class ComentariosController {
  constructor(private comentariosService: ComentariosService) {}

  // POST /publicaciones/:publicacionId/comentarios
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CreateComentarioDto,
    @UsuarioActual() usuario: any,
  ) {
    return this.comentariosService.crear(publicacionId, dto, usuario.sub);
  }

  // GET /publicaciones/:publicacionId/comentarios
  @Get()
  @HttpCode(HttpStatus.OK)
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query() query: ListarComentariosDto,
  ) {
    return this.comentariosService.listar(publicacionId, query);
  }

  // PUT /publicaciones/:publicacionId/comentarios/:comentarioId
  @Put(':comentarioId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  editar(
    @Param('comentarioId') comentarioId: string,
    @Body() dto: CreateComentarioDto,
    @UsuarioActual() usuario: any,
  ) {
    return this.comentariosService.editar(comentarioId, dto, usuario.sub);
  }
}