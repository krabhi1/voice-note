import { z } from 'zod';

const uploadSchema = z.object({
	'voice-note': z
		.instanceof(File, { message: 'A file is required.' })
		.refine((file) => file.size > 0, 'File cannot be empty.'),
	duration: z.coerce.number().positive('Duration must be positive.'),
	name: z.string().min(1, 'Name is required.')
});

const deleteSchema = z.object({
	id: z.string().min(1, 'Recording ID is required.')
});

const renameSchema = z.object({
	id: z.string().min(1, 'Recording ID is required.'),
	title: z.string().min(1, 'Title is required.')
});

export { deleteSchema, renameSchema, uploadSchema };
