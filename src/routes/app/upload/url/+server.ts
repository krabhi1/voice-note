import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { services, user } }) => {
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { fileName, contentType } = (await request.json()) as {
			fileName: string;
			contentType: string;
		};

		if (!fileName || !contentType) {
			throw error(400, 'fileName and contentType are required');
		}

		const { uploadUrl, fileKey } = await services.storageService.generatePresignedUploadUrl(
			user.id,
			fileName,
			contentType
		);

		return json({ uploadUrl, fileKey });
	} catch (e) {
		console.error('Error generating presigned URL:', e);
		throw error(500, 'Failed to generate upload URL');
	}
};