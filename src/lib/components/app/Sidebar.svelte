<script lang="ts">
	import { Mic, LayoutGrid, EllipsisVertical, LogOut } from '@lucide/svelte';
	import { page } from '$app/state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { goto } from '$app/navigation';
	import { client, useSession } from '$lib/auth-client';
	import { Skeleton } from '@/components/ui/skeleton';

	const session = useSession();
	const user = $derived($session.data?.user);
	const path = $derived(page.url.pathname);

	const navItems = [
		{ href: '/app/record', label: 'Record', icon: Mic },
		{ href: '/app', label: 'Library', icon: LayoutGrid }
	];

	const initials = $derived(
		user?.name
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() || ''
	);

	const signOut = () => client.signOut({ fetchOptions: { onSuccess: () => goto('/') } });
</script>

<aside class="flex h-full w-64 flex-col border-r border-muted bg-card">
	<div class="flex h-14 items-center border-b border-muted/30 px-6">
		<a href="/app" class="flex items-center gap-2.5">
			<div
				class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
			>
				<Mic class="h-4 w-4" />
			</div>
			<span class="text-base font-bold tracking-tight">VoiceNote</span>
		</a>
	</div>

	<nav class="flex-1 space-y-1 px-3 py-6">
		<span class="mb-4 block px-3 text-xs font-bold text-secondary">Workspace</span>
		{#each navItems as item}
			{@const active = path === item.href}
			<a
				href={item.href}
				class="group flex items-center justify-between rounded-md px-3 py-2 transition-colors {active
					? 'bg-primary text-primary-foreground'
					: 'text-secondary hover:bg-muted/20 hover:text-foreground'}"
			>
				<div class="flex items-center gap-3">
					<item.icon class="h-4 w-4" />
					<span class="text-sm font-semibold">{item.label}</span>
				</div>
				{#if active}<div class="h-1 w-1 rounded-full bg-primary-foreground"></div>{/if}
			</a>
		{/each}
	</nav>

	<div class="border-t border-muted/30 p-4">
		{#if $session.isPending || !user}
			<div class="flex items-center gap-3 px-2">
				<Skeleton class="h-8 w-8 rounded-md bg-muted/20" />
				<div class="space-y-1.5">
					<Skeleton class="h-3 w-20 bg-muted/20" /><Skeleton class="h-2 w-12 bg-muted/20" />
				</div>
			</div>
		{:else}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="w-full">
					{#snippet child({ props })}
						<button
							{...props}
							class="flex w-full items-center justify-between rounded-md border border-muted/30 bg-card p-2 hover:bg-muted/10"
						>
							<div class="flex items-center gap-3 overflow-hidden">
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-muted/20 text-xs font-bold"
								>
									{#if user.image}
										<img src={user.image} alt={user.name} class="h-full w-full object-cover" />
									{:else}
										{initials}
									{/if}
								</div>
								<div class="flex flex-col items-start overflow-hidden">
									<span class="truncate text-xs font-bold">{user.name}</span>
									<span class="text-[10px] font-mono text-secondary">PRO PLAN</span>
								</div>
							</div>
							<EllipsisVertical class="h-3.5 w-3.5 text-secondary" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					side="right"
					align="end"
					sideOffset={12}
					class="w-56 border-muted/30 shadow-xl"
				>
					<div class="px-3 py-2 border-b border-muted/10">
						<p class="text-xs font-bold text-secondary">Account</p>
						<p class="mt-1 truncate text-sm font-medium">{user.email}</p>
					</div>
					<DropdownMenu.Item
						class="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
						onSelect={signOut}
					>
						<LogOut class="mr-2 h-4 w-4" /> Sign Out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</div>
</aside>