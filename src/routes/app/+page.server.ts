import type { Actions, PageServerLoad } from './$types';
import { validatePaginationParams } from '$lib/utils/pagination';
import { zod4 } from 'sveltekit-superforms/adapters';

import { fail } from '@sveltejs/kit';
import { renameSchema, deleteSchema } from '@/schemas';
import { superValidate, message } from 'sveltekit-superforms';
import { handleError } from '@/server/utils';

export const load: PageServerLoad = async ({ locals: { services, user }, url }) => {
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

export const actions = {
	renameVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(renameSchema));
		if (!form.valid) {
			return message(form, 'Invalid input');
		}

		const { id, title } = form.data;
		try {
			await services.recordingService.renameRecording(id, user.id, title);
		} catch (error) {
			return handleError(error);
		}
		return message(form, 'Voice note renamed');
	},
	deleteVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(deleteSchema));
		if (!form.valid) {
			return message(form, 'Invalid input');
		}

		const { id } = form.data;
		try {
			await services.recordingService.deleteRecording(id, user.id);
		} catch (error) {
			return handleError(error);
		}
		return message(form, 'Voice note deleted');
	}
} satisfies Actions;
