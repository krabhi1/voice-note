<script lang="ts">
	import { useSession } from '$lib/auth-client';
	import Button from '@/components/ui/button/button.svelte';
	import { ArrowRight, Mic, LayoutGrid, Play, Download, Clock, Zap } from '@lucide/svelte';

	const session = useSession();
</script>

<div class="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 border-b border-muted/30 bg-background/80 backdrop-blur-md">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
			<div class="flex items-center gap-2">
				<div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<Mic class="h-4 w-4" />
				</div>
				<span class="text-sm font-bold tracking-tight">VoiceNote</span>
			</div>

			<div class="flex items-center gap-4">
				{#if !$session.isPending}
					{#if $session?.data}
						<a href="/app">
							<Button variant="outline" size="sm" class="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
								Dashboard
							</Button>
						</a>
					{:else}
						<a href="/login">
							<Button size="sm" class="bg-primary text-primary-foreground hover:bg-primary/90">
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
		<section class="px-4 pb-16 pt-20 sm:px-6 lg:pb-24 lg:pt-32">
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-8 inline-block rounded-md border border-muted bg-muted/5 px-3 py-1">
					<span class="text-xs font-bold text-secondary">Utility-First Voice Recording</span>
				</div>
				<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
					Capture thoughts at the speed of sound.
				</h1>
				<p class="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-secondary">
					A minimalist workspace for your voice. Record, review, and archive your ideas without the friction of traditional note-taking.
				</p>
				<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					{#if $session?.data}
						<a href="/app">
							<Button size="lg" class="h-12 bg-primary px-8 text-sm font-bold hover:bg-primary/90">
								Go to Dashboard
							</Button>
						</a>
					{:else}
						<a href="/login">
							<Button size="lg" class="h-12 bg-primary px-8 text-sm font-bold hover:bg-primary/90">
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
				<div class="relative rounded-lg border border-muted bg-muted/20 p-2 shadow-xl shadow-muted/20">
					<!-- Mockup Header -->
					<div class="flex items-center justify-between border-b border-muted/30 bg-card px-4 py-3">
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-1.5 opacity-40">
								<Mic class="h-3 w-3 text-primary" />
								<span class="text-[10px] font-bold tracking-tight">VoiceNote</span>
							</div>
						</div>
					</div>

					<!-- Mockup Content -->
					<div class="flex h-[400px] bg-card overflow-hidden">
						<!-- Sidebar -->
						<div class="hidden w-48 border-r border-muted/30 p-4 sm:block">
							<div class="space-y-2">
								<div class="mb-4 px-2 text-[10px] font-bold text-secondary uppercase">Workspace</div>
								<div class="flex items-center gap-3 rounded-md bg-primary px-3 py-2 text-primary-foreground">
									<Mic class="h-3.5 w-3.5" />
									<div class="h-2 w-16 rounded-sm bg-primary-foreground/20"></div>
								</div>
								<div class="flex items-center gap-3 px-3 py-2 text-secondary">
									<LayoutGrid class="h-3.5 w-3.5" />
									<div class="h-2 w-16 rounded-sm bg-muted"></div>
								</div>
							</div>
						</div>

						<!-- Main Area -->
						<div class="flex-1 p-6">
							<div class="mb-8 flex items-center justify-between">
								<div class="h-4 w-32 rounded bg-muted/30"></div>
							</div>

							<div class="space-y-px border border-muted/30 rounded-md overflow-hidden">
								{#each [1, 0.7, 0.9, 0.5] as width, i}
									<div class="flex items-center justify-between bg-card p-4 border-b border-muted/30 last:border-0">
										<div class="flex items-center gap-4">
											<div class="flex h-7 w-7 items-center justify-center rounded-full bg-muted/10 border border-muted/30">
												<Play class="h-2.5 w-2.5 text-secondary fill-current" />
											</div>
											<div class="space-y-1.5">
												<div class="h-2 bg-foreground/80 rounded" style="width: {width * 140}px"></div>
												<div class="h-1.5 w-20 bg-secondary/20 rounded"></div>
											</div>
										</div>
										<div class="flex items-center gap-6">
											<div class="h-1.5 w-12 bg-secondary/20 rounded hidden sm:block"></div>
											<div class="text-[10px] font-mono text-secondary">0:{12 + i}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="border-t border-muted/30 bg-muted/10 py-24">
			<div class="mx-auto max-w-6xl px-4 sm:px-6">
				<div class="grid grid-cols-1 border-l border-t border-muted/30 md:grid-cols-3">
					<div class="border-b border-r border-muted/30 p-10 transition-colors hover:bg-card">
						<div class="mb-8 text-primary">
							<Zap class="h-5 w-5" />
						</div>
						<h3 class="text-base font-bold text-foreground">Effortless Capture</h3>
						<p class="mt-4 text-sm leading-relaxed text-secondary">
							Start recording with a single click. Our streamlined interface stays out of your way so you can focus on your ideas.
						</p>
					</div>
					<div class="border-b border-r border-muted/30 p-10 transition-colors hover:bg-card">
						<div class="mb-8 text-primary">
							<Mic class="h-5 w-5" />
						</div>
						<h3 class="text-base font-bold text-foreground">Visual Review</h3>
						<p class="mt-4 text-sm leading-relaxed text-secondary">
							High-fidelity waveform visualization powered by WaveSurfer.js. Review your recordings with precision before saving.
						</p>
					</div>
					<div class="border-b border-r border-muted/30 p-10 transition-colors hover:bg-card">
						<div class="mb-8 text-primary">
							<Download class="h-5 w-5" />
						</div>
						<h3 class="text-base font-bold text-foreground">One-Click Export</h3>
						<p class="mt-4 text-sm leading-relaxed text-secondary">
							Download your recordings as high-quality MP3 files instantly. Perfect for archiving or sharing with your team.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="px-4 py-32 sm:px-6">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-primary">Ready to clear your mind?</h2>
				<p class="mt-4 text-base text-secondary">Join others using VoiceNote to organize their daily thoughts.</p>
				<div class="mt-10">
					<a href="/login">
						<Button size="lg" class="h-12 bg-primary px-10 text-sm font-bold hover:bg-primary/90">
							Get Started for Free
						</Button>
					</a>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-muted/30 py-16">
		<div class="mx-auto max-w-6xl px-4 sm:px-6">
			<div class="flex flex-col items-center justify-between gap-10 sm:flex-row">
				<div class="flex items-center gap-2">
					<div class="flex h-5 w-5 items-center justify-center rounded-sm bg-primary text-primary-foreground">
						<Mic class="h-3 w-3" />
					</div>
					<span class="text-xs font-bold text-foreground">VoiceNote</span>
				</div>
				<div class="flex gap-10">
					<a href="#" class="text-xs font-bold text-secondary hover:text-primary transition-colors">Privacy</a>
					<a href="#" class="text-xs font-bold text-secondary hover:text-primary transition-colors">Terms</a>
					<a href="#" class="text-xs font-bold text-secondary hover:text-primary transition-colors">Contact</a>
				</div>
				<p class="text-xs font-bold text-secondary">
					&copy; {new Date().getFullYear()} VoiceNote
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-color: var(--background);
	}
</style>
