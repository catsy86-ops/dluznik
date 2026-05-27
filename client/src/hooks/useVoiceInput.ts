/**
 * useVoiceInput Hook
 * 
 * Handles speech-to-text conversion for voice input
 * Supports Polish language by default
 */

import { useEffect, useRef, useState } from 'react';

interface UseVoiceInputOptions {
  language?: string;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export function useVoiceInput({
  language = 'pl-PL',
  onResult,
  onError,
  continuous = false,
}: UseVoiceInputOptions) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.language = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript(transcript);
          onResult?.(transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = `Voice error: ${event.error}`;
      onError?.(errorMessage);
      console.error(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language, onResult, onError, continuous]);

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    isSupported,
  };
}
