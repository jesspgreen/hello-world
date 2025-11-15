// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod encryption;
mod llm;
mod storage;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            audio::start_recording,
            audio::stop_recording,
            audio::get_audio_devices,
            encryption::encrypt_file,
            encryption::decrypt_file,
            storage::save_recording,
            storage::get_recordings,
            storage::delete_recording,
            llm::transcribe_audio,
            llm::summarize_text,
        ])
        .setup(|app| {
            // Initialize database on startup
            let app_handle = app.handle();
            storage::init_database(app_handle)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
