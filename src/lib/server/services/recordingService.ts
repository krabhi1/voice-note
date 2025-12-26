import type { RecordingRepository } from '$lib/server/repositories/recordingRepository';
import type { StorageService } from './storageService';
import { createPaginationMetadata, type PaginationParams, type PaginatedResult } from '$lib/utils/pagination';
import type { Recording } from '$lib/server/db/schema';

export class RecordingService {
	constructor(
		private recordingRepository: RecordingRepository,
		private storageService: StorageService
	) {}



	async createRecordingFromKey(
		fileKey: string,
		duration: number,
		userId: string,
		name: string,
		contentType: string,
		size: number
	) {
		return this.recordingRepository.create({
			title: name,
			duration,
			file_url: fileKey,
			userId,
			content_type: contentType,
			size
		});
	}

	async getRecordingsByUser(userId: string, params?: PaginationParams): Promise<PaginatedResult<Recording>> {
		const [data, total] = await Promise.all([
			params
				? this.recordingRepository.getByUserIdPaginated(userId, params)
				: this.recordingRepository.getByUserId(userId),
			this.recordingRepository.countByUserId(userId)
		]);

		return {
			data,
			pagination: createPaginationMetadata(
				params?.page ?? 1,
				params?.pageSize ?? data.length,
				total
			)
		};
	}

	async getRecordingByIdAndUser(id: string, userId: string) {
		return this.recordingRepository.getByIdAndUserId(id, userId);
	}

	async renameRecording(id: string, userId: string, title: string) {
		if (!(await this.getRecordingByIdAndUser(id, userId))) {
			throw new Error('Recording not found');
		}
		return this.recordingRepository.update(id, { title });
	}

	async deleteRecording(id: string, userId: string) {
		const recording = await this.getRecordingByIdAndUser(id, userId);
		if (!recording) {
			throw new Error('Recording not found');
		}
		await this.storageService.delete(recording.file_url);
		return this.recordingRepository.deleteById(id);
	}
}