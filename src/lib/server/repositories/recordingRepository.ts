import type { DrizzleClient } from '$lib/server/db';
import { desc, eq, sql } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { PaginationParams } from '$lib/types/pagination';
import type { NewRecording } from '$lib/server/db/schema';
export class RecordingRepository {
	constructor(private db: DrizzleClient) {}
	async create(recording: NewRecording) {
		return await this.db.insert(schema.recording).values(recording).returning().get();
	}

	async getByUserId(userId: string) {
		return await this.db.query.recording.findMany({
			where: (recording) => eq(recording.userId, userId),
			orderBy: (recording) => desc(recording.createdAt)
		});
	}

	async getByUserIdPaginated(userId: string, { page, pageSize }: PaginationParams) {
		const offset = (page - 1) * pageSize;

		return await this.db.query.recording.findMany({
			where: (recording) => eq(recording.userId, userId),
			orderBy: (recording) => desc(recording.createdAt),
			limit: pageSize,
			offset: offset
		});
	}

	async countByUserId(userId: string): Promise<number> {
		const recordings = await this.db.query.recording.findMany({
			where: (recording) => eq(recording.userId, userId),
			columns: { id: true }
		});

		return recordings.length;
	}

	async getById(id: string) {
		return await this.db.query.recording.findFirst({
			where: (recording) => eq(recording.id, id)
		});
	}

	async deleteById(id: string) {
		return await this.db
			.delete(schema.recording)
			.where(eq(schema.recording.id, id))
			.returning()
			.get();
	}
}
