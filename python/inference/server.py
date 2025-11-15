"""FastAPI server for ML inference."""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import tempfile
import os
from pathlib import Path

from ..models import WhisperModel, EmbeddingModel
from ..preprocessing import AudioPreprocessor

# Initialize FastAPI app
app = FastAPI(
    title="VoiceMap ML API",
    description="Machine learning services for VoiceMap",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models (lazy loading)
whisper_model: Optional[WhisperModel] = None
embedding_model: Optional[EmbeddingModel] = None
audio_preprocessor = AudioPreprocessor()


class TranscriptionResponse(BaseModel):
    """Transcription response model."""
    text: str
    language: Optional[str] = None
    duration: float


class EmbeddingResponse(BaseModel):
    """Embedding response model."""
    embeddings: List[float]


class SimilarityRequest(BaseModel):
    """Similarity request model."""
    text1: str
    text2: str


class SimilarityResponse(BaseModel):
    """Similarity response model."""
    similarity: float


@app.on_event("startup")
async def startup_event():
    """Initialize models on startup."""
    global whisper_model, embedding_model
    # Models will be loaded on first request to save memory
    pass


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "VoiceMap ML API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    model_size: str = "base"
):
    """
    Transcribe audio file.

    Args:
        file: Audio file to transcribe
        language: Language code (optional)
        model_size: Whisper model size

    Returns:
        Transcription result
    """
    global whisper_model

    # Initialize model if needed
    if whisper_model is None or whisper_model.model_size != model_size:
        whisper_model = WhisperModel(model_size=model_size)

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Transcribe
        result = whisper_model.transcribe(temp_path, language=language)

        # Get duration
        audio, sr = audio_preprocessor.load_audio(temp_path)
        duration = len(audio) / sr

        return TranscriptionResponse(
            text=result["text"],
            language=result.get("language"),
            duration=duration
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.unlink(temp_path)


@app.post("/embeddings", response_model=EmbeddingResponse)
async def get_embeddings(text: str):
    """
    Generate embeddings for text.

    Args:
        text: Text to embed

    Returns:
        Embedding vector
    """
    global embedding_model

    # Initialize model if needed
    if embedding_model is None:
        embedding_model = EmbeddingModel()

    try:
        embeddings = embedding_model.encode(text)
        return EmbeddingResponse(embeddings=embeddings[0].tolist())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/similarity", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """
    Calculate similarity between two texts.

    Args:
        request: Similarity request with two texts

    Returns:
        Similarity score
    """
    global embedding_model

    # Initialize model if needed
    if embedding_model is None:
        embedding_model = EmbeddingModel()

    try:
        similarity = embedding_model.similarity(request.text1, request.text2)
        return SimilarityResponse(similarity=similarity)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
