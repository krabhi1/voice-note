import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

export const actions = {
	uploadVoice: async ({ request, locals: { services, user } }) => {
		const formData = await request.formData();

		const uploadSchema = z.object({
			file: z.instanceof(File).refine((file) => file.size > 0, 'File cannot be empty'),
			duration: z.coerce.number().positive('Duration must be positive'),
			userId: z.string().min(1, 'User ID is required')
		});

		try {
			const { file, duration, userId } = uploadSchema.parse({
				file: formData.get('voice-note'),
				duration: formData.get('duration'),
				userId: user.id
			});

			const result = await services.recordingService.createRecording(file, duration, userId);
			return { message: 'File uploaded successfully', data: result };
		} catch (e) {
			if (e instanceof z.ZodError) {
				return fail(400, { errors: z.prettifyError(e) });
			}
			return fail(500, { errors: e instanceof Error ? e.message : 'Internal Server Error' });
		}
	}
} satisfies Actions;
