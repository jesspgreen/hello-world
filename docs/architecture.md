# Architecture

VoiceMap follows a layered architecture with clear separation between the frontend, backend, and ML services.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  (UI Components, State Management, Service Layer)           │
└────────────────────┬────────────────────────────────────────┘
                     │ Tauri IPC
┌────────────────────▼────────────────────────────────────────┐
│                    Rust Backend (Tauri)                     │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐ │
│  │  Audio   │Encryption│ Storage  │     LLM/API          │ │
│  │  Module  │  Module  │ (SQLite) │   Integration        │ │
│  └──────────┴──────────┴──────────┴──────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────────┐
│                   Python ML Services                        │
│  ┌──────────┬──────────────┬────────────────────────────┐  │
│  │ Whisper  │  Embeddings  │   Audio Preprocessing      │  │
│  │  Model   │    Model     │                            │  │
│  └──────────┴──────────────┴────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Layer

### Components
- **RecordingControls**: Manages recording state and user controls
- **RecordingList**: Displays list of saved recordings
- **TranscriptViewer**: Shows transcripts and summaries

### Services
- **audio.ts**: Audio device management and recording
- **storage.ts**: Database operations via Tauri
- **llm.ts**: AI/ML operations
- **encryption.ts**: File encryption/decryption

### State Management
Currently uses React hooks and local state. Can be extended with Redux or Zustand for more complex state management needs.

## Backend Layer (Rust/Tauri)

### Audio Module
- Device enumeration using `cpal`
- Real-time audio capture
- WAV file encoding with `hound`

### Encryption Module
- AES-256-GCM encryption
- Argon2 key derivation
- Secure random number generation

### Storage Module
- SQLite database for metadata
- Recording CRUD operations
- Transcript and summary storage

### LLM Module
- API client for external services (OpenAI, etc.)
- Local ML service integration
- Request/response handling

## ML Services Layer (Python)

### Models
- **WhisperModel**: Audio transcription
- **EmbeddingModel**: Semantic embeddings for search

### Preprocessing
- Audio normalization
- Silence removal
- Noise reduction
- Format conversion

### Inference Server
- FastAPI REST API
- Asynchronous processing
- Model caching

## Data Flow

### Recording Flow
1. User clicks "Start Recording" in UI
2. Frontend calls `startRecording()` service
3. Tauri backend initializes audio capture
4. Audio data is buffered in memory
5. User clicks "Stop Recording"
6. Audio saved to file system
7. Metadata saved to SQLite
8. UI updates with new recording

### Transcription Flow
1. User selects recording and clicks "Transcribe"
2. Frontend calls `transcribeAudio()` service
3. Tauri backend sends audio to Python ML service
4. Whisper model processes audio
5. Transcript returned to backend
6. Transcript saved to database
7. UI updates with transcript

## Security Considerations

### Data Security
- All recordings can be encrypted at rest
- Passwords use Argon2 key derivation
- Sensitive data never leaves the local machine (unless using external APIs)

### API Keys
- Stored securely in OS keychain (future enhancement)
- Never committed to version control
- User-provided per session or stored encrypted

### File System Access
- Scoped to app data directory
- Follows Tauri security best practices
- Sandboxed environment

## Performance Considerations

### Frontend
- Lazy loading of components
- Virtualized lists for large recording sets
- Debounced search and filtering

### Backend
- Async/await for non-blocking operations
- Database connection pooling
- Efficient file I/O

### ML Services
- Model caching to avoid reloading
- Batch processing for embeddings
- GPU acceleration when available

## Extensibility

The architecture is designed to be extensible:

- **New Models**: Add to `python/models/`
- **New Features**: Add modules to `src-tauri/src/`
- **New UI Components**: Add to `src/components/`
- **New APIs**: Extend FastAPI server

## Future Enhancements

- Real-time transcription
- Multi-language support
- Cloud sync (optional)
- Plugin system
- Custom model training
