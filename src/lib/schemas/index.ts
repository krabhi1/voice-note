import { z } from 'zod';

export const uploadSchema = z.object({
	'voice-note': z
		.instanceof(File, { message: 'A file is required.' })
		.refine((file) => file.size > 0, 'File cannot be empty.'),
	duration: z.coerce.number().positive('Duration must be positive.'),
	name: z.string().min(1, 'Name is required.')
});