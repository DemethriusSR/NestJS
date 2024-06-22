/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Get, Put, Patch, Delete, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePutUserDTO } from "./dto/update-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user.dto";
import { UserService } from "./user.service";
import { ParamId } from "src/decorator/param-id.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { LogInterceptor } from "src/interceptors/log.interceptor";
import { Roles } from "src/decorator/roles.decorator";
import { Role } from "src/enums/role.enum";
import { AuthGuard } from "src/auth/guards/auth.guard";



@UseGuards( AuthGuard,RolesGuard)
@UseInterceptors(LogInterceptor)
@Roles(Role.Admin)
@Controller('users') //Route USER

export class UserController {

    constructor(private readonly userService: UserService){}

    @Post()
        async create(@Body() data: CreateUserDTO){
            return this.userService.create(data);
        }

    @Get()
        async read(){ //Teantando fazer o Select
            return this.userService.selectAll();
        }

    @Get(':id')
        async readOne(@ParamId() id: number){
            return this.userService.selectOne(id);
        }
    
    @Put(':id')
        async update(@Body() data: UpdatePutUserDTO, @ParamId() id: number){ // Colocar sempre o "data: UpdatePutUserDTO" Primeiro
            return this.userService.updateAll(id, data);
        }
    
    @Patch(':id')
        async updatePartial(@Body() data: UpdatePatchUserDTO,@ParamId() id: number){ // Colocar sempre o "data: UpdatePatchUserDTO" Primeiro
            return this.userService.updatePartial(id, data);
        }
    
    @Delete(':id')
        
        async delete(@ParamId() id: number){
            
            return this.userService.delete(id);            
        }

    
}