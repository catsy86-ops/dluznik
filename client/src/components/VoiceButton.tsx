/**
 * VoiceButton Component
 * 
 * Button for voice input with visual feedback
 * Shows recording state and transcript
 */

import { useVoiceInput } from '../hooks/useVoiceInput';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  label?: string;
  className?: string;
  language?: string;
  placeholder?: string;
}

export default function VoiceButton({
  onTranscript,
  label = '🎤 Voice',
  className = '',
  language = 'pl-PL',
  placeholder = 'Listening...',
}: VoiceButtonProps) {
  const { isListening, transcript, startListening, stopListening, isSupported } =
    useVoiceInput({
      language,
      onResult: onTranscript,
    });

  if (!isSupported) {
    return (
      <button
        disabled
        title="Voice input not supported in your browser"
        style={{
          opacity: 0.5,
          cursor: 'not-allowed',
        }}
      >
        {label} (Not supported)
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`btn-primary ${className}`}
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
          animation: isListening ? 'pulseGlow 1s ease-in-out infinite' : 'none',
        }}
      >
        {isListening ? '⏹️ Stop' : label}
      </button>

      {transcript && (
        <div
          style={{
            padding: '6px 12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {transcript}
        </div>
      )}

      {isListening && (
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            background: '#f43f5e',
            borderRadius: '50%',
            animation: 'pulseGlow 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}
