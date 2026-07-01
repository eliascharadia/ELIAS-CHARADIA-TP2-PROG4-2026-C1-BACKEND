import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { FiltroFechasDto } from './dto/filtro-fechas.dto';
import { AdminGuard } from '../autenticacion/guards/admin.guard';

@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  @HttpCode(HttpStatus.OK)
  publicacionesPorUsuario(@Query() query: FiltroFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(query);
  }

  @Get('comentarios-por-tiempo')
  @HttpCode(HttpStatus.OK)
  comentariosPorTiempo(@Query() query: FiltroFechasDto) {
    return this.estadisticasService.comentariosPorTiempo(query);
  }

  @Get('comentarios-por-publicacion')
  @HttpCode(HttpStatus.OK)
  comentariosPorPublicacion(@Query() query: FiltroFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(query);
  }
}