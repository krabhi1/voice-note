import type { RecordingRepository } from "$lib/repositories/recordingRepository";
import type { StorageService } from "./storageService";

export class RecordingService {
  constructor(
    private recordingRepository: RecordingRepository,
    private storageService: StorageService
  ) {}

  async createRecording(
    file: File,
    duration: number,
    userId: string
  ) {
    // Upload file to storage
    const fileUrl = await this.storageService.uploadRecording(file, userId);
    // Create recording entry in database
    const recording = await this.recordingRepository.create({
      title: file.name,
      duration,
      file_url: fileUrl,
      userId,
      content_type: file.type,
      size: file.size
    });
    return recording;
  }
  async getRecordingsByUser(userId: string) {
    return this.recordingRepository.getByUserId(userId);
  }
}
