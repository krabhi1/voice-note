export interface PaginationParams {
	page: number;
	pageSize: number;
}

export interface PaginationMeta {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
	data: T[];
	pagination: PaginationMeta;
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const VALID_PAGE_SIZES = [5, 10, 25, 50, 100] as const;

export type ValidPageSize = (typeof VALID_PAGE_SIZES)[number];
import { z } from 'zod';

export function createPaginationMetadata(
	currentPage: number,
	pageSize: number,
	totalItems: number
): PaginationMeta {
	const totalPages = Math.ceil(totalItems / pageSize);

	return {
		currentPage,
		totalPages,
		totalItems,
		pageSize,
		hasNextPage: currentPage < totalPages,
		hasPreviousPage: currentPage > 1
	};
}

export function validatePaginationParams(page: unknown, pageSize: unknown): PaginationParams {
	const paginationSchema = z.object({
		page: z.preprocess((val) => {
			const n = Number(val);
			// mimic original behavior: falsy values (NaN, 0, "", null, undefined) fall back to 1,
			// otherwise use the numeric value and ensure at least 1
			const used = n || 1;
			return Math.max(1, used);
		}, z.number()),
		pageSize: z.preprocess((val) => {
			const n = Number(val);
			// falsy values fall back to DEFAULT_PAGE_SIZE, otherwise use numeric value
			const used = n || DEFAULT_PAGE_SIZE;
			// clamp between 1 and MAX_PAGE_SIZE
			return Math.min(MAX_PAGE_SIZE, Math.max(1, used));
		}, z.number())
	});

	return paginationSchema.parse({ page, pageSize });
}
