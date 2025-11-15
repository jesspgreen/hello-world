# Development Guide

This guide will help you set up your development environment and understand the development workflow for VoiceMap.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Rust** (latest stable)
   - Install: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Verify: `rustc --version`

3. **Python** (3.10 or higher)
   - Download from [python.org](https://www.python.org/)
   - Verify: `python --version`

4. **Tauri Prerequisites**
   - Follow the [Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites)

## Project Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd voicemap

# Install Node dependencies
npm install

# Install Python dependencies
cd python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Development Mode

```bash
# Terminal 1: Start the Python ML service (optional)
cd python
source venv/bin/activate
python -m uvicorn inference.server:app --reload --port 8000

# Terminal 2: Start Tauri development server
npm run tauri:dev
```

The app will open automatically with hot-reload enabled.

## Project Structure

```
voicemap/
├── src/                      # React frontend source
│   ├── components/           # React components
│   │   ├── RecordingControls.tsx
│   │   ├── RecordingList.tsx
│   │   └── TranscriptViewer.tsx
│   ├── services/            # Service layer
│   │   ├── audio.ts
│   │   ├── storage.ts
│   │   ├── llm.ts
│   │   └── encryption.ts
│   ├── types/               # TypeScript types
│   │   └── recording.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── audio/           # Audio recording module
│   │   ├── encryption/      # Encryption module
│   │   ├── storage/         # Database module
│   │   ├── llm/            # LLM integration module
│   │   └── main.rs          # Entry point
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── python/                  # Python ML services
│   ├── models/             # ML models
│   ├── preprocessing/      # Audio preprocessing
│   └── inference/          # FastAPI server
├── public/                 # Static assets
├── package.json            # Node dependencies
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite config
```

## Development Workflow

### Frontend Development

1. **Creating Components**
   ```tsx
   // src/components/MyComponent.tsx
   import { useState } from 'react';
   import './MyComponent.css';

   function MyComponent() {
     const [state, setState] = useState('');
     return <div>My Component</div>;
   }

   export default MyComponent;
   ```

2. **Using Services**
   ```tsx
   import { getRecordings } from '@/services/storage';

   const recordings = await getRecordings();
   ```

3. **TypeScript Types**
   ```tsx
   import { Recording } from '@/types';

   const recording: Recording = { /* ... */ };
   ```

### Backend Development (Rust)

1. **Creating Commands**
   ```rust
   #[tauri::command]
   pub async fn my_command(param: String) -> Result<String, String> {
       // Implementation
       Ok("Success".to_string())
   }
   ```

2. **Registering Commands**
   ```rust
   // In main.rs
   .invoke_handler(tauri::generate_handler![
       my_command,
       // ... other commands
   ])
   ```

3. **Using from Frontend**
   ```typescript
   import { invoke } from '@tauri-apps/api/core';

   const result = await invoke('my_command', { param: 'value' });
   ```

### Python ML Services

1. **Adding New Models**
   ```python
   # python/models/my_model.py
   class MyModel:
       def __init__(self):
           # Initialize model
           pass

       def predict(self, input_data):
           # Make prediction
           pass
   ```

2. **Adding Endpoints**
   ```python
   # python/inference/server.py
   @app.post("/my-endpoint")
   async def my_endpoint(data: MyRequest):
       # Process request
       return MyResponse(result="success")
   ```

## Testing

### Frontend Tests
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Backend Tests
```bash
# Run Rust tests
cd src-tauri
cargo test
```

### Python Tests
```bash
# Run Python tests
cd python
pytest
```

## Building

### Development Build
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run tauri:build
```

The built application will be in `src-tauri/target/release/`.

## Code Style

### TypeScript/React
- Use functional components with hooks
- Follow the Airbnb style guide
- Run linter: `npm run lint`
- Format code: `npm run format`

### Rust
- Follow Rust standard style
- Format: `cargo fmt`
- Lint: `cargo clippy`

### Python
- Follow PEP 8
- Format with black: `black .`
- Lint with flake8: `flake8 .`

## Debugging

### Frontend Debugging
1. Open DevTools in the app (Ctrl+Shift+I / Cmd+Option+I)
2. Use React DevTools extension
3. Check console for errors

### Backend Debugging
1. Use `println!()` or `dbg!()` macros
2. Check terminal output
3. Use `rust-lldb` or `rust-gdb` for advanced debugging

### Python Debugging
1. Use `print()` statements
2. Use Python debugger: `import pdb; pdb.set_trace()`
3. Check FastAPI logs

## Common Issues

### Port Already in Use
```bash
# Kill process on port 1420 (frontend)
lsof -ti:1420 | xargs kill -9

# Kill process on port 8000 (Python)
lsof -ti:8000 | xargs kill -9
```

### Rust Compilation Errors
```bash
# Clean build
cd src-tauri
cargo clean
cargo build
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Whisper Documentation](https://github.com/openai/whisper)
