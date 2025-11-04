import { error, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
export const load: PageServerLoad = ({ params }) => {
	return {
		name: 'temp page'
	};
};

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
				userId: user?.id
			});

			const result = await services.recordingService.createRecording(file, duration, userId);
			return { message: 'File uploaded successfully', data: result };
		} catch (validationError) {
			console.error('Validation error:', validationError);
			return error(
				400,
				validationError instanceof z.ZodError ? z.prettifyError(validationError) : 'Invalid input data'
			);
		}
	}
} satisfies Actions;
