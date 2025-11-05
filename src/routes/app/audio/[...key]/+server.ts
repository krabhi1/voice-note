export const GET = async ({ params, locals: { services } }) => {
  console.log('Fetching audio with key:', params.key);
	const object = await services.storageService.get(params.key);
	if (!object) return new Response('Not found', { status: 404 });

	return new Response(object.body, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType ?? 'audio/webm',
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
