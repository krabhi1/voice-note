import type { RecordingRepository } from '$lib/server/repositories/recordingRepository';
import type { StorageService } from './storageService';
import type { PaginationParams, PaginatedResult } from '$lib/types/pagination';
import { createPaginationMetadata } from '$lib/types/pagination';
import type { Recording } from '$lib/server/db/schema';

export class RecordingService {
  constructor(
    private recordingRepository: RecordingRepository,
    private storageService: StorageService
  ) { }

  async createRecording(file: File, duration: number, userId: string,name:string) {
    // Upload file to storage
    const fileUrl = await this.storageService.uploadRecording(file, userId);
    // Create recording entry in database
    const recording = await this.recordingRepository.create({
      title: name,
      duration,
      file_url: fileUrl,
      userId,
      content_type: file.type,
      size: file.size
    });
    return recording;
  }
  async getRecordingsByUser(
    userId: string,
    paginationParams?: PaginationParams
  ): Promise<PaginatedResult<Recording>> {
    if (!paginationParams) {
      const [recordings, totalCount] = await Promise.all([
        this.recordingRepository.getByUserId(userId),
        this.recordingRepository.countByUserId(userId)
      ]);

      const pagination = createPaginationMetadata(
        1,
        recordings.length,
        totalCount
      );

      return {
        data: recordings,
        pagination
      };
    }

    const [recordings, totalCount] = await Promise.all([
      this.recordingRepository.getByUserIdPaginated(userId, paginationParams),
      this.recordingRepository.countByUserId(userId)
    ]);

    const pagination = createPaginationMetadata(
      paginationParams.page,
      paginationParams.pageSize,
      totalCount
    );

    return {
      data: recordings,
      pagination
    };
  }
  async getRecordingByIdAndUser(recordId: string, userId: string) {
    const recording = await this.recordingRepository.getByIdAndUserId(
      recordId,
      userId
    );
    return recording;
  }
}
