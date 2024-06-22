import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdatePutUserDTO } from "./dto/update-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {

    constructor (private readonly prisma: PrismaService) {}

    async create (data: CreateUserDTO){

        const salt = await bcrypt.genSalt();

        data.password = await bcrypt.hash(data.password, salt);


        return this.prisma.user.create({
            data,
        });  
    }

    async selectAll (){
        return this.prisma.user.findMany();
    }

    async selectOne (id: number){
        await this.exists(id);
        return this.prisma.user.findUnique({
            where: {
                id
            }
        })
    }

    async updateAll (id: number, {name, email, password, birthAt, role}: UpdatePutUserDTO){
     
        await this.exists(id);
        if(!birthAt){
            birthAt = null;
        }
        const salt = await bcrypt.genSalt();

        password = await bcrypt.hash(password, salt);

            return this.prisma.user.update({
                data:{
                    name, 
                    email, 
                    password, 
                    birthAt: birthAt ? new Date(birthAt) : null, role},
                where: {
                    id
                }
            });
        }

    async updatePartial (id: number, {name, email, password, birthAt, role}: UpdatePatchUserDTO){
        //console.log({data})
        await this.exists(id);
            const data: any = {};

            if (name){
                data.name = name;
            }
            if (email){
                data.email = email;
            }
            if (password){
                const salt = await bcrypt.genSalt();
                data.password = await bcrypt.hash(password, salt);
                
            }
            if (birthAt){
                data.birthAt = new Date(birthAt);
            }
            if (role){
                data.role = role;
            }
        return this.prisma.user.update({
            data,
            where: {
                id
            }
        });
    }

    async delete (id: number){
        //console.log({data})
        await this.exists(id);
        return this.prisma.user.delete({
            where: {
                id
            }
        });
    }

    async exists(id: number){
        if(!(await this.prisma.user.count({
            where: {
                id
            }
        }))){
            throw new NotFoundException(`O usuário ${id} não existe !`)
        }
    }
}