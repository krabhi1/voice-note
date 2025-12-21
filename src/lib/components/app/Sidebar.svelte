<script lang="ts">
	import { Mic, LayoutGrid, EllipsisVertical, Plus, Folder, FileAudio, LogOut, User } from '@lucide/svelte';
	import { page } from '$app/state';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
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

<aside class="flex h-full w-64 flex-col border-r border-muted bg-card">
	<!-- Logo Section -->
	<div class="flex h-14 items-center border-b border-muted/30 px-6">
		<a href="/app" class="flex items-center gap-2.5">
			<div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<Mic class="h-4 w-4" />
			</div>
			<span class="text-base font-bold tracking-tight text-foreground">VoiceNote</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 px-3 py-6">
		<div class="mb-4 px-3">
			<span class="text-xs font-bold text-secondary">Workspace</span>
		</div>
		
		<a 
			href="/app/record" 
			class="group flex items-center justify-between rounded-md px-3 py-2 transition-colors {path === '/app/record' ? 'bg-primary text-primary-foreground' : 'text-secondary hover:bg-muted/20 hover:text-foreground'}"
		>
			<div class="flex items-center gap-3">
				<Mic class="h-4 w-4" />
				<span class="text-sm font-semibold">Record</span>
			</div>
			{#if path === '/app/record'}
				<div class="h-1 w-1 rounded-full bg-primary-foreground"></div>
			{/if}
		</a>

		<a 
			href="/app" 
			class="group flex items-center justify-between rounded-md px-3 py-2 transition-colors {path === '/app' ? 'bg-primary text-primary-foreground' : 'text-secondary hover:bg-muted/20 hover:text-foreground'}"
		>
			<div class="flex items-center gap-3">
				<LayoutGrid class="h-4 w-4" />
				<span class="text-sm font-semibold">Library</span>
			</div>
			{#if path === '/app'}
				<div class="h-1 w-1 rounded-full bg-primary-foreground"></div>
			{/if}
		</a>
	</nav>

	<!-- Secondary Section (Optional/Groups) -->
	<!-- <div class="px-3 py-4 border-t border-muted/30">
		<div class="flex items-center justify-between px-3 mb-2">
			<span class="text-xs font-bold text-secondary">Collections</span>
			<button class="text-secondary hover:text-foreground transition-colors">
				<Plus class="h-3.5 w-3.5" />
			</button>
		</div>
		<div class="space-y-1">
			<div class="flex items-center gap-3 px-3 py-2 text-secondary/50 grayscale opacity-50 cursor-not-allowed">
				<Folder class="h-4 w-4" />
				<span class="text-sm font-semibold">Archive</span>
			</div>
		</div>
	</div> -->

	<!-- User Profile Section -->
	<div class="border-t border-muted/30 p-4">
		{#if isPending || !user}
			<div class="flex items-center gap-3 px-2">
				<Skeleton class="h-8 w-8 rounded-md bg-muted/20" />
				<div class="space-y-1.5">
					<Skeleton class="h-3 w-20 bg-muted/20" />
					<Skeleton class="h-2 w-12 bg-muted/20" />
				</div>
			</div>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full">
					{#snippet child({ props })}
						<button
							{...props}
							class="flex w-full items-center justify-between rounded-md border border-muted/30 bg-card p-2 transition-colors hover:bg-muted/10"
						>
							<div class="flex items-center gap-3 overflow-hidden">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-muted/20 text-xs font-bold text-foreground">
									{#if user.image}
										<img src={user.image} alt={user.name} class="h-full w-full object-cover" />
									{:else}
										{fallbackInitials}
									{/if}
								</div>
								<div class="flex flex-col items-start overflow-hidden">
									<span class="truncate text-xs font-bold text-foreground">{user.name}</span>
									<span class="text-[10px] font-mono text-secondary">PRO PLAN</span>
								</div>
							</div>
							<EllipsisVertical class="h-3.5 w-3.5 text-secondary" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="right" align="end" sideOffset={12} class="w-56 rounded-md border-muted/30 shadow-xl">
					<div class="px-3 py-2 border-b border-muted/10">
						<p class="text-xs font-bold text-secondary">Account</p>
						<p class="truncate text-sm font-medium text-foreground mt-1">{user.email}</p>
					</div>
					<!-- <DropdownMenu.Item class="cursor-pointer rounded-sm py-2 text-sm font-semibold focus:bg-muted/10">
						<User class="mr-2 h-4 w-4" />
						Settings
					</DropdownMenu.Item> -->
					<DropdownMenu.Separator class="bg-muted/10" />
					<DropdownMenu.Item
						class="cursor-pointer rounded-sm py-2 text-sm font-semibold text-red-600 focus:bg-red-50 focus:text-red-600 hover:bg-red-50 hover:text-red-600"
						onSelect={onSignOut}
					>
						<LogOut class="mr-2 h-4 w-4" />
						Sign Out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</div>
</aside>