<script lang="ts">
	import { signIn } from '$lib/auth-client';
</script>

<div>
	<button
		onclick={async () => {
			await signIn.social({
				provider: 'google',
				callbackURL: '/app'
			});
		}}
	>
		Sign In with google
	</button>
</div>
