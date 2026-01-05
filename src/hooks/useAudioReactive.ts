import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioData {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  frequencies: number[];
  /**
   * A smoothed "energy" metric used to drive visual effects.
   * Mixes spectral energy with overall loudness for a stable signal.
   */
  energy: number;
  /**
   * Beat envelope derived from energy with fast attack and slow release.
   * Provides a more pronounced yet stable modulation curve.
   */
  beatEnvelope: number;
}

type AudioSourceType = 'mic' | 'file' | null;

interface Options {
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export function useAudioReactive({
  fftSize = 256,
  smoothingTimeConstant = 0.8,
}: Options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [source, setSource] = useState<AudioSourceType>(null);
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    frequencies: [],
    energy: 0,
    beatEnvelope: 0,
  });
  const energyRef = useRef(0);
  const beatEnvelopeRef = useRef(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  /* ===============================
     ANALYSE LOOP
  =============================== */
  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    const data = dataArrayRef.current;
    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);
    const len = data.length;

    let sum = 0;
    for (let i = 0; i < len; i++) sum += data[i];
    const volume = sum / (len * 255);

    const bassEnd = Math.floor(len * 0.1);
    const midEnd = Math.floor(len * 0.5);

    let bass = 0, mid = 0, treble = 0;

    for (let i = 0; i < bassEnd; i++) bass += data[i];
    for (let i = bassEnd; i < midEnd; i++) mid += data[i];
    for (let i = midEnd; i < len; i++) treble += data[i];

    bass = bassEnd ? bass / (bassEnd * 255) : 0;
    mid = (midEnd - bassEnd) ? mid / ((midEnd - bassEnd) * 255) : 0;
    treble = (len - midEnd) ? treble / ((len - midEnd) * 255) : 0;

    const frequencies: number[] = [];
    const step = Math.max(1, Math.floor(len / 32));
    for (let i = 0; i < len; i += step) {
      frequencies.push(data[i] / 255);
    }

    // Smoothed energy (mix of volume + weighted bands)
    const rawEnergy = Math.min(1, volume * 0.6 + bass * 0.8 + mid * 0.4 + treble * 0.25);
    const smoothedEnergy = energyRef.current + (rawEnergy - energyRef.current) * 0.35;
    energyRef.current = smoothedEnergy;

    // Beat envelope: fast attack, slow release for clear pulse emphasis
    const attack = 0.75;
    const release = 0.035;
    const currentEnvelope = beatEnvelopeRef.current;
    const target = smoothedEnergy;
    const envelopeDelta = target - currentEnvelope;
    const nextEnvelope = currentEnvelope + envelopeDelta * (envelopeDelta > 0 ? attack : release);
    beatEnvelopeRef.current = nextEnvelope;

    setAudioData({
      volume,
      bass,
      mid,
      treble,
      frequencies,
      energy: smoothedEnergy,
      beatEnvelope: nextEnvelope,
    });
    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  /* ===============================
     INIT AUDIO GRAPH
  =============================== */
  const initAnalyser = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();

    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothingTimeConstant;

    analyser.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.8;

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    gainRef.current = gain;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    return ctx;
  }, [fftSize, smoothingTimeConstant]);

  /* ===============================
     MICRO (analyse seule, sans sortie)
  =============================== */
  const startMic = useCallback(async () => {
    stop();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = initAnalyser();
    await ctx.resume();

    const mic = ctx.createMediaStreamSource(stream);
    mic.connect(analyserRef.current!);

    // Avoid feedback when using the microphone: keep output muted.
    if (gainRef.current) {
      gainRef.current.gain.value = 0;
    }

    streamRef.current = stream;
    setSource('mic');
    setIsListening(true);
    rafRef.current = requestAnimationFrame(analyze);
  }, [analyze, initAnalyser]);

  /* ===============================
     AUDIO FILE (audible + analyse)
  =============================== */
  const loadAudioFile = useCallback(async (file: File) => {
    stop();

    const ctx = initAnalyser();
    await ctx.resume();

    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Playable + analysable path
    src.connect(analyserRef.current!);
    if (gainRef.current) {
      gainRef.current.gain.value = 0.9;
    }

    src.start();

    bufferSourceRef.current = src;

    setSource('file');
    setIsListening(true);
    rafRef.current = requestAnimationFrame(analyze);
  }, [analyze, initAnalyser]);

  /* ===============================
     STOP
  =============================== */
  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    bufferSourceRef.current?.stop();
    bufferSourceRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    analyserRef.current = null;
    gainRef.current = null;
    dataArrayRef.current = null;

    setIsListening(false);
    setSource(null);
    energyRef.current = 0;
    beatEnvelopeRef.current = 0;
    setAudioData({
      volume: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      frequencies: [],
      energy: 0,
      beatEnvelope: 0,
    });
  }, []);

  useEffect(() => stop, [stop]);

  return {
    isListening,
    source,
    audioData,
    startMic,
    loadAudioFile,
    stop,
  };
}
