<script lang="ts">
	import { Mic, LayoutGrid, Trash2, Plus, Folder, FileAudio } from '@lucide/svelte';
	import { page } from '$app/state';
	const path = $derived(page.url.pathname);

	// Mock data
	const groups = [
		{
			name: 'A',
			items: ['Item']
		},
		{
			name: 'B',
			items: ['Item']
		}
	];

	const user = {
		name: 'Abhi',
		image: 'https://github.com/krabhi1.png'
	};
</script>

<aside class="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50 text-gray-900">
	<!-- Profile -->
	<div class="flex items-center gap-3 border-b border-gray-200 p-4">
		<img
			src={user.image}
			alt={user.name}
			class="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
		/>
		<div class="flex flex-col">
			<span class="text-sm font-semibold text-gray-900">{user.name}</span>
			<span class="text-xs text-gray-500">Free Plan</span>
		</div>
	</div>

	<!-- Main Actions -->
	<div class="flex flex-col gap-1 p-3">
		<a href="/app/record" class="block w-full" aria-label="Mic Record">
			<button
			class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium  text-gray-700 transition-colors hover:bg-gray-100
			{path === '/app/record' && 'bg-gray-200!'}"
			>
				<Mic class="h-4 w-4" />
				<span>Record</span>
			</button>
		</a>

		<a href="/app" class="block w-full" aria-label="All">
			<button
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100
				{path === '/app' && 'bg-gray-200!'}"
			>
				<LayoutGrid class="h-4 w-4" />
				<span>All</span>
			</button>
		</a>
	</div>

	<!-- Groups -->
	<div class="flex-1 overflow-y-auto px-3 py-2">
		<div
			class="group mb-2 flex items-center justify-between px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase"
		>
			<span>Groups</span>
			<button
				class="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-900"
				aria-label="Add Group"
			>
				<Plus class="h-3 w-3" />
			</button>
		</div>

		<div class="flex flex-col gap-1">
			{#each groups as group}
				<div class="flex flex-col">
					<button
						class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
					>
						<Folder class="h-4 w-4 text-gray-400" />
						<span>{group.name}</span>
					</button>
					<!-- Nested Items -->
					<div class="mt-0.5 ml-2.5 flex flex-col border-l border-gray-200 pl-2">
						{#each group.items as item}
							<button
								class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
							>
								<FileAudio class="h-3.5 w-3.5 text-gray-400" />
								<span>{item}</span>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Trash -->
	<div class="border-t border-gray-200 p-3">
		<button
			class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-red-600"
		>
			<Trash2 class="h-4 w-4" />
			<span>Trash</span>
		</button>
	</div>
</aside>
