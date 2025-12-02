<script lang="ts">
	import { Mic } from '@lucide/svelte';
	import type { AudioRecorder } from '$lib/audio/recorder';

	interface Props {
		recorder: AudioRecorder;
		onSignOut: () => Promise<void>;
	}

	let { recorder, onSignOut }: Props = $props();
</script>
<div class="flex py-20 flex-col items-center justify-center p-8 flex-1">
	<div class="mb-8 text-center text-gray-700">
		<p class="text-lg">Click the button to start recording.</p>
	</div>

	<button
		onclick={() => recorder.start()}
		class="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gray-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-700"
	>
		<Mic class="h-8 w-8" />
	</button>

	<div class="absolute top-4 right-4">
		<button
			onclick={onSignOut}
			class="rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
		>
			Sign Out
		</button>
	</div>
</div>
