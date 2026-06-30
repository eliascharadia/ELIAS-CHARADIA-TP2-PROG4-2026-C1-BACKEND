import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { AdminGuard } from '../autenticacion/guards/admin.guard';

@Controller('usuarios')
@UseGuards(AdminGuard) // con esto todas las rutas estan protegidas
export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    listar(){
        return this.usuariosService.listarTodos();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    crear(@Body() dto: CrearUsuarioAdminDto){
        return this.usuariosService.crearComoAdmin(dto);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    desabilitar(@Param('id') id: string){
        return this.usuariosService.deshabilitar(id);
    }

    @Post(':id/habilitar')
    @HttpCode(HttpStatus.OK)
    habilitar(@Param('id') id: string){
        return this.usuariosService.habilitar(id);
    }
}
