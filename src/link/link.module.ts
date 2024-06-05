import { Module } from '@nestjs/common'
import { LinkController } from './link.controller'
import { LinkService } from './link.service'
import { UserModule } from '../user/user.module'
import { MailModule } from '../mail/mail.module'
import { ConfigModule } from '@nestjs/config'
import { CookieModule } from '../cookie/cookie.module'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [UserModule, MailModule, CookieModule, AuthModule, ConfigModule],
	controllers: [LinkController],
	providers: [LinkService],
	exports: [LinkService]
})
export class LinkModule {}
