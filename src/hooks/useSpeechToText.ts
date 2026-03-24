import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechToTextReturn {
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const micCheckRef = useRef<number>(0);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[Speech] Recognition started');
    };

    recognition.onaudiostart = () => {
      console.log('[Speech] Audio capture started');
    };

    recognition.onspeechstart = () => {
      console.log('[Speech] Speech detected!');
    };

    recognition.onspeechend = () => {
      console.log('[Speech] Speech ended');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
          finalTranscriptRef.current = final;
        } else {
          interim += result[0].transcript;
        }
      }

      const combined = final + interim;
      console.log('[Speech] transcript:', combined);
      setTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.warn('[Speech] Error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('[Speech] Recognition ended');
      setIsListening(false);
      cancelAnimationFrame(micCheckRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      cancelAnimationFrame(micCheckRef.current);
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    setIsListening(true);

    // Monitor mic levels to verify audio input is working
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      let count = 0;
      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const max = Math.max(...data);
        if (count % 20 === 0) {
          console.log(`[Speech] Mic level: avg=${avg.toFixed(1)} max=${max} ${avg > 3 ? '🎤 AUDIO' : '🔇 silent'}`);
        }
        count++;
        micCheckRef.current = requestAnimationFrame(check);
      };
      micCheckRef.current = requestAnimationFrame(check);

      // Clean up mic monitor when recognition stops
      const origOnEnd = recognitionRef.current.onend;
      recognitionRef.current._micStream = stream;
      recognitionRef.current._micAudioCtx = audioCtx;
    }).catch(err => {
      console.warn('[Speech] Mic monitor error (non-fatal):', err);
    });

    try {
      console.log('[Speech] Calling start()');
      recognitionRef.current.start();
      console.log('[Speech] start() called successfully');
    } catch (err) {
      console.warn('[Speech] Start error:', err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    console.log('[Speech] Stopping...');
    recognitionRef.current.stop();
    setIsListening(false);
    cancelAnimationFrame(micCheckRef.current);

    // Clean up mic monitor
    if (recognitionRef.current._micStream) {
      recognitionRef.current._micStream.getTracks().forEach((t: any) => t.stop());
      recognitionRef.current._micStream = null;
    }
    if (recognitionRef.current._micAudioCtx) {
      recognitionRef.current._micAudioCtx.close();
      recognitionRef.current._micAudioCtx = null;
    }
  }, [isListening]);

  return {
    startListening,
    stopListening,
    transcript,
    isListening,
    isSupported,
    error,
  };
}
