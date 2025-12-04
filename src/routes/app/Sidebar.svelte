<script lang="ts">
	import {
		Mic,
		LayoutGrid,
		Trash2,
		Plus,
		Folder,
		FileAudio,
		EllipsisVerticalIcon
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { DropdownMenu } from 'bits-ui';

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

{#snippet profile()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="flex w-full justify-between gap-3 p-2 hover:bg-gray-100">
			<div class="flex items-center gap-3">
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
			<button aria-label="More" class="rounded p-1 text-gray-500">
				<EllipsisVerticalIcon class="h-4 w-4" />
			</button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				side="right"
				sideOffset={8}
				class="z-50 mb-4 w-64 rounded-md border border-gray-200 bg-white shadow-lg"
			>
				<DropdownMenu.Item class="cursor-pointer px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
					<div class="flex items-center gap-3">
						<img
							src={user.image}
							alt={user.name}
							class="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
						/>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<span class="truncate text-sm font-semibold text-gray-900">{user.name}</span>
							</div>
							<span class="mt-0.5 block truncate text-xs text-gray-500">
								{user.name.toLowerCase()}@example.com
							</span>
						</div>
					</div>
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="my-1 border-t border-gray-200" />
				<DropdownMenu.Item class="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
					Settings
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="my-1 border-t border-gray-200" />
				<DropdownMenu.Item class="cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
					Sign Out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
{/snippet}

<aside class="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50 text-gray-900">
	<div class="flex items-center justify-between px-3 py-3">
		<div class="flex items-center gap-3">
			<span class="text-lg font-semibold text-gray-900">VoiceNote</span>
		</div>
	</div>
	<!-- Main Actions -->
	<div class="flex flex-col gap-1 p-3">
		<a href="/app/record" class="block w-full" aria-label="Mic Record">
			<button
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100
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
		<!-- <a href="/trash" class="block w-full" aria-label="All">
			<button
				class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-red-600
				{path === '/trash' && 'bg-gray-200!'}"
			>
				<Trash2 class="h-4 w-4" />
				<span>Trash</span>
			</button>
		</a> -->
	</div>

	<!-- Groups -->
	<div class="flex-1 overflow-y-auto px-3 py-2">
		<!-- <div
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
		</div> -->
	</div>
	<!-- Profile Section -->
	<div class="py-4 ">
		{@render profile()}
	</div>
</aside>
