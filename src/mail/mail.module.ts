import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'
import { MailController } from './mail.controller'
import { MailerModule } from '@nestjs-modules/mailer'
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter'
import { join } from 'path'

@Module({
	imports: [
		ConfigModule,
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				transport: {
					host: configService.get<string>('mail.host'),
					port: configService.get<number>('mail.port'),
					secure: true,
					auth: {
						user: configService.get<string>('mail.user'),
						pass: configService.get<string>('mail.password')
					}
				},
				defaults: {
					from: `"no-reply" <${configService.get<string>('mail.from')}>`
				},
				template: {
					dir: join(__dirname, '../../src/mail/templates'),
					adapter: new PugAdapter(),
					options: {
						strict: true
					}
				}
			})
		})
	],
	controllers: [MailController],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
