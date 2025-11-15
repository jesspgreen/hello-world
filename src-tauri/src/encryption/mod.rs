use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionResult {
    pub success: bool,
    pub output_path: String,
}

/// Derive a key from a password using Argon2
fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    let argon2 = Argon2::default();
    let salt_string = SaltString::encode_b64(salt).map_err(|e| e.to_string())?;

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt_string)
        .map_err(|e| e.to_string())?;

    let hash = password_hash.hash.ok_or("Failed to get hash")?;
    let mut key = [0u8; 32];
    key.copy_from_slice(&hash.as_bytes()[..32]);

    Ok(key)
}

/// Encrypt a file using AES-256-GCM
#[tauri::command]
pub async fn encrypt_file(
    input_path: String,
    output_path: String,
    password: Option<String>,
) -> Result<EncryptionResult, String> {
    // Read input file
    let plaintext = fs::read(&input_path).map_err(|e| format!("Failed to read file: {}", e))?;

    // Generate random salt and nonce
    let mut salt = [0u8; 16];
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut salt);
    OsRng.fill_bytes(&mut nonce_bytes);

    // Derive key from password or use default
    let key = if let Some(pwd) = password {
        derive_key(&pwd, &salt)?
    } else {
        // TODO: Use a key from secure storage
        [0u8; 32]
    };

    // Encrypt
    let cipher = Aes256Gcm::new(&key.into());
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Prepend salt and nonce to ciphertext
    let mut output = Vec::new();
    output.extend_from_slice(&salt);
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&ciphertext);

    // Write encrypted file
    fs::write(&output_path, output).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(EncryptionResult {
        success: true,
        output_path,
    })
}

/// Decrypt a file using AES-256-GCM
#[tauri::command]
pub async fn decrypt_file(
    input_path: String,
    output_path: String,
    password: Option<String>,
) -> Result<EncryptionResult, String> {
    // Read encrypted file
    let data = fs::read(&input_path).map_err(|e| format!("Failed to read file: {}", e))?;

    if data.len() < 28 {
        return Err("Invalid encrypted file".to_string());
    }

    // Extract salt, nonce, and ciphertext
    let salt = &data[..16];
    let nonce_bytes = &data[16..28];
    let ciphertext = &data[28..];

    // Derive key from password
    let key = if let Some(pwd) = password {
        derive_key(&pwd, salt)?
    } else {
        // TODO: Use a key from secure storage
        [0u8; 32]
    };

    // Decrypt
    let cipher = Aes256Gcm::new(&key.into());
    let nonce = Nonce::from_slice(nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    // Write decrypted file
    fs::write(&output_path, plaintext).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(EncryptionResult {
        success: true,
        output_path,
    })
}
