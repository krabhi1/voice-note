import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { uploadSchema } from '@/schemas';

const schema = zod4(uploadSchema);

export const load: PageServerLoad = async () => {
	const uploadVoiceForm = await superValidate(schema);
	return { uploadVoiceForm };
};

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const form = await superValidate(request, schema);
		console.log('Form data received:', form);

		if (!form.valid) {
			const sanitizedForm = {
				...form,
				data: {
					...form.data,
					['voice-note']: null
				}
			};
			return fail(400, { form: sanitizedForm });
		}

		const { 'voice-note': voiceFile, duration, name } = form.data;

		try {
			await services.recordingService.createRecording(voiceFile, duration, user.id, name);
		} catch (err) {
			console.error('Failed to create recording:', err);
			return fail(400, { message: 'Failed to upload voice note.' });
		}

		return message(form, 'Voice note uploaded');
	}
} satisfies Actions;
