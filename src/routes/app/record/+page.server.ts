import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { uploadSchema } from '@/schemas';
import { handleError } from '@/server/utils';

export const load: PageServerLoad = async () => ({
	uploadVoiceForm: await superValidate(zod4(uploadSchema))
});

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(uploadSchema));
		if (!form.valid) return message(form, 'Invalid input');

		try {
			const { fileKey, duration, name, contentType, size } = form.data;
			await services.recordingService.createRecordingFromKey(
				fileKey,
				duration,
				user.id,
				name,
				contentType,
				size
			);
			return message(form, 'Uploaded');
		} catch (e) {
			return handleError(e);
		}
	}
} satisfies Actions;