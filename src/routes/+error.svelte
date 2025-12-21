<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { MicOff, ArrowLeft } from '@lucide/svelte';
</script>

<div class="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
	<div class="mb-8 flex h-20 w-20 items-center justify-center">
		<MicOff class="h-10 w-10 text-secondary" />
	</div>

	<div class="max-w-md space-y-4">
		<div class="space-y-2">
			<span class="text-xs font-bold uppercase tracking-widest text-primary">Error {page.status}</span>
			<h1 class="text-3xl font-bold tracking-tight text-foreground">Lost in Silence</h1>
			<p class="text-sm leading-relaxed text-secondary">
				The page or recording you're looking for doesn't exist or has been moved.
			</p>
		</div>

		<div class="pt-6">
			<a href="/">
				<Button class="px-8 font-bold">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Back to Home
				</Button>
			</a>
		</div>
	</div>
</div>
