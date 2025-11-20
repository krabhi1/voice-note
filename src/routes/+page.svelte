<script lang="ts">
	import { useSession } from '$lib/auth-client';

	const session = useSession();
</script>

<section class="min-h-screen bg-gray-50 text-gray-900">
	<!-- Header -->
	<header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b">
		<div class="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
			<a href="/" class="text-lg font-semibold text-gray-900">VoiceNote</a>

			<div>
				{#if $session?.data}
					<a
						href="/app"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
						aria-label="Go to dashboard"
					>
						Dashboard
					</a>
				{:else}
					<a
						href="/login"
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
						aria-label="Login"
					>
						Login
					</a>
				{/if}
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<div class="mx-auto max-w-5xl px-6 pt-28 pb-24 text-center">
		<h1 class="text-4xl font-bold tracking-tight md:text-6xl">
			Record. Edit. Store.
			<span class="text-blue-600">Your Voice Notes</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
			A fast, browser-based workspace for capturing and managing voice recordings with built-in
			editing tools.
		</p>

	</div>

	<!-- Problems Section -->
	<div class="mx-auto max-w-5xl px-6 py-20">
		<h2 class="text-center text-3xl font-semibold">Voice notes don’t have to be messy</h2>
		<p class="mx-auto mt-4 max-w-2xl text-center text-gray-600">
			Stop losing audio files across devices and apps. VoiceNote keeps everything clean, accessible,
			and easy to manage.
		</p>

		<div class="mt-12 grid gap-6 md:grid-cols-3">
			<div class="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
				<h3 class="text-lg font-semibold">No scattered files</h3>
				<p class="mt-2 text-sm text-gray-600">
					Everything stays organized in one online dashboard.
				</p>
			</div>

			<div class="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
				<h3 class="text-lg font-semibold">No app install</h3>
				<p class="mt-2 text-sm text-gray-600">
					Record directly in your browser without extra tools.
				</p>
			</div>

			<div class="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
				<h3 class="text-lg font-semibold">No editing struggle</h3>
				<p class="mt-2 text-sm text-gray-600">
					Built-in trimming and silence cleanup keeps workflow fast.
				</p>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="border-t bg-white py-20">
		<div class="mx-auto max-w-5xl px-6">
			<h2 class="text-center text-3xl font-semibold">Everything you need</h2>

			<div class="mt-12 grid gap-10 md:grid-cols-2">
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-semibold">Record in your browser</h3>
						<p class="mt-2 text-sm text-gray-600">High-quality audio capture with zero setup.</p>
					</div>

					<div>
						<h3 class="text-xl font-semibold">Organize recordings</h3>
						<p class="mt-2 text-sm text-gray-600">
							Search, metadata, sorting — everything stays easy.
						</p>
					</div>

					<div>
						<h3 class="text-xl font-semibold">Edit audio fast</h3>
						<p class="mt-2 text-sm text-gray-600">
							Trim clips, highlight silence, and clean up recordings.
						</p>
					</div>

					<div>
						<h3 class="text-xl font-semibold">Cloud stored & secure</h3>
						<p class="mt-2 text-sm text-gray-600">
							Stored reliably using Cloudflare infrastructure.
						</p>
					</div>
				</div>

				<!-- Placeholder image box -->
				<div class="flex h-72 items-center justify-center rounded-2xl border bg-gray-100">
					<span class="text-gray-400">Screenshot Coming Soon</span>
				</div>
			</div>
		</div>
	</div>

	<!-- How It Works -->
	<div class="mx-auto max-w-5xl px-6 py-20">
		<h2 class="text-center text-3xl font-semibold">How it works</h2>

		<div class="mt-12 grid gap-8 md:grid-cols-4">
			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600">1</div>
				<p class="mt-4 font-medium">Record</p>
				<p class="mt-2 text-sm text-gray-600">Capture instantly with a single click.</p>
			</div>

			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600">2</div>
				<p class="mt-4 font-medium">Save</p>
				<p class="mt-2 text-sm text-gray-600">Stored securely in the cloud.</p>
			</div>

			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600">3</div>
				<p class="mt-4 font-medium">Organize</p>
				<p class="mt-2 text-sm text-gray-600">Find anything with metadata & search.</p>
			</div>

			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600">4</div>
				<p class="mt-4 font-medium">Edit</p>
				<p class="mt-2 text-sm text-gray-600">Trim or clean silence easily.</p>
			</div>
		</div>
	</div>
</section>
