/**
 * useTextToSpeech Hook
 * 
 * Handles text-to-speech conversion
 * Supports multiple languages and voices
 */

import { useEffect, useRef, useState } from 'react';

interface UseTextToSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech({
  language = 'pl-PL',
  rate = 1,
  pitch = 1,
  volume = 1,
}: UseTextToSpeechOptions = {}) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    synthRef.current = synth;

    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!synthRef.current || !isSupported) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
