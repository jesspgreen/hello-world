import { invoke } from '@tauri-apps/api/core';
import { TranscriptionResult, SummaryResult } from '../types';

export async function transcribeAudio(
  filePath: string,
  apiKey?: string
): Promise<TranscriptionResult> {
  return await invoke('transcribe_audio', { filePath, apiKey });
}

export async function summarizeText(
  text: string,
  apiKey?: string
): Promise<SummaryResult> {
  return await invoke('summarize_text', { text, apiKey });
}

export async function generateEmbeddings(
  text: string,
  apiKey?: string
): Promise<number[]> {
  return await invoke('generate_embeddings', { text, apiKey });
}

export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  apiKey?: string
): Promise<string> {
  return await invoke('chat_with_ai', { messages, apiKey });
}
