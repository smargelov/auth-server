import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from './mail.service'
import { MailController } from './mail.controller'
import { UserModule } from '../user/user.module'

@Module({
	imports: [UserModule, ConfigModule],
	controllers: [MailController],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
