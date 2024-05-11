import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface UserModel extends Base {}

export class UserModel extends TimeStamps {
	@prop({ required: true, unique: true })
	email: string

	@prop({ required: true, default: 'user' })
	role: string

	@prop()
	displayName?: string

	@prop()
	passwordHash: string
}
