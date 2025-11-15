import { invoke } from '@tauri-apps/api/core';
import { AudioDevice } from '../types';

export async function getAudioDevices(): Promise<AudioDevice[]> {
  return await invoke('get_audio_devices');
}

export async function startRecording(deviceId?: string): Promise<void> {
  return await invoke('start_recording', { deviceId });
}

export async function stopRecording(): Promise<string> {
  return await invoke('stop_recording');
}
