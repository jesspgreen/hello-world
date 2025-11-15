export interface Recording {
  id: number;
  title: string;
  file_path: string;
  duration: number;
  transcript?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface NewRecording {
  title: string;
  file_path: string;
  duration: number;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration: number;
}

export interface SummaryResult {
  summary: string;
  key_points: string[];
}

export interface AudioDevice {
  id: string;
  name: string;
}

export interface RecordingState {
  is_recording: boolean;
  duration: number;
}
