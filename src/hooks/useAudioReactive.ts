import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioData {
  volume: number;        // 0-1 overall volume
  bass: number;          // 0-1 low frequencies
  mid: number;           // 0-1 mid frequencies  
  treble: number;        // 0-1 high frequencies
  frequencies: number[]; // Raw frequency data (normalized)
}

interface UseAudioReactiveOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export function useAudioReactive(options: UseAudioReactiveOptions = {}) {
  const { fftSize = 256, smoothingTimeConstant = 0.8 } = options;

  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    frequencies: [],
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const data = dataArrayRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyserRef.current.getByteFrequencyData(data as any);
    const bufferLength = data.length;

    // Calculate overall volume (RMS)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += data[i];
    }
    const volume = sum / (bufferLength * 255);

    // Split into frequency bands
    const bassEnd = Math.floor(bufferLength * 0.1);
    const midEnd = Math.floor(bufferLength * 0.5);

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < bassEnd; i++) {
      bassSum += data[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += data[i];
    }
    for (let i = midEnd; i < bufferLength; i++) {
      trebleSum += data[i];
    }

    const bass = bassEnd > 0 ? bassSum / (bassEnd * 255) : 0;
    const mid = (midEnd - bassEnd) > 0 ? midSum / ((midEnd - bassEnd) * 255) : 0;
    const treble = (bufferLength - midEnd) > 0 ? trebleSum / ((bufferLength - midEnd) * 255) : 0;

    // Normalize frequencies array
    const frequencies: number[] = [];
    const step = Math.max(1, Math.floor(bufferLength / 32));
    for (let i = 0; i < bufferLength; i += step) {
      frequencies.push(data[i] / 255);
    }

    setAudioData({ volume, bass, mid, treble, frequencies });

    animationRef.current = requestAnimationFrame(analyze);
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      streamRef.current = stream;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      setIsListening(true);
      animationRef.current = requestAnimationFrame(analyze);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }, [fftSize, smoothingTimeConstant, analyze]);

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setIsListening(false);
    setAudioData({
      volume: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      frequencies: [],
    });
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    audioData,
    startListening,
    stopListening,
    toggleListening,
  };
}
