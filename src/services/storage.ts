import { invoke } from '@tauri-apps/api/core';
import { Recording, NewRecording } from '../types';

export async function saveRecording(recording: NewRecording): Promise<Recording> {
  return await invoke('save_recording', { recording });
}

export async function getRecordings(): Promise<Recording[]> {
  return await invoke('get_recordings');
}

export async function deleteRecording(id: number): Promise<void> {
  return await invoke('delete_recording', { id });
}

export async function updateRecordingTranscript(
  id: number,
  transcript: string,
  summary?: string
): Promise<void> {
  return await invoke('update_recording_transcript', { id, transcript, summary });
}
