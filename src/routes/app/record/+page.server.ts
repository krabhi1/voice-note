import { fail, isActionFailure } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { uploadSchema } from '@/schemas';
import { handleError } from '@/server/utils';

export const load: PageServerLoad = async () => {
	const uploadVoiceForm = await superValidate(zod4(uploadSchema));
	return { uploadVoiceForm };
};

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, zod4(uploadSchema));
		if (!form.valid) {
			return message(form, 'Invalid input');
		}

		const { 'voice-note': voiceFile, duration, name } = form.data;

		try {
			await services.recordingService.createRecording(voiceFile, duration, user.id, name);
		} catch (error) {
			return handleError(error);
		}
		return message(form, 'Voice note uploaded');
	}
} satisfies Actions;
