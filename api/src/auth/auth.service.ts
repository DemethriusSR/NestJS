import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthRegisterDTO } from "./dto/auth-register.dto";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { MailerService } from "@nestjs-modules/mailer";



@Injectable()
export class AuthService {

    constructor (
        private readonly jwtService : JwtService, 
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly mailer: MailerService,
    ){}

    private issuer = 'login';
    private audience = 'users';


    createToken(user: User){
        return {
            accessToken: this.jwtService.sign({
                id:    user.id,
                name:  user.name,
                email: user.email
            }, { 
                expiresIn: "3 days",
                subject: String(user.id),
                issuer: this.issuer,
                audience:this.audience
            })
        }
    }

    checkToken(token: string){
        try{
            const data =  this.jwtService.verify(token,{
                issuer: this.issuer,
                audience:this.audience,
            });

            return data;

        } catch(e){
            throw new BadRequestException(e)
        }
        
    }

    isValidToken(token: string){
        try{
            this.checkToken(token);
            return true;
        } catch(e){
            return false;
        }
            
    }

    async login(email: string, password: string){
        const user = await this.prisma.user.findFirst({
            where:{
                email,
            }
        });
        if(!user) {
            throw new UnauthorizedException('Email ou senha incorretos !');
        }

        if(!await bcrypt.compare(password, user.password)){
            throw new UnauthorizedException('Email ou senha incorretos !');
        }

        return this.createToken(user);
    }

    async forget(email: string){
        const user = await this.prisma.user.findFirst({
            where:{
                email
            }
        });
        if(!user) {
            throw new UnauthorizedException('E-mail incorretos !');
        }
        
        const token = this.jwtService.sign({ // TO_DO ver na outra aplicação angukar-backend a mesma logica para pegar secret e expires
            id: user.id
        }, {
            expiresIn: "30 minutes",
            subject: String(user.id),
            issuer: 'forget',
            audience:'users',
        });
        

        await this.mailer.sendMail({
            subject: 'Recuperção de senha',
            to: 'demethrius@gmail.com',
            template: 'forget',
            context: {
                name: user.name,
                token,
            }    
        })

        return {sucess: true};
    }

    async reset(password: string, token:string){

        try{
            const data: any =  this.jwtService.verify(token,{
                issuer: 'forget',
                audience:'users',
            });
            
            if(isNaN(Number(data.id))){
                throw new BadRequestException('Token inválido')
            }

            const salt = await bcrypt.genSalt(); //Fazendo o HASH da senha, encripitando via HASH
            password = await bcrypt.hash(password, salt); //Fazendo o HASH da senha, encripitando via HASH

            const user = await this.prisma.user.update({
                where:{
                    id: Number(data.id),
                },
                data:{
                    password,
                },
        });

        return this.createToken(user);

        } catch(e){
            throw new BadRequestException(e)
        }
    }

    async register (data: AuthRegisterDTO){

        const user = await this.userService.create(data);

        return this.createToken(user);
    }

}