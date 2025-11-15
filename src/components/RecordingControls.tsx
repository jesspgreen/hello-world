import { useState, useEffect } from 'react';
import { startRecording, stopRecording, getAudioDevices } from '../services/audio';
import { saveRecording } from '../services/storage';
import { AudioDevice } from '../types';
import './RecordingControls.css';

interface RecordingControlsProps {
  isRecording: boolean;
  onRecordingStateChange: (isRecording: boolean) => void;
  onRecordingComplete: () => void;
}

function RecordingControls({
  isRecording,
  onRecordingStateChange,
  onRecordingComplete,
}: RecordingControlsProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const loadDevices = async () => {
    try {
      const deviceList = await getAudioDevices();
      setDevices(deviceList);
      if (deviceList.length > 0) {
        setSelectedDevice(deviceList[0].id);
      }
    } catch (err) {
      setError('Failed to load audio devices');
      console.error(err);
    }
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording(selectedDevice);
      onRecordingStateChange(true);
    } catch (err) {
      setError('Failed to start recording');
      console.error(err);
    }
  };

  const handleStopRecording = async () => {
    try {
      setError(null);
      const filePath = await stopRecording();
      onRecordingStateChange(false);

      // Save recording to database
      const title = `Recording ${new Date().toLocaleString()}`;
      await saveRecording({
        title,
        file_path: filePath,
        duration: recordingTime,
      });

      onRecordingComplete();
    } catch (err) {
      setError('Failed to stop recording');
      console.error(err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-controls">
      <div className="controls-header">
        <h2>Recording Controls</h2>
        {isRecording && (
          <div className="recording-indicator">
            <span className="pulse"></span>
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="controls-body">
        <div className="device-selector">
          <label htmlFor="audio-device">Audio Device:</label>
          <select
            id="audio-device"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isRecording}
          >
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-buttons">
          {!isRecording ? (
            <button className="btn btn-primary btn-record" onClick={handleStartRecording}>
              <span className="btn-icon">🎤</span>
              Start Recording
            </button>
          ) : (
            <button className="btn btn-danger btn-stop" onClick={handleStopRecording}>
              <span className="btn-icon">⏹</span>
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordingControls;
