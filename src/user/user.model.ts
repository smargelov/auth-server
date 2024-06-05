import { index, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

@index({ email: 'text', displayName: 'text' })
export class UserModel extends TimeStamps {
	@prop({ required: true, unique: true })
	email: string

	@prop({ required: true })
	role: string

	@prop({ required: true, default: false })
	isActive: boolean

	@prop({ required: true, default: false })
	isConfirmedEmail: boolean

	@prop({ required: true, default: false })
	canChangePassword?: boolean

	@prop()
	emailConfirmationToken?: Nullable<string>

	@prop()
	resetPasswordToken?: Nullable<string>

	@prop()
	displayName?: string

	@prop()
	passwordHash: string
}
