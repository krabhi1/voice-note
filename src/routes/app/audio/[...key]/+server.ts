export const GET = async ({ params, locals: { services } }) => {
	console.log('Fetching audio with key:', params.key);
	const signedUrl = await services.storageService.generatePresignedDownloadUrl(params.key, 60, true); // valid for 60 seconds
	console.log('Generated signed URL:', signedUrl);
	return new Response(null, {
		status: 303,
		headers: {
			Location: signedUrl,
			'Cache-Control': 'no-store' // prevent caching
		}
	});
};
