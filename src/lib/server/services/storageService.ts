// src/lib/server/services/storage-simple.ts

import { nanoid } from 'nanoid';
export class StorageService {
	constructor(private bucket: R2Bucket) {}

	async uploadRecording(file: File, userId: string): Promise<string> {
		const timestamp = Date.now();
		const extension = file.name.split('.').pop();
		const fileName = `${timestamp}-${nanoid()}.${extension}`;
		const fileKey = `users/${userId}/audio/recordings/${fileName}`;

		const result=await this.bucket.put(fileKey, file, {
			httpMetadata: { contentType: file.type },
			customMetadata: {
				userId,
				originalName: file.name,
				createdAt: new Date().toISOString()
			}
		});
		return result.key;
	}

	async get(fileKey: string) {
		return await this.bucket.get(fileKey);
	}

	async delete(fileKey: string) {
		await this.bucket.delete(fileKey);
	}

	async list(userId: string) {
		const prefix = `users/${userId}/audio/recordings/`;
		const result = await this.bucket.list({ prefix });
		return result.objects;
	}
}
