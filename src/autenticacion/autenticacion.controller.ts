import { Req, Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import express from 'express';
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

    @Post('autorizar')
    @HttpCode(HttpStatus.OK)
    async autorizar(@Req() request: express.Request) {
        const token = this.extraerToken(request);
        return this.autenticacionService.autorizar(token);
    }

    @Post('refrescar')
    @HttpCode(HttpStatus.OK)
    async refrescar(@Req() request: express.Request) {
        const token = this.extraerToken(request);
        return this.autenticacionService.refrescar(token);
    }
    

    private extraerToken(request: express.Request): string {
        const authHeader = request.headers.authorization;
        const [tipo, token] = authHeader?.split(' ') ?? [];

        if (tipo !== 'Bearer' || !token) {
        throw new UnauthorizedException('Token no proporcionado');
        }

        return token;
    }
}
