import { ListMetaResponse } from './list-meta.response'

export class FullListResponse<T> {
	items: T[]

	meta: ListMetaResponse
}
