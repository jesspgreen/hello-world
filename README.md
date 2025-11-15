# VoiceMap

AI-powered voice recording and transcription application built with Tauri v2, React, and TypeScript.

## Features

- **High-Quality Audio Recording**: Capture crystal-clear audio with device selection
- **AI-Powered Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Smart Summaries**: Get AI-generated summaries of your recordings
- **Secure Storage**: Encrypted local storage with SQLite database
- **Cross-Platform**: Native performance on Windows, macOS, and Linux
- **Privacy-First**: All data stays on your device by default

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Project Structure

- `src/` - React frontend with TypeScript
- `src-tauri/` - Rust backend with Tauri
- `python/` - Machine learning services
- `docs/` - Comprehensive documentation

## Documentation

For detailed documentation, see the [docs/](./docs/) directory:

- [Architecture](./docs/architecture.md)
- [Development Guide](./docs/development.md)
- [Getting Started](./docs/README.md)

## Technology Stack

**Frontend**: React 18, TypeScript, Vite
**Backend**: Tauri v2, Rust
**ML/AI**: Python, OpenAI Whisper, Transformers
**Database**: SQLite with encryption support

## License

See LICENSE file for details. 
