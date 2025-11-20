<script lang="ts">
	import { signIn } from '$lib/auth-client';
</script>

<section class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="rounded-2xl bg-white p-10 text-center shadow-md">
		<h1 class="text-2xl font-semibold">Login</h1>
		<p class="mt-2 text-gray-600">Continue with Google to use VoiceNote</p>

		<button
			class="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
			onclick={async () => {
				await signIn.social({
					provider: 'google',
					callbackURL: '/app'
				});
			}}
		>
			Login with Google
		</button>
	</div>
</section>
