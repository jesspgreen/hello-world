# VoiceMap ML Services

This directory contains Python-based machine learning services for VoiceMap.

## Structure

- `models/` - Model loading and inference code
- `preprocessing/` - Audio preprocessing utilities
- `inference/` - Inference servers and endpoints

## Setup

1. Install Python 3.10 or higher
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Start the ML inference server:
```bash
python -m uvicorn inference.server:app --host 0.0.0.0 --port 8000
```

## Models

- **Whisper**: Audio transcription
- **Custom embeddings**: Semantic search
