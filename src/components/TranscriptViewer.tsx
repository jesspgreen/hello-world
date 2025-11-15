import { useState } from 'react';
import { Recording } from '../types';
import { transcribeAudio, summarizeText } from '../services/llm';
import { updateRecordingTranscript } from '../services/storage';
import './TranscriptViewer.css';

interface TranscriptViewerProps {
  recording: Recording;
}

function TranscriptViewer({ recording }: TranscriptViewerProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    try {
      setError(null);
      setIsTranscribing(true);
      const result = await transcribeAudio(recording.file_path);
      await updateRecordingTranscript(recording.id, result.text);
      // Update local state would require prop callback or state management
    } catch (err) {
      setError('Failed to transcribe audio');
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSummarize = async () => {
    if (!recording.transcript) {
      setError('Please transcribe the recording first');
      return;
    }

    try {
      setError(null);
      setIsSummarizing(true);
      const result = await summarizeText(recording.transcript);
      await updateRecordingTranscript(
        recording.id,
        recording.transcript,
        result.summary
      );
    } catch (err) {
      setError('Failed to generate summary');
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="transcript-viewer">
      <div className="viewer-header">
        <div>
          <h2>{recording.title}</h2>
          <div className="recording-details">
            <span>{formatDate(recording.created_at)}</span>
            <span>•</span>
            <span>{formatDuration(recording.duration)}</span>
          </div>
        </div>
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleTranscribe}
            disabled={isTranscribing}
          >
            {isTranscribing ? 'Transcribing...' : '📝 Transcribe'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSummarize}
            disabled={isSummarizing || !recording.transcript}
          >
            {isSummarizing ? 'Summarizing...' : '📋 Summarize'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {recording.summary && (
        <div className="summary-section">
          <h3>Summary</h3>
          <p className="summary-text">{recording.summary}</p>
        </div>
      )}

      <div className="transcript-section">
        <h3>Transcript</h3>
        {recording.transcript ? (
          <div className="transcript-text">{recording.transcript}</div>
        ) : (
          <div className="empty-transcript">
            <p>No transcript available</p>
            <p className="empty-subtitle">
              Click "Transcribe" to generate a transcript
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TranscriptViewer;
