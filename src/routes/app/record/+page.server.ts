import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

const uploadSchema = z.object({
	'voice-note': z
		.instanceof(File, { message: 'A file is required.' })
		.refine((file) => file.size > 0, 'File cannot be empty.'),
	duration: z.coerce.number().positive('Duration must be positive.'),
	userId: z.string().min(1, 'User ID is required.'),
	name: z.string().min(1, 'Name is required.')
});

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const parsed = uploadSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors;
			return fail(400, {
				errors: fieldErrors,
				message: 'Validation failed'
			});
		}

		const { 'voice-note': file, duration, userId, name } = parsed.data;
		const result = await services.recordingService.createRecording(file, duration, userId, name);
		return {
			success: true,
			data: result
		};
	}
} satisfies Actions;
