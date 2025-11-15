"""Audio preprocessing utilities."""
import librosa
import soundfile as sf
import numpy as np
from pathlib import Path
from typing import Tuple, Optional


class AudioPreprocessor:
    """Audio preprocessing for ML models."""

    def __init__(self, sample_rate: int = 16000):
        """
        Initialize audio preprocessor.

        Args:
            sample_rate: Target sample rate
        """
        self.sample_rate = sample_rate

    def load_audio(
        self,
        audio_path: str,
        duration: Optional[float] = None,
        offset: float = 0.0
    ) -> Tuple[np.ndarray, int]:
        """
        Load audio file.

        Args:
            audio_path: Path to audio file
            duration: Duration to load (None for full file)
            offset: Start time offset

        Returns:
            Tuple of (audio_data, sample_rate)
        """
        audio, sr = librosa.load(
            audio_path,
            sr=self.sample_rate,
            duration=duration,
            offset=offset
        )
        return audio, sr

    def normalize_audio(self, audio: np.ndarray) -> np.ndarray:
        """
        Normalize audio to [-1, 1] range.

        Args:
            audio: Audio data

        Returns:
            Normalized audio
        """
        max_val = np.abs(audio).max()
        if max_val > 0:
            audio = audio / max_val
        return audio

    def remove_silence(
        self,
        audio: np.ndarray,
        threshold_db: float = 20,
        frame_length: int = 2048,
        hop_length: int = 512
    ) -> np.ndarray:
        """
        Remove silence from audio.

        Args:
            audio: Audio data
            threshold_db: Silence threshold in dB
            frame_length: Frame length for analysis
            hop_length: Hop length for analysis

        Returns:
            Audio with silence removed
        """
        non_silent_intervals = librosa.effects.split(
            audio,
            top_db=threshold_db,
            frame_length=frame_length,
            hop_length=hop_length
        )

        non_silent_audio = np.concatenate([
            audio[start:end] for start, end in non_silent_intervals
        ])

        return non_silent_audio

    def reduce_noise(
        self,
        audio: np.ndarray,
        stationary: bool = True
    ) -> np.ndarray:
        """
        Simple noise reduction using spectral gating.

        Args:
            audio: Audio data
            stationary: Whether noise is stationary

        Returns:
            Denoised audio
        """
        # Simple spectral subtraction
        stft = librosa.stft(audio)
        magnitude = np.abs(stft)
        phase = np.angle(stft)

        # Estimate noise from first few frames
        noise_estimate = np.median(magnitude[:, :10], axis=1, keepdims=True)

        # Subtract noise
        magnitude_denoised = np.maximum(magnitude - noise_estimate, 0)

        # Reconstruct
        stft_denoised = magnitude_denoised * np.exp(1j * phase)
        audio_denoised = librosa.istft(stft_denoised)

        return audio_denoised

    def convert_format(
        self,
        input_path: str,
        output_path: str,
        target_format: str = "wav"
    ) -> None:
        """
        Convert audio to different format.

        Args:
            input_path: Input audio file path
            output_path: Output audio file path
            target_format: Target format (wav, flac, etc.)
        """
        audio, sr = self.load_audio(input_path)

        output_path = Path(output_path)
        if not output_path.suffix:
            output_path = output_path.with_suffix(f".{target_format}")

        sf.write(str(output_path), audio, sr)

    def get_audio_features(self, audio: np.ndarray) -> dict:
        """
        Extract audio features.

        Args:
            audio: Audio data

        Returns:
            Dictionary of features
        """
        features = {
            "duration": len(audio) / self.sample_rate,
            "rms_energy": float(np.sqrt(np.mean(audio**2))),
            "zero_crossing_rate": float(
                np.mean(librosa.zero_crossings(audio))
            ),
        }

        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(
            y=audio, sr=self.sample_rate
        )[0]
        features["spectral_centroid_mean"] = float(np.mean(spectral_centroids))
        features["spectral_centroid_std"] = float(np.std(spectral_centroids))

        return features
