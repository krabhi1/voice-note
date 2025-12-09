export const GET = async ({ params, locals: { services } }) => {
	console.log('Fetching audio with key:', params.key);
	const signedUrl = await services.storageService.generatePresignedDownloadUrl(params.key, 60); // valid for 60 seconds

	return new Response(null, {
		status: 303,
		headers: {
			Location: signedUrl,
			'Cache-Control': 'no-store' // prevent caching
		}
	});
};
