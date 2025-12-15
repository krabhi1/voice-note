import { isActionFailure, fail } from '@sveltejs/kit';

export function handleError(error: unknown) {
	console.error(error);
	if (isActionFailure(error)) {
		return error;
	}
	return fail(500, {
		message: 'Internal Server Error'
	});
}
