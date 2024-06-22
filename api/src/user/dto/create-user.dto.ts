/* eslint-disable prettier/prettier */
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { Role } from "src/enums/role.enum";

export class CreateUserDTO{
    @IsString()
    name: string;

    @IsEmail()
    email:string;

    @IsStrongPassword({ // Por padrão os outros valores do decoretor será 1
        minLength: 7,
        minNumbers: 0,
        minLowercase: 0,
        minSymbols: 0,
        minUppercase: 0
    })
    password: string;

    @IsOptional()
    @IsDateString()
    birthAt: string;

    @IsOptional()
    @IsEnum(Role)
    role: number;
}