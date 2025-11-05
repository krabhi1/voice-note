import { RecordingRepository } from '$lib/repositories/recordingRepository';
import type { DrizzleClient } from '../db';
import { RecordingService } from './recordingService';
import { StorageService } from './storageService';

export function createServices(db:DrizzleClient, env: App.Platform['env']) {
	let _recordingService: RecordingService | null = null;
	let _storageService: StorageService | null = null;
	const getStorageService = () => {
		if (!_storageService) {
			_storageService = new StorageService(env.BUCKET);
		}
		return _storageService;
	};
	return {
		get recordingService() {
			if (!_recordingService) {
				const storageService = getStorageService();
				_recordingService = new RecordingService(
					new RecordingRepository(db),
					storageService
				);
			}
			return _recordingService;
		},
		get storageService() {
      return getStorageService();
    }
	};
}

export type Services = ReturnType<typeof createServices>;
