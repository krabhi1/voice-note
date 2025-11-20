import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({
	params: { recordId },
	locals: { services, user },
}) => {
  const recording = await services.recordingService.getRecordingByIdAndUser(recordId, user.id);
  if (!recording) {
    throw new Error('Recording not found');
  }
  return {
    recording
  };
}
