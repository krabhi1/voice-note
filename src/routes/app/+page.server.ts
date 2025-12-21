import type { Actions, PageServerLoad } from './$types';
import { validatePaginationParams } from '$lib/utils/pagination';
import { zod4 } from 'sveltekit-superforms/adapters';
import { renameSchema, deleteSchema } from '@/schemas';
import { superValidate, message } from 'sveltekit-superforms';
import { handleError } from '@/server/utils';

export const load: PageServerLoad = async ({ locals: { services, user }, url }) => {
	const params = validatePaginationParams(url.searchParams.get('page'), url.searchParams.get('size'));
	const { data: recordings, pagination } = await services.recordingService.getRecordingsByUser(user.id, params);
	return { recordings, pagination };
};

export const actions = {
	renameVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(renameSchema));
		if (!form.valid) return message(form, 'Invalid input');

		try {
			await services.recordingService.renameRecording(form.data.id, user.id, form.data.title);
			return message(form, 'Renamed');
		} catch (e) {
			return handleError(e);
		}
	},
	deleteVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(deleteSchema));
		if (!form.valid) return message(form, 'Invalid input');

		try {
			await services.recordingService.deleteRecording(form.data.id, user.id);
			return message(form, 'Deleted');
		} catch (e) {
			return handleError(e);
		}
	}
} satisfies Actions;