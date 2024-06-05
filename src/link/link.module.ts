import { Module } from '@nestjs/common'
import { LinkController } from './link.controller'
import { LinkService } from './link.service'
import { UserModule } from '../user/user.module'
import { MailModule } from '../mail/mail.module'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [UserModule, MailModule, ConfigModule],
	controllers: [LinkController],
	providers: [LinkService]
})
export class LinkModule {}
