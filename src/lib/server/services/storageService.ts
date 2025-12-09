// src/lib/server/services/storage-simple.ts

import { nanoid } from 'nanoid';
import { env } from '$env/dynamic/private';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageService {
	private s3Client: S3Client;
	constructor(private bucket: R2Bucket) {
		this.s3Client = new S3Client({
			region: 'auto', // Required by SDK but not used by R2
			// Provide your Cloudflare account ID
			endpoint: env.CLOUDFLARE_R2_S3_API_URL,
			// Retrieve your S3 API credentials for your R2 bucket via API tokens (see: https://developers.cloudflare.com/r2/api/tokens)
			credentials: {
				accessKeyId: env.CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
				secretAccessKey: env.CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY
			}
		});
	}

	async uploadRecording(file: File, userId: string): Promise<string> {
		const timestamp = Date.now();
		const extension = file.name.split('.').pop();
		const fileName = `${timestamp}-${nanoid()}.${extension}`;
		const fileKey = `users/${userId}/audio/recordings/${fileName}`;

		const result = await this.bucket.put(fileKey, file, {
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
	async generatePresignedDownloadUrl(fileKey: string, expiresInSeconds = 60): Promise<string> {
		return await getSignedUrl(
			this.s3Client,
			new GetObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET_NAME, Key: fileKey }),
			{ expiresIn: expiresInSeconds }
		);
	}
}
