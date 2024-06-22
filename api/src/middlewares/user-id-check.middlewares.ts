import { BadRequestException, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export class UserIdCheckMiddleware implements NestMiddleware{

    use(req: Request, res: Response, next: NextFunction) {
        
        //console.log('UserIdCheckMiddleware','ANTES')

        if(isNaN(Number(req.params.id)) || Number(req.params.id)<=0){
            throw new BadRequestException('ID Inválido !');
        }

        //console.log('UserIdCheckMiddleware','DEPOIS')

        next();
    }

    
}