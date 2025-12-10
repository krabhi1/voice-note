<script lang="ts">
	import { useSession } from '$lib/auth-client';
	import voiceNoteDemo from '$lib/assets/voice-note-demo.mp4';
	import videoPoster from '$lib/assets/voice-note-video-poster.png';
	import Button from '@/components/ui/button/button.svelte';
	import { ArrowRight, Mic, Scissors, Cloud, LayoutGrid } from '@lucide/svelte';

	const session = useSession();
</script>

<section class="min-h-screen bg-white text-black selection:bg-black selection:text-white">
	<!-- Header -->
	<header
		class="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
			<a href="/" class="flex items-center gap-2 text-lg font-bold tracking-tight text-black">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
					<Mic class="h-4 w-4" />
				</div>
				VoiceNote
			</a>

			{#if !$session.isPending}
				{#if $session?.data}
					<a href="/app">
						<Button variant="default" class="bg-black hover:bg-black/90">Dashboard</Button>
					</a>
				{:else}
					<a
						href="/login"
						class="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-black/90 hover:shadow-lg"
					>
						Get Started
					</a>
				{/if}
			{/if}
		</div>
	</header>

	<!-- Hero Section -->
	<div class="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
		<div
			class="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-slate-50 to-blue-50 opacity-50 blur-3xl"
		></div>

		<div class="mx-auto max-w-4xl px-6 text-center">
			<h1 class="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl">
				The cleanest way to record and organize voice notes.
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-xl text-slate-600 leading-relaxed">
				Fast recording. Instant saving. Zero clutter.
			</p>

			<div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
				{#if !$session?.data}
					<a href="/login">
						<Button
							size="lg"
							class="h-14 rounded-lg bg-black px-8 text-base font-medium hover:bg-black/90 hover:shadow-xl transition-all"
						>
							Start Recording
							<ArrowRight class="ml-2 h-5 w-5" />
						</Button>
					</a>
				{:else}
					<a href="/app">
						<Button size="lg" class="h-14 rounded-lg bg-black px-8 text-base font-medium hover:bg-black/90">
							Go to Dashboard
						</Button>
					</a>
				{/if}
			</div>

			<div class="mt-6 text-sm text-slate-500">Free tier available. No credit card needed.</div>
		</div>
	</div>

	<!-- Demo -->
	<div class="mx-auto max-w-5xl px-6 pb-16">
		<div class="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-xl">
			<div class="aspect-video overflow-hidden rounded-lg bg-white shadow-inner">
				<video
					class="h-full w-full object-cover"
					src={voiceNoteDemo}
					controls
					playsinline
					poster={videoPoster}
				>
					<track kind="captions" src="" label="Demo captions" default />
				</video>
			</div>
		</div>
	</div>

	<!-- Simple Features -->
	<div class="bg-slate-50/50 py-20">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-16 text-center">
				<h2 class="text-3xl font-bold tracking-tight text-black sm:text-4xl">
					Built for fast thinking and clean organization.
				</h2>
				<p class="mt-4 text-lg text-slate-600">Everything you need to capture and organize your thoughts.</p>
			</div>

			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div
					class="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700"
					>
						<Mic class="h-6 w-6" />
					</div>
					<h3 class="text-lg font-semibold text-black mb-2">Instant Recording</h3>
					<p class="text-slate-600">Record in one click. Works directly in your browser.</p>
				</div>

				<div
					class="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700"
					>
						<LayoutGrid class="h-6 w-6" />
					</div>
					<h3 class="text-lg font-semibold text-black mb-2">Organized Library</h3>
					<p class="text-slate-600">Rename, tag, and search recordings instantly.</p>
				</div>

				<div
					class="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
				>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700"
					>
						<Cloud class="h-6 w-6" />
					</div>
					<h3 class="text-lg font-semibold text-black mb-2">Secure Cloud Backup</h3>
					<p class="text-slate-600">
						Your recordings are stored safely and accessible anywhere.
					</p>
				</div>

				<div
					class="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 relative"
				>
					<span
						class="absolute top-3 right-3 inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
					>
						Coming soon
					</span>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700"
					>
						<Scissors class="h-6 w-6" />
					</div>
					<h3 class="text-lg font-semibold text-black mb-2">Auto Silence & Trim</h3>
					<p class="text-slate-600">
						Automatically remove silent gaps and trim recordings for a cleaner, ready-to-share note.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
