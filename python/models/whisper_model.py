"""Whisper model for audio transcription."""
import whisper
from typing import Optional, Dict, Any
import torch


class WhisperModel:
    """Wrapper for OpenAI Whisper model."""

    def __init__(self, model_size: str = "base", device: Optional[str] = None):
        """
        Initialize Whisper model.

        Args:
            model_size: Model size (tiny, base, small, medium, large)
            device: Device to use (cuda, cpu, or None for auto)
        """
        self.model_size = model_size
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = whisper.load_model(model_size, device=self.device)

    def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Transcribe audio file.

        Args:
            audio_path: Path to audio file
            language: Language code (optional, auto-detected if None)
            **kwargs: Additional arguments for whisper.transcribe()

        Returns:
            Dictionary with transcription results
        """
        result = self.model.transcribe(
            audio_path,
            language=language,
            **kwargs
        )

        return {
            "text": result["text"],
            "language": result.get("language"),
            "segments": result.get("segments", []),
        }

    def detect_language(self, audio_path: str) -> str:
        """
        Detect language of audio file.

        Args:
            audio_path: Path to audio file

        Returns:
            Language code
        """
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)

        mel = whisper.log_mel_spectrogram(audio).to(self.device)
        _, probs = self.model.detect_language(mel)

        return max(probs, key=probs.get)
