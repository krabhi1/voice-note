<script lang="ts">
	import { AudioRecorder } from '$lib/audio/recorder';
	import Button from '$lib/components/ui/Button.svelte';

	const rec = new AudioRecorder();

	rec.addEventListener('start', () => {
		console.log('🎙️ Started');
	});
	rec.addEventListener('data', (chunk) => console.log('Chunk', chunk.size));
	rec.addEventListener('stop', (file, url) => {
		console.log('✅ Stopped', file);
		const audio = new Audio(url);
		audio.play();
	});
	rec.addEventListener('error', (err) => console.error('❌ Error', err));

	async function upload() {
		const recording = await rec.getAudio();
		console.log('Recording to upload:', recording);
		if (!recording) return alert('No recording available to upload!');
		const formData = new FormData();
		formData.append('voice-note', recording.file, 'recording.webm');
		formData.append('duration', String(recording.duration * 1000));
		const res = await fetch('?/uploadVoice', {
			method: 'POST',
			body: formData
		});
		const data = await res.json();
		console.log('Upload response:', data);
		if (res.ok) {
			console.log('Upload successful!');
		} else {
			console.log('Upload failed.');
		}
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<div>
		<Button onclick={() => rec.start()}>Start Recording</Button>
		<Button variant="destructive" onclick={() => rec.stop()}>Stop Recording</Button>
		<Button variant="outline" onclick={upload}>Upload Recording</Button>
	</div>
</div>
