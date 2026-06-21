import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private autenticacionService: AutenticacionService) {}
    
    @Post('registro')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('fotoPerfil'))
    async registro(@Body() registerDto: RegisterDto, @UploadedFile() fotoPerfil?: { buffer: Buffer },) {
        return this.autenticacionService.registrar(registerDto, fotoPerfil);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.autenticacionService.login(loginDto);
    }
}
