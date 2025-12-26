<script lang="ts">
	import Sidebar from '$lib/components/app/Sidebar.svelte';
	import { Menu, Mic } from '@lucide/svelte';

	let { children } = $props();
	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}
</script>

<div class="relative flex h-screen w-full overflow-hidden bg-background">
	<!-- Mobile Backdrop -->
	{#if isSidebarOpen}
		<button
			class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
			onclick={closeSidebar}
			onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Sidebar Container -->
	<div
		class="fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 {isSidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<Sidebar onNavItemClick={closeSidebar} />
	</div>

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Mobile Header -->
		<header
			class="flex h-14 shrink-0 items-center justify-between border-b border-muted/30 bg-card px-4 lg:hidden"
		>
			<button
				onclick={toggleSidebar}
				class="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted/20"
				aria-label="Open menu"
			>
				<Menu class="h-5 w-5 text-secondary" />
			</button>

			<div class="flex items-center gap-2">
				<div
					class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
				>
					<Mic class="h-3.5 w-3.5" />
				</div>
				<span class="text-sm font-bold tracking-tight">VoiceNote</span>
			</div>

			<!-- Placeholder to balance the header -->
			<div class="w-9"></div>
		</header>

		<main class="flex-1 overflow-y-auto">
			{@render children?.()}
		</main>
	</div>
</div>
