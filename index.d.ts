export {}

declare global {
	type Nullable<T> = T | null

	type IsNullable<T> = T extends Nullable<infer _> ? true : false
	type NullableInterface<T> = {
		[P in keyof T]: IsNullable<T[P]> extends true
			? T[P]
			: T[P] extends object
				? NullableInterface<T[P]>
				: Nullable<T[P]>
	}
}
