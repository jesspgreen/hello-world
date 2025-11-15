use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingState {
    pub is_recording: bool,
    pub duration: f64,
}

type AudioStateType = Arc<Mutex<RecordingState>>;

/// Get available audio input devices
#[tauri::command]
pub async fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    // TODO: Implement audio device enumeration using cpal
    Ok(vec![AudioDevice {
        id: "default".to_string(),
        name: "Default Microphone".to_string(),
    }])
}

/// Start audio recording
#[tauri::command]
pub async fn start_recording(
    device_id: Option<String>,
    state: State<'_, AudioStateType>,
) -> Result<(), String> {
    let mut recording_state = state.lock().map_err(|e| e.to_string())?;

    if recording_state.is_recording {
        return Err("Already recording".to_string());
    }

    // TODO: Implement audio recording using cpal
    recording_state.is_recording = true;
    recording_state.duration = 0.0;

    Ok(())
}

/// Stop audio recording and return the file path
#[tauri::command]
pub async fn stop_recording(state: State<'_, AudioStateType>) -> Result<String, String> {
    let mut recording_state = state.lock().map_err(|e| e.to_string())?;

    if !recording_state.is_recording {
        return Err("Not currently recording".to_string());
    }

    // TODO: Implement stopping recording and saving to file
    recording_state.is_recording = false;

    Ok("path/to/recording.wav".to_string())
}

/// Initialize audio module state
pub fn init_state() -> AudioStateType {
    Arc::new(Mutex::new(RecordingState {
        is_recording: false,
        duration: 0.0,
    }))
}
