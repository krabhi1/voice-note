import { error, fail, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { validatePaginationParams } from '$lib/types/pagination';

export const load: PageServerLoad = async ({ params, depends, locals: { services, user }, url }) => {
	const paginationParams = validatePaginationParams(
		url.searchParams.get('page'),
		url.searchParams.get('size')
	);

	const paginatedRecordings = await services.recordingService.getRecordingsByUser(
		user.id,
		paginationParams
	);

	return {
		recordings: paginatedRecordings.data,
		pagination: paginatedRecordings.pagination
	};
};

export const actions = {
} satisfies Actions;
