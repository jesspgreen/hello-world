import { Recording } from '../types';
import { deleteRecording } from '../services/storage';
import './RecordingList.css';

interface RecordingListProps {
  recordings: Recording[];
  selectedRecording: Recording | null;
  onSelectRecording: (recording: Recording) => void;
  onDeleteRecording: () => void;
}

function RecordingList({
  recordings,
  selectedRecording,
  onSelectRecording,
  onDeleteRecording,
}: RecordingListProps) {
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(id);
        onDeleteRecording();
      } catch (error) {
        console.error('Failed to delete recording:', error);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (recordings.length === 0) {
    return (
      <div className="recording-list-empty">
        <p>No recordings yet</p>
        <p className="empty-subtitle">Start recording to create your first voice note</p>
      </div>
    );
  }

  return (
    <div className="recording-list">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className={`recording-item ${
            selectedRecording?.id === recording.id ? 'selected' : ''
          }`}
          onClick={() => onSelectRecording(recording)}
        >
          <div className="recording-info">
            <h3 className="recording-title">{recording.title}</h3>
            <div className="recording-meta">
              <span className="recording-date">{formatDate(recording.created_at)}</span>
              <span className="recording-duration">{formatDuration(recording.duration)}</span>
            </div>
            {recording.transcript && (
              <p className="recording-preview">
                {recording.transcript.substring(0, 100)}
                {recording.transcript.length > 100 ? '...' : ''}
              </p>
            )}
          </div>
          <button
            className="btn-delete"
            onClick={(e) => handleDelete(e, recording.id)}
            title="Delete recording"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}

export default RecordingList;
