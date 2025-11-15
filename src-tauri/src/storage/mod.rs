use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recording {
    pub id: i64,
    pub title: String,
    pub file_path: String,
    pub duration: f64,
    pub transcript: Option<String>,
    pub summary: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewRecording {
    pub title: String,
    pub file_path: String,
    pub duration: f64,
}

type DbConnection = Mutex<Connection>;

/// Initialize the database
pub fn init_database(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("voicemap.db");
    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL,
            duration REAL NOT NULL,
            transcript TEXT,
            summary TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC)",
        [],
    )?;

    app.manage(Mutex::new(conn));
    Ok(())
}

/// Save a new recording to the database
#[tauri::command]
pub async fn save_recording(
    recording: NewRecording,
    state: State<'_, DbConnection>,
) -> Result<Recording, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO recordings (title, file_path, duration) VALUES (?1, ?2, ?3)",
        params![recording.title, recording.file_path, recording.duration],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    let saved_recording = conn
        .query_row(
            "SELECT id, title, file_path, duration, transcript, summary, created_at, updated_at
             FROM recordings WHERE id = ?1",
            params![id],
            |row| {
                Ok(Recording {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    file_path: row.get(2)?,
                    duration: row.get(3)?,
                    transcript: row.get(4)?,
                    summary: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(saved_recording)
}

/// Get all recordings from the database
#[tauri::command]
pub async fn get_recordings(state: State<'_, DbConnection>) -> Result<Vec<Recording>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, file_path, duration, transcript, summary, created_at, updated_at
             FROM recordings ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let recordings = stmt
        .query_map([], |row| {
            Ok(Recording {
                id: row.get(0)?,
                title: row.get(1)?,
                file_path: row.get(2)?,
                duration: row.get(3)?,
                transcript: row.get(4)?,
                summary: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<_>>>()
        .map_err(|e| e.to_string())?;

    Ok(recordings)
}

/// Delete a recording from the database
#[tauri::command]
pub async fn delete_recording(id: i64, state: State<'_, DbConnection>) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM recordings WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Update recording transcript and summary
#[tauri::command]
pub async fn update_recording_transcript(
    id: i64,
    transcript: String,
    summary: Option<String>,
    state: State<'_, DbConnection>,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE recordings SET transcript = ?1, summary = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
        params![transcript, summary, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
