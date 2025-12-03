import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

const uploadSchema = z.object({
	file: z.instanceof(File).refine((file) => file.size > 0, 'File cannot be empty'),
	duration: z.coerce.number().positive('Duration must be positive'),
	userId: z.string().min(1, 'User ID is required'),
	name: z.string().min(1, 'Name is required')
});

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const formData = await request.formData();

		const parsed = uploadSchema.safeParse({
			file: formData.get('voice-note'),
			duration: formData.get('duration'),
			userId: user.id,
			name: formData.get('name')
		});

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors;

			return fail(400, {
				fieldErrors
			});
		}

		const { file, duration, userId, name } = parsed.data;

		try {
			const result = await services.recordingService.createRecording(file, duration, userId, name);

			return {
				success: true,
				data: result
			};
		} catch (err) {
			return fail(500, {
				formError: 'Failed to upload file'
			});
		}
	}
} satisfies Actions;
