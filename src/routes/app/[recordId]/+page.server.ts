import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({
	params: { recordId },
	locals: { services, user }
}) => {
	const recording = await services.recordingService.getRecordingByIdAndUser(recordId, user.id);
	if (!recording) {
		throw new Error('Recording not found');
	}

	const audioUrl = await services.storageService.generatePresignedDownloadUrl(
		recording.file_url,
		3600
	);

	return {
		recording,
		audioUrl
	};
};
