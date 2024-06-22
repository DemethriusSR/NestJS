import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/decorator/roles.decorator";
import { User } from "src/decorator/user.decorator";
import { Role } from "src/enums/role.enum";




@Injectable()
export class RolesGuard implements CanActivate{

    constructor (
        private readonly reflector: Reflector
    ){}

        async canActivate(context: ExecutionContext){
            
            const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
            
            if(!requiredRoles){
                return true;
            }

            const {user} = context.switchToHttp().getRequest(); 
            
            const rolesFilted = requiredRoles.filter(role => role === user.role);

            return rolesFilted.length > 0;
                
        }
} 