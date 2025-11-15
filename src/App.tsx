import { useState, useEffect } from 'react';
import RecordingList from './components/RecordingList';
import RecordingControls from './components/RecordingControls';
import TranscriptViewer from './components/TranscriptViewer';
import { Recording } from './types/recording';
import { getRecordings } from './services/storage';
import './App.css';

function App() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const data = await getRecordings();
      setRecordings(data);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    }
  };

  const handleRecordingComplete = () => {
    loadRecordings();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>VoiceMap</h1>
        <p>AI-powered voice recording and transcription</p>
      </header>

      <main className="app-main">
        <div className="recording-section">
          <RecordingControls
            isRecording={isRecording}
            onRecordingStateChange={setIsRecording}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>

        <div className="content-section">
          <div className="recordings-panel">
            <h2>Your Recordings</h2>
            <RecordingList
              recordings={recordings}
              selectedRecording={selectedRecording}
              onSelectRecording={setSelectedRecording}
              onDeleteRecording={loadRecordings}
            />
          </div>

          <div className="transcript-panel">
            {selectedRecording ? (
              <TranscriptViewer recording={selectedRecording} />
            ) : (
              <div className="empty-state">
                <p>Select a recording to view its transcript</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
