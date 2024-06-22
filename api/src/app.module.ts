/* eslint-disable prettier/prettier */
import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([{
       ttl: 60000,
       limit: 10,
  }]),
    forwardRef(() => UserModule), 
    forwardRef(() => AuthModule),
    MailerModule.forRoot({ // Configs para envio de e-mail            
       transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'brigitte60@ethereal.email',
          pass: 'ZgDrgJ1AEFn5986Trz'
    }
      },
      defaults: {
        from: '"TESTE IT FOR PERSONAL API" <brigitte60@ethereal.email>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { 
    provide: APP_GUARD,
    useClass: ThrottlerGuard }],
})
export class AppModule {}
