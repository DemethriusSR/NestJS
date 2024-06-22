import { 
    BadRequestException, Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, 
    UseGuards, UseInterceptors
} from "@nestjs/common";
import { AuthLoginDTO } from "./dto/auth-login.dto";
import { AuthRegisterDTO} from "./dto/auth-register.dto";
import { AuthrForgetDTO } from "./dto/auth-forget.dto";
import { AuthResetDTO } from "./dto/auth-reset.dto";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { User } from "src/decorator/user.decorator";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { join } from 'path'
import { FileService } from "src/file/file.service";
import { UploadedFile, UploadedFiles } from "@nestjs/common/decorators";



@Controller('auth')
export class AuthController{

    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService,
    ){}

    @Post('login')
    async login(@Body() { email, password }: AuthLoginDTO){
        return this.authService.login(email, password);
    }
    
    @Post('register')
    async register(@Body() body: AuthRegisterDTO){
        return this.userService.create(body);
    }

    @Post('forget')
    async forget(@Body() { email }: AuthrForgetDTO){
        return this.authService.forget(email);
    }

    @Post('reset')
    async reset(@Body() { password, token }: AuthResetDTO){
        return this.authService.reset(password, token);
    }

    @UseGuards(AuthGuard)
    @Post('me')
    async me(@User('') user){
        //return {me:'OK'}
        return {user};
    }

    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AuthGuard)
    @Post('photo')
    async upload(@User('') user, 
    @UploadedFile(new ParseFilePipe({
        validators: [
            new FileTypeValidator({fileType:'image/*'}),
            new MaxFileSizeValidator({maxSize: 1024 * 150}),
        ]
    })) photo: Express.Multer.File){
        
        //Formatando Data
        const date = new Date().toLocaleString('pt-BR').substring(0, 10);
        const log = date.replace(new RegExp("/",'g'),"-");
    
        // Usando JOIN para concatenar nome da pasta e nome do arquivo de saída
        const path = join(__dirname, '..', '..', 'temp', 'photos', `upload_${log}_${user.name}.png` )

        try{
            await this.fileService.upload(photo, path);
        }catch(e){
            throw new BadRequestException(e);
        }
            

        return {sucess: true};
    }

    @UseInterceptors(FilesInterceptor('file'))
    @UseGuards(AuthGuard)
    @Post('files')
    async uploadFiles(@User('') user, @UploadedFiles() files: Express.Multer.File []){
        return files
    }

    @UseInterceptors(FileFieldsInterceptor([{
       name: 'photo',
       maxCount: 1 
    },{
        name: 'documents',
        maxCount: 10
    }]))
    @UseGuards(AuthGuard)
    @Post('files-fields')
    async uploadFilesFields(@User('') user, @UploadedFiles() files: {photo: Express.Multer.File, documents: Express.Multer.File []}){
        return files;
    }

}