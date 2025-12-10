# VoiceNote

A web app where users can record, store, and manage their voice recording online.
## Features
- Record voice notes directly from the browser.
- Store and organize recordings in a user-friendly interface.
- Play back recordings with an integrated audio player.
- Audio editor to trim, auto-delete silence, and enhance recordings.
- Future plans for sharing voice notes with expiration links, and a trash system for recovery, auto create transcription of voice notes.
## Tech Stack
- Fullstack: SvelteKit, Tailwind CSS, better-auth, shadcn-svelte
- Database: Cloudflare D1, Cloudflare R2
- Deployment: Cloudflare Workers

## Installation
```bash
#development setup

#create .env file from .env.example and fill in the values
cp .env.example .env
pnpm install
pnpm db:migrate:local
pnpm dev

#when schema changes
#create migrations
pnpm db:generate
#run migrations
pnpm db:migrate:local
```

## Utils
```bash
#install new components 
pnpm dlx shadcn-svelte@latest add button
```