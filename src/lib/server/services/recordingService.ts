import type { RecordingRepository } from '$lib/server/repositories/recordingRepository';
import type { StorageService } from './storageService';
import type { PaginationParams, PaginatedResult } from '$lib/utils/pagination';
import { createPaginationMetadata } from '$lib/utils/pagination';
import type { Recording } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

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
  async renameRecording(recordId: string, userId: string, newTitle: string) {
    const recording = await this.getRecordingByIdAndUser(recordId, userId);
    if (!recording) {
      throw fail(404, { message: 'Recording not found' });
    }
    return await this.recordingRepository.update(recordId, { title: newTitle });
  }

  async deleteRecording(recordId: string, userId: string) {
    const recording = await this.getRecordingByIdAndUser(recordId, userId);
    if (!recording) {
      throw fail(404, { message: 'Recording not found' });
    }
    // Delete from storage
    await this.storageService.delete(recording.file_url);
    // Delete from database
    await this.recordingRepository.deleteById(recordId);
    return true;
  }
}
