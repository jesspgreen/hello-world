"""Embedding model for semantic search."""
from typing import List, Union
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np


class EmbeddingModel:
    """Text embedding model for semantic search."""

    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        device: str = None
    ):
        """
        Initialize embedding model.

        Args:
            model_name: HuggingFace model name
            device: Device to use (cuda, cpu, or None for auto)
        """
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.model.eval()

    def encode(
        self,
        texts: Union[str, List[str]],
        batch_size: int = 32
    ) -> np.ndarray:
        """
        Encode texts to embeddings.

        Args:
            texts: Text or list of texts to encode
            batch_size: Batch size for encoding

        Returns:
            Numpy array of embeddings
        """
        if isinstance(texts, str):
            texts = [texts]

        embeddings = []

        with torch.no_grad():
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]

                # Tokenize
                encoded = self.tokenizer(
                    batch,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt"
                ).to(self.device)

                # Get embeddings
                outputs = self.model(**encoded)

                # Mean pooling
                attention_mask = encoded["attention_mask"]
                token_embeddings = outputs.last_hidden_state

                input_mask_expanded = (
                    attention_mask
                    .unsqueeze(-1)
                    .expand(token_embeddings.size())
                    .float()
                )

                batch_embeddings = torch.sum(
                    token_embeddings * input_mask_expanded, 1
                ) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

                # Normalize
                batch_embeddings = torch.nn.functional.normalize(
                    batch_embeddings, p=2, dim=1
                )

                embeddings.append(batch_embeddings.cpu().numpy())

        return np.vstack(embeddings)

    def similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts.

        Args:
            text1: First text
            text2: Second text

        Returns:
            Similarity score (0-1)
        """
        embeddings = self.encode([text1, text2])
        similarity = np.dot(embeddings[0], embeddings[1])
        return float(similarity)
