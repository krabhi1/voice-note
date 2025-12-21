import { isActionFailure, fail } from '@sveltejs/kit';

export const handleError = (e: any) => {
	console.error(e);
	return isActionFailure(e) ? e : fail(500, { message: e?.message || 'Internal Server Error' });
};