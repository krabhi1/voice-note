# VoiceNote

A modern web application for recording, storing, and managing voice notes in the cloud with an intuitive interface and powerful editing capabilities.

## ✨ Features

### Current
- **Recording** - Record voice notes directly from your browser
- **Smart Organization** - Store and organize recordings with a clean, user-friendly interface
- **Integrated Playback** - Play back recordings with a built-in audio player
- **Audio Editor** - Trim recordings, auto-delete silence, and enhance audio quality

### Planned
- **Secure Sharing** - Share voice notes with expiration links
- **Trash & Recovery** - Deleted notes recovery system
- **Auto Transcription** - Automatic transcription of voice recordings

## 🛠️ Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS, shadcn-svelte
- **Authentication**: better-auth
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Workers

## 🚀 Getting Started

### Development Setup

1. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Fill in the required values in .env
   ```

2. **Install Dependencies & Run**
   ```bash
   pnpm install
   pnpm db:migrate:local
   pnpm dev
   ```

### Database Management

```bash
# Create new migrations (after schema changes)
pnpm db:generate

# Apply migrations to local database
pnpm db:migrate:local
```

## 🔧 Development Utils

```bash
# Add new shadcn-svelte components
pnpm dlx shadcn-svelte@latest add button
```