import type { Actions, PageServerLoad } from './$types';
import { validatePaginationParams } from '../../lib/utils/pagination';
import { z } from 'zod';
import { fail, isActionFailure, isHttpError } from '@sveltejs/kit';
export const load: PageServerLoad = async ({
	params,
	depends,
	locals: { services, user },
	url
}) => {
	const paginationParams = validatePaginationParams(
		url.searchParams.get('page'),
		url.searchParams.get('size')
	);

	const paginatedRecordings = await services.recordingService.getRecordingsByUser(
		user.id,
		paginationParams
	);

	return {
		recordings: paginatedRecordings.data,
		pagination: paginatedRecordings.pagination
	};
};

const deleteSchema = z.object({
	recordingId: z.string().min(1, 'Recording ID is required.')
});

export const actions = {
	deleteVoice: async ({ request, locals: { services, user } }) => {
		const parsed = deleteSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors;
			return fail(400, {
				errors: fieldErrors,
				message: 'Validation failed'
			});
		}
		const { recordingId } = parsed.data;
		try {
			await services.recordingService.deleteRecording(recordingId, user.id);
			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			if (isActionFailure(error)) {
				return error;
			} else {
				return fail(500, {
					message: 'Internal Server Error'
				});
			}
		}
	}
} satisfies Actions;
