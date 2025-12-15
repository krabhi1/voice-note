<script lang="ts">
	import { Mic, LayoutGrid, EllipsisVerticalIcon, Plus, Folder, FileAudio } from '@lucide/svelte';
	import { page } from '$app/state';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { client, useSession } from '$lib/auth-client';
	import { Skeleton } from '@/components/ui/skeleton';

	const session = useSession();

	const user = $derived($session.data?.user);

	const isPending = $derived($session.isPending);
	const path = $derived(page.url.pathname);

	const fallbackInitials = $derived.by(() => {
		if (!user || !user.name) return '';

		return user.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
	});

	async function onSignOut() {
		await client.signOut({
			fetchOptions: {
				onSuccess: () => goto('/')
			}
		});
	}

	const groupList = [
		{
			name: 'A',
			items: ['Item']
		},
		{
			name: 'B',
			items: ['Item']
		}
	];
</script>

{#snippet profile()}
	{#if isPending || !user}
		<div class="flex h-auto w-full justify-between gap-3 px-2 py-2">
			<div class="flex items-center gap-3">
				<Skeleton class="h-10 w-10 rounded-full" />
				<div class="flex flex-col gap-1">
					<Skeleton class="h-4 w-20" />
					<Skeleton class="h-3 w-16" />
				</div>
			</div>
			<Skeleton class="h-4 w-4" />
		</div>
	{:else}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						variant="ghost"
						class="flex h-auto w-full justify-between gap-3 px-2 py-2 hover:bg-accent"
						{...props}
					>
						<div class="flex items-center gap-3 text-left">
							<Avatar.Root class="h-10 w-10 rounded-full border">
								<Avatar.Image src={user.image} alt={user.name} />
								<Avatar.Fallback>
									{fallbackInitials}
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex flex-col">
								<span class="text-sm font-semibold">{user.name}</span>
								<span class="text-xs text-muted-foreground">Free Plan</span>
							</div>
						</div>
						<EllipsisVerticalIcon class="h-4 w-4 text-muted-foreground" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content side="right" sideOffset={8} class="mb-4 w-64">
				<DropdownMenu.Label class="cursor-pointer py-2">
					<div class="flex items-center gap-3">
						<Avatar.Root class="h-10 w-10 rounded-full border">
							<Avatar.Image src={user.image} alt={user.name} />
							<Avatar.Fallback>{fallbackInitials}</Avatar.Fallback>
						</Avatar.Root>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<span class="truncate text-sm">{user.name}</span>
							</div>
							<span class="mt-0.5 block truncate text-xs text-muted-foreground">
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					class="cursor-pointer text-destructive focus:text-destructive"
					onSelect={onSignOut}
				>
					Sign Out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
{/snippet}

{#snippet groups()}
	<div
		class="group mb-2 flex items-center justify-between px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
	>
		<span>Groups</span>
		<Button
			variant="ghost"
			size="icon"
			class="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
			aria-label="Add Group"
		>
			<Plus class="h-3 w-3" />
		</Button>
	</div>

	<div class="flex flex-col gap-1">
		{#each groupList as group}
			<div class="flex flex-col">
				<Button variant="ghost" class="h-auto w-full justify-start px-2 py-1.5">
					<Folder class="mr-2 h-4 w-4 text-muted-foreground" />
					<span>{group.name}</span>
				</Button>
				<div class="mt-0.5 ml-2.5 flex flex-col border-l pl-2">
					{#each group.items as item}
						<Button
							variant="ghost"
							class="h-auto w-full justify-start px-2 py-1.5 text-muted-foreground"
						>
							<FileAudio class="mr-2 h-3.5 w-3.5 text-muted-foreground" />
							<span>{item}</span>
						</Button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/snippet}

<aside class="flex h-full w-60 flex-col border-r bg-muted/10">
	<div class="flex items-center justify-between px-4 py-4">
		<div class="flex items-center gap-3">
			<span class="text-lg font-semibold">VoiceNote</span>
		</div>
	</div>
	<div class="flex flex-col gap-1 p-3">
		<Button
			variant={path === '/app/record' ? 'secondary' : 'ghost'}
			class="w-full justify-start"
			href="/app/record"
		>
			<Mic class="mr-2 h-4 w-4" />
			Record
		</Button>

		<Button
			variant={path === '/app' ? 'secondary' : 'ghost'}
			class="w-full justify-start"
			href="/app"
		>
			<LayoutGrid class="mr-2 h-4 w-4" />
			All
		</Button>
		<!-- <Button
			variant={path === '/trash' ? 'secondary' : 'ghost'}
			class="w-full justify-start hover:text-destructive"
			href="/trash"
		>
			<Trash2 class="mr-2 h-4 w-4" />
			Trash
		</Button> -->
	</div>

	<!-- Groups -->
	<div class="flex-1 overflow-y-auto px-3 py-2">
		<!-- {@render groups()} -->
	</div>

	<!-- Profile Section -->
	<div class="mb-2 px-3">
		{@render profile()}
	</div>
</aside>
