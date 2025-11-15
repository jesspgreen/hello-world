# VoiceMap Documentation

Welcome to the VoiceMap documentation. VoiceMap is an AI-powered voice recording and transcription application built with Tauri v2, React, and TypeScript.

## Table of Contents

- [Getting Started](./getting-started.md)
- [Architecture](./architecture.md)
- [Development Guide](./development.md)
- [API Reference](./api-reference.md)
- [Deployment](./deployment.md)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run tauri:dev
   ```

3. **Build for Production**
   ```bash
   npm run tauri:build
   ```

## Features

- **Audio Recording**: Capture high-quality audio with device selection
- **AI Transcription**: Automatic speech-to-text using Whisper
- **Smart Summaries**: AI-generated summaries of recordings
- **Secure Storage**: Encrypted local storage with SQLite
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Project Structure

```
voicemap/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   └── src/
│       ├── audio/         # Audio recording
│       ├── encryption/    # File encryption
│       ├── storage/       # Database operations
│       └── llm/           # AI/ML integration
├── python/                # ML services
│   ├── models/           # ML model wrappers
│   ├── preprocessing/    # Audio preprocessing
│   └── inference/        # Inference server
└── docs/                  # Documentation
```

## Technology Stack

### Frontend
- React 18
- TypeScript 5
- Vite 5

### Backend
- Tauri v2
- Rust (latest stable)
- SQLite

### ML/AI
- Python 3.10+
- OpenAI Whisper
- Transformers
- FastAPI

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

See LICENSE file for details.
