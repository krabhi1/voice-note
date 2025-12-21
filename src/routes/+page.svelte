<script lang="ts">
	import { useSession } from '$lib/auth-client';
	import Button from '@/components/ui/button/button.svelte';
	import { ArrowRight, Mic, List, Search, Play, Shield, Zap } from '@lucide/svelte';

	const session = useSession();
</script>

<div class="min-h-screen bg-white font-sans text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
	<!-- Navigation -->
	<nav class="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
			<div class="flex items-center gap-2">
				<div class="flex h-7 w-7 items-center justify-center rounded bg-black text-white">
					<Mic class="h-4 w-4" />
				</div>
				<span class="text-sm font-bold tracking-tight uppercase">VoiceNote</span>
			</div>

			<div class="flex items-center gap-4">
				{#if !$session.isPending}
					{#if $session?.data}
						<a href="/app">
							<Button variant="outline" size="sm" class="rounded-none border-black hover:bg-black hover:text-white transition-colors">
								Dashboard
							</Button>
						</a>
					{:else}
						<a href="/login" class="text-xs font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors">
							Sign In
						</a>
						<a href="/login">
							<Button size="sm" class="rounded-none bg-black text-white hover:bg-zinc-800">
								Get Started
							</Button>
						</a>
					{/if}
				{/if}
			</div>
		</div>
	</nav>

	<main>
		<!-- Hero Section -->
		<section class="px-4 pt-20 pb-16 sm:px-6 lg:pt-32 lg:pb-24">
			<div class="mx-auto max-w-3xl text-center">
				<div class="inline-block mb-8 px-3 py-1 border border-zinc-200 rounded-none">
					<span class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Utility-First Voice Recording</span>
				</div>
				<h1 class="text-4xl font-bold tracking-tighter text-black sm:text-6xl lg:text-7xl">
					Capture thoughts at the speed of sound.
				</h1>
				<p class="mx-auto mt-8 max-w-xl text-lg text-zinc-500 leading-relaxed">
					A minimalist workspace for your voice. Record, organize, and archive your ideas without the friction of traditional note-taking.
				</p>
				<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					{#if $session?.data}
						<a href="/app">
							<Button size="lg" class="h-12 rounded-none bg-black px-8 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800">
								Go to Dashboard
							</Button>
						</a>
					{:else}
						<a href="/login">
							<Button size="lg" class="h-12 rounded-none bg-black px-8 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800">
								Start Recording
								<ArrowRight class="ml-2 h-4 w-4" />
							</Button>
						</a>
					{/if}
				</div>
			</div>
		</section>

		<!-- UI Mockup Section -->
		<section class="px-4 pb-24 sm:px-6">
			<div class="mx-auto max-w-5xl">
				<div class="relative rounded-none border border-zinc-200 bg-zinc-50 p-2 shadow-2xl shadow-zinc-200/30">
					<!-- Mockup Header -->
					<div class="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
						<div class="flex gap-1.5">
							<div class="h-2 w-2 rounded-full bg-zinc-200"></div>
							<div class="h-2 w-2 rounded-full bg-zinc-200"></div>
							<div class="h-2 w-2 rounded-full bg-zinc-200"></div>
						</div>
						<div class="flex items-center gap-2 rounded-none border border-zinc-100 bg-zinc-50 px-3 py-1">
							<Search class="h-3 w-3 text-zinc-400" />
							<div class="h-2 w-24 rounded-full bg-zinc-200"></div>
						</div>
						<div class="w-12"></div>
					</div>
					
					<!-- Mockup Content -->
					<div class="flex h-[400px] bg-white">
						<!-- Sidebar -->
						<div class="hidden w-48 border-r border-zinc-100 p-4 sm:block">
							<div class="space-y-4">
								{#each Array(5) as _, i}
									<div class="flex items-center gap-2">
										<div class="h-2 w-2 rounded-none {i === 0 ? 'bg-black' : 'bg-zinc-100'}"></div>
										<div class="h-1.5 w-20 rounded-none {i === 0 ? 'bg-black' : 'bg-zinc-100'}"></div>
									</div>
								{/each}
							</div>
						</div>
						
						<!-- Main Area -->
						<div class="flex-1 p-6">
							<div class="mb-8 flex items-center justify-between">
								<div class="h-4 w-32 bg-zinc-100"></div>
								<div class="flex items-center gap-3">
									<div class="text-[10px] font-bold uppercase tracking-widest text-red-500 animate-pulse">Recording</div>
									<div class="h-8 w-8 rounded-full bg-black flex items-center justify-center">
										<div class="h-2 w-2 rounded-full bg-red-500"></div>
									</div>
								</div>
							</div>
							
							<div class="space-y-3">
								{#each [1, 0.7, 0.9, 0.5] as width, i}
									<div class="group flex items-center justify-between border border-zinc-100 p-4 transition-colors hover:bg-zinc-50">
										<div class="flex items-center gap-4">
											<div class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
												<Play class="h-3 w-3 text-zinc-400" />
											</div>
											<div class="space-y-2">
												<div class="h-2 bg-zinc-200" style="width: {width * 180}px"></div>
												<div class="h-1.5 w-24 bg-zinc-100"></div>
											</div>
										</div>
										<div class="text-[10px] font-mono text-zinc-400">0:{12 + i}</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="border-t border-zinc-100 bg-zinc-50/30 py-24">
			<div class="mx-auto max-w-6xl px-4 sm:px-6">
				<div class="grid grid-cols-1 md:grid-cols-3 border-l border-t border-zinc-200">
					<div class="border-r border-b border-zinc-200 p-10 transition-colors hover:bg-white">
						<div class="mb-8 text-black">
							<Zap class="h-5 w-5" />
						</div>
						<h3 class="text-xs font-bold uppercase tracking-[0.2em] text-black">Instant Capture</h3>
						<p class="mt-4 text-sm leading-relaxed text-zinc-500">
							Zero-latency recording. Your thoughts are saved the moment you stop speaking. No loading screens, no friction.
						</p>
					</div>
					<div class="border-r border-b border-zinc-200 p-10 transition-colors hover:bg-white">
						<div class="mb-8 text-black">
							<List class="h-5 w-5" />
						</div>
						<h3 class="text-xs font-bold uppercase tracking-[0.2em] text-black">Clean Organization</h3>
						<p class="mt-4 text-sm leading-relaxed text-zinc-500">
							Automatic timestamping and simple tagging. Find what you need in seconds with our high-performance search.
						</p>
					</div>
					<div class="border-r border-b border-zinc-200 p-10 transition-colors hover:bg-white">
						<div class="mb-8 text-black">
							<Shield class="h-5 w-5" />
						</div>
						<h3 class="text-xs font-bold uppercase tracking-[0.2em] text-black">Private by Default</h3>
						<p class="mt-4 text-sm leading-relaxed text-zinc-500">
							Your recordings are yours. We use industry-standard encryption to ensure your data remains private and secure.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="py-32 px-4 sm:px-6">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-black">Ready to clear your mind?</h2>
				<p class="mt-4 text-zinc-500">Join others using VoiceNote to organize their daily thoughts.</p>
				<div class="mt-10">
					<a href="/login">
						<Button size="lg" class="h-12 rounded-none bg-black px-10 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800">
							Get Started for Free
						</Button>
					</a>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-zinc-100 py-16">
		<div class="mx-auto max-w-6xl px-4 sm:px-6">
			<div class="flex flex-col items-center justify-between gap-10 sm:flex-row">
				<div class="flex items-center gap-2 opacity-40 grayscale">
					<div class="flex h-5 w-5 items-center justify-center rounded-none bg-black text-white">
						<Mic class="h-3 w-3" />
					</div>
					<span class="text-[10px] font-bold uppercase tracking-widest">VoiceNote</span>
				</div>
				<div class="flex gap-10">
					<a href="#" class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Privacy</a>
					<a href="#" class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Terms</a>
					<a href="#" class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Contact</a>
				</div>
				<p class="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
					&copy; {new Date().getFullYear()} VoiceNote
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-color: white;
	}
</style>