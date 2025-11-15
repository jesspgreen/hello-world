import { invoke } from '@tauri-apps/api/core';

export interface EncryptionResult {
  success: boolean;
  output_path: string;
}

export async function encryptFile(
  inputPath: string,
  outputPath: string,
  password?: string
): Promise<EncryptionResult> {
  return await invoke('encrypt_file', { inputPath, outputPath, password });
}

export async function decryptFile(
  inputPath: string,
  outputPath: string,
  password?: string
): Promise<EncryptionResult> {
  return await invoke('decrypt_file', { inputPath, outputPath, password });
}
