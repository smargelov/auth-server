import { index, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

@index({ email: 'text', fullName: 'text' })
export class UserModel extends TimeStamps {
	@prop({ required: true, unique: true })
	email: string

	@prop({ required: true })
	role: string

	@prop({ required: true, default: false })
	isActive: boolean

	@prop()
	displayName?: string

	@prop()
	passwordHash: string
}
