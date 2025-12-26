import { z } from 'zod';

const uploadSchema = z.object({
	fileKey: z.string().min(1, 'File key is required.'),
	contentType: z.string().min(1, 'Content type is required.'),
	size: z.coerce.number().positive('Size must be positive.'),
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
