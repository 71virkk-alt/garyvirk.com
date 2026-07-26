import React, { Component, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type LivingSignalProps = {
  portraitUrl: string;
};

type VisualMode = "loading" | "webgl" | "static";

type ParticleData = {
  portrait: Float32Array;
  corridor: Float32Array;
  evidence: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
};

const BPM = 82;
const BEAT_SECONDS = 60 / BPM;
const SCORE_BEATS = 128;
const SCORE_SECONDS = BEAT_SECONDS * SCORE_BEATS;

const CHORDS = [
  [38, 45, 48, 52, 53],
  [34, 41, 45, 48, 52],
  [41, 48, 52, 55, 57],
  [36, 43, 46, 50, 53],
  [38, 45, 50, 53, 57],
  [43, 50, 53, 57, 60],
  [41, 48, 52, 57, 60],
  [38, 45, 50, 54, 57]
] as const;

const MOTIF = [0, 2, 4, 2, 1, 3, 4, 3, 0, 3, 2, 4, 1, 2, 3, 4] as const;

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uAudio;
  uniform float uDpr;
  uniform vec2 uPointer;

  attribute vec3 aCorridor;
  attribute vec3 aEvidence;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vEnergy;

  float easeInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float firstMorph = easeInOut(clamp(uProgress, 0.0, 1.0));
    float secondMorph = easeInOut(clamp(uProgress - 1.0, 0.0, 1.0));

    vec3 transformed = mix(position, aCorridor, firstMorph);
    transformed = mix(transformed, aEvidence, secondMorph);

    float breath = sin(uTime * 0.48 + aSeed * 19.0) * 0.012;
    transformed.z += breath * (1.0 - secondMorph * 0.55);

    vec2 pointerInWorld = uPointer * vec2(2.8, 2.05);
    vec2 delta = transformed.xy - pointerInWorld;
    float pointerDistance = max(length(delta), 0.001);
    float portraitInfluence = 1.0 - smoothstep(0.0, 0.78, pointerDistance);
    transformed.xy += normalize(delta) * portraitInfluence * 0.18 * (1.0 - firstMorph);

    transformed.x += uPointer.x * (0.05 + abs(transformed.z) * 0.018);
    transformed.y += uPointer.y * (0.035 + abs(transformed.z) * 0.012);

    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    float depthScale = clamp(5.7 / max(1.0, -viewPosition.z), 0.48, 1.45);
    float audioScale = 1.0 + uAudio * (0.38 + mod(aSeed * 11.0, 0.45));
    gl_PointSize = aSize * uDpr * depthScale * audioScale;

    vColor = aColor;
    vEnergy = 0.72 + uAudio * 0.34 + portraitInfluence * 0.16;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vEnergy;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(centered);
    float core = 1.0 - smoothstep(0.18, 0.5, distanceFromCenter);
    float halo = (1.0 - smoothstep(0.05, 0.5, distanceFromCenter)) * 0.22;
    float alpha = (core * 0.84 + halo) * vEnergy;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function midiToFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function formatTime(seconds: number) {
  const normalized = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

function createReverbImpulse(context: AudioContext, duration = 2.8) {
  const length = Math.floor(context.sampleRate * duration);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  const random = seededRandom(7182);

  for (let channelIndex = 0; channelIndex < impulse.numberOfChannels; channelIndex += 1) {
    const channel = impulse.getChannelData(channelIndex);
    for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
      const envelope = Math.pow(1 - sampleIndex / length, 2.7);
      channel[sampleIndex] = (random() * 2 - 1) * envelope;
    }
  }

  return impulse;
}

class LivingScore {
  context: AudioContext | null = null;
  master: GainNode | null = null;
  musicBus: GainNode | null = null;
  pulseBus: GainNode | null = null;
  motifBus: GainNode | null = null;
  sfxBus: GainNode | null = null;
  filter: BiquadFilterNode | null = null;
  panner: StereoPannerNode | null = null;
  convolver: ConvolverNode | null = null;
  wetGain: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  analyserData: Uint8Array<ArrayBuffer> | null = null;
  textureSource: AudioBufferSourceNode | null = null;
  scheduleTimer = 0;
  suspendTimer = 0;
  nextBeatTime = 0;
  beatIndex = 0;
  scene = 0;
  volume = 0.2;
  enabled = false;
  startedAt = 0;

  async initialize() {
    if (this.context) return;
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) throw new Error("Web Audio is unavailable");

    const context = new AudioContextConstructor();
    const master = context.createGain();
    const musicBus = context.createGain();
    const pulseBus = context.createGain();
    const motifBus = context.createGain();
    const sfxBus = context.createGain();
    const filter = context.createBiquadFilter();
    const panner = context.createStereoPanner();
    const convolver = context.createConvolver();
    const wetGain = context.createGain();
    const analyser = context.createAnalyser();
    const compressor = context.createDynamicsCompressor();

    master.gain.value = 0.0001;
    musicBus.gain.value = 0.78;
    pulseBus.gain.value = [0.12, 0.54, 0.34][this.scene];
    motifBus.gain.value = [0.08, 0.28, 0.62][this.scene];
    sfxBus.gain.value = 0.75;
    filter.type = "lowpass";
    filter.frequency.value = [1450, 2350, 3100][this.scene];
    filter.Q.value = 0.7;
    panner.pan.value = 0;
    convolver.buffer = createReverbImpulse(context);
    wetGain.gain.value = 0.19;
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    compressor.threshold.value = -18;
    compressor.knee.value = 16;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.018;
    compressor.release.value = 0.24;

    musicBus.connect(filter);
    pulseBus.connect(filter);
    motifBus.connect(filter);
    filter.connect(panner);
    panner.connect(master);
    motifBus.connect(convolver);
    sfxBus.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(master);
    sfxBus.connect(master);
    master.connect(analyser);
    analyser.connect(compressor);
    compressor.connect(context.destination);

    this.context = context;
    this.master = master;
    this.musicBus = musicBus;
    this.pulseBus = pulseBus;
    this.motifBus = motifBus;
    this.sfxBus = sfxBus;
    this.filter = filter;
    this.panner = panner;
    this.convolver = convolver;
    this.wetGain = wetGain;
    this.analyser = analyser;
    this.analyserData = new Uint8Array(analyser.frequencyBinCount);
    this.startedAt = context.currentTime;
    this.nextBeatTime = context.currentTime + 0.08;

    this.startTexture();
    this.scheduleTimer = window.setInterval(() => this.schedule(), 50);
  }

  startTexture() {
    if (!this.context || !this.musicBus) return;
    const context = this.context;
    const seconds = 3;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const channel = buffer.getChannelData(0);
    const random = seededRandom(9127);
    let brown = 0;

    for (let index = 0; index < channel.length; index += 1) {
      const white = random() * 2 - 1;
      brown = brown * 0.985 + white * 0.015;
      channel[index] = brown * 0.75;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 560;
    filter.Q.value = 0.38;
    gain.gain.value = 0.018;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);
    source.start();
    this.textureSource = source;
  }

  schedule() {
    if (!this.context) return;
    const scheduleUntil = this.context.currentTime + 0.24;

    while (this.nextBeatTime < scheduleUntil) {
      const loopBeat = this.beatIndex % SCORE_BEATS;
      const bar = Math.floor(loopBeat / 4);
      const beatInBar = loopBeat % 4;
      const chord = CHORDS[bar % CHORDS.length];

      if (beatInBar === 0) this.schedulePad(chord, this.nextBeatTime);
      if (loopBeat % 2 === 0) this.scheduleMallet(chord, loopBeat, this.nextBeatTime);
      if (beatInBar === 0 || (this.scene > 0 && beatInBar === 2)) {
        this.schedulePulse(chord[0], this.nextBeatTime);
      }

      this.beatIndex = (this.beatIndex + 1) % SCORE_BEATS;
      this.nextBeatTime += BEAT_SECONDS;
    }
  }

  schedulePad(chord: readonly number[], startAt: number) {
    if (!this.context || !this.musicBus) return;
    const context = this.context;
    const duration = BEAT_SECONDS * 4.25;

    chord.forEach((note, voiceIndex) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const detune = voiceIndex % 2 === 0 ? -4 : 4;
      oscillator.type = voiceIndex < 2 ? "sine" : "triangle";
      oscillator.frequency.value = midiToFrequency(note);
      oscillator.detune.value = detune;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.012 / (1 + voiceIndex * 0.1), startAt + 0.48);
      gain.gain.setValueAtTime(0.009 / (1 + voiceIndex * 0.1), startAt + duration - 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(this.musicBus!);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.05);
    });
  }

  scheduleMallet(chord: readonly number[], loopBeat: number, startAt: number) {
    if (!this.context || !this.motifBus) return;
    const context = this.context;
    const motifIndex = MOTIF[Math.floor(loopBeat / 2) % MOTIF.length];
    const note = chord[motifIndex] + 12;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();
    const pan = context.createStereoPanner();
    const visibleGain = this.scene === 0 ? 0.018 : this.scene === 1 ? 0.031 : 0.044;

    oscillator.type = "sine";
    overtone.type = "triangle";
    oscillator.frequency.value = midiToFrequency(note);
    overtone.frequency.value = midiToFrequency(note) * 2.006;
    pan.pan.value = ((loopBeat % 8) / 7 - 0.5) * 0.75;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(visibleGain, startAt + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.62);
    overtoneGain.gain.setValueAtTime(visibleGain * 0.13, startAt);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34);

    oscillator.connect(gain);
    overtone.connect(overtoneGain);
    gain.connect(pan);
    overtoneGain.connect(pan);
    pan.connect(this.motifBus);
    oscillator.start(startAt);
    overtone.start(startAt);
    oscillator.stop(startAt + 0.68);
    overtone.stop(startAt + 0.4);
  }

  schedulePulse(rootNote: number, startAt: number) {
    if (!this.context || !this.pulseBus) return;
    const context = this.context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = midiToFrequency(rootNote - 12);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(this.scene === 0 ? 0.012 : 0.027, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.42);
    oscillator.connect(gain);
    gain.connect(this.pulseBus);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.46);
  }

  scheduleSceneCue(scene: number) {
    if (!this.context || !this.sfxBus) return;
    const context = this.context;
    const halfBar = BEAT_SECONDS * 2;
    const elapsed = context.currentTime - this.startedAt;
    const startAt = this.startedAt + Math.ceil(elapsed / halfBar) * halfBar;
    const frequencies = [
      [293.66, 440],
      [329.63, 493.88],
      [369.99, 554.37]
    ][scene];

    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const pan = context.createStereoPanner();
      const cueAt = startAt + index * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, cueAt);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.985, cueAt + 0.7);
      gain.gain.setValueAtTime(0.0001, cueAt);
      gain.gain.exponentialRampToValueAtTime(0.045, cueAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, cueAt + 0.82);
      pan.pan.value = index === 0 ? -0.28 : 0.28;
      oscillator.connect(gain);
      gain.connect(pan);
      pan.connect(this.sfxBus!);
      oscillator.start(cueAt);
      oscillator.stop(cueAt + 0.85);
    });
  }

  async enable() {
    await this.initialize();
    if (!this.context || !this.master) return;
    window.clearTimeout(this.suspendTimer);
    await this.context.resume();
    this.enabled = true;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.exponentialRampToValueAtTime(Math.max(0.0001, this.volume), now + 0.24);
    this.scheduleSceneCue(this.scene);
  }

  disable() {
    if (!this.context || !this.master) return;
    this.enabled = false;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    this.suspendTimer = window.setTimeout(() => {
      if (!this.enabled) this.context?.suspend();
    }, 240);
  }

  setVolume(volume: number) {
    this.volume = clamp(volume, 0, 1) * 0.34;
    if (!this.enabled || !this.context || !this.master) return;
    this.master.gain.setTargetAtTime(Math.max(this.volume, 0.0001), this.context.currentTime, 0.06);
  }

  setScene(scene: number) {
    if (scene === this.scene) return;
    this.scene = scene;
    if (!this.context) return;
    const now = this.context.currentTime;
    this.filter?.frequency.setTargetAtTime([1450, 2350, 3100][scene], now, 0.36);
    this.pulseBus?.gain.setTargetAtTime([0.12, 0.54, 0.34][scene], now, 0.3);
    this.motifBus?.gain.setTargetAtTime([0.08, 0.28, 0.62][scene], now, 0.3);
    if (this.enabled) this.scheduleSceneCue(scene);
  }

  setPan(normalizedX: number) {
    if (!this.context || !this.panner) return;
    this.panner.pan.setTargetAtTime(clamp(normalizedX, -1, 1) * 0.42, this.context.currentTime, 0.12);
  }

  getLevel() {
    if (!this.enabled || !this.analyser || !this.analyserData) return 0;
    this.analyser.getByteFrequencyData(this.analyserData);
    let total = 0;
    for (let index = 0; index < 42; index += 1) total += this.analyserData[index];
    return total / (42 * 255);
  }

  getElapsed() {
    if (!this.context) return 0;
    return (this.context.currentTime - this.startedAt) % SCORE_SECONDS;
  }

  handleVisibility(hidden: boolean) {
    if (!this.context || !this.master) return;
    if (hidden) {
      this.master.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.08);
      window.setTimeout(() => this.context?.suspend(), 220);
    } else if (this.enabled) {
      this.context.resume().then(() => {
        this.master?.gain.setTargetAtTime(
          Math.max(this.volume, 0.0001),
          this.context!.currentTime,
          0.08
        );
      });
    }
  }

  destroy() {
    window.clearInterval(this.scheduleTimer);
    window.clearTimeout(this.suspendTimer);
    this.textureSource?.stop();
    this.context?.close();
  }
}

function samplePortrait(image: HTMLImageElement, count: number): ParticleData {
  const sampleWidth = 180;
  const sampleHeight = 225;
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!sampleContext) throw new Error("Portrait sampling canvas is unavailable");

  sampleCanvas.width = sampleWidth;
  sampleCanvas.height = sampleHeight;
  sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;

  const cornerCoordinates = [
    [4, 4],
    [sampleWidth - 5, 4],
    [4, sampleHeight - 5],
    [sampleWidth - 5, sampleHeight - 5]
  ];
  const background = cornerCoordinates.reduce(
    (accumulator, [x, y]) => {
      const pixelIndex = (y * sampleWidth + x) * 4;
      return [
        accumulator[0] + pixels[pixelIndex] / cornerCoordinates.length,
        accumulator[1] + pixels[pixelIndex + 1] / cornerCoordinates.length,
        accumulator[2] + pixels[pixelIndex + 2] / cornerCoordinates.length
      ];
    },
    [0, 0, 0]
  );

  const candidates: Array<{
    x: number;
    y: number;
    z: number;
    red: number;
    green: number;
    blue: number;
    luma: number;
  }> = [];

  for (let y = 2; y < sampleHeight - 2; y += 2) {
    for (let x = 2; x < sampleWidth - 2; x += 2) {
      const pixelIndex = (y * sampleWidth + x) * 4;
      const red = pixels[pixelIndex];
      const green = pixels[pixelIndex + 1];
      const blue = pixels[pixelIndex + 2];
      const alpha = pixels[pixelIndex + 3] / 255;
      const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      const backgroundDistance = Math.hypot(
        red - background[0],
        green - background[1],
        blue - background[2]
      );

      const normalizedX = x / (sampleWidth - 1);
      const normalizedY = y / (sampleHeight - 1);
      const headEllipse =
        Math.pow((normalizedX - 0.5) / 0.33, 2) +
          Math.pow((normalizedY - 0.36) / 0.37, 2) <
        1;
      const shoulders =
        normalizedY > 0.58 &&
        Math.abs(normalizedX - 0.5) < 0.5 - Math.max(0, normalizedY - 0.9) * 0.7;
      const isSubject = backgroundDistance > 27 && (headEllipse || shoulders);
      if (alpha < 0.5 || !isSubject) continue;

      candidates.push({
        x: (normalizedX - 0.5) * 3.82,
        y: (0.53 - normalizedY) * 4.95,
        z: (0.5 - luma / 255) * 0.58,
        red,
        green,
        blue,
        luma
      });
    }
  }

  if (!candidates.length) throw new Error("Portrait sampling produced no points");
  const random = seededRandom(20260726);
  const portrait = new Float32Array(count * 3);
  const corridor = new Float32Array(count * 3);
  const evidence = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const candidate = candidates[Math.floor((index / count) * candidates.length) % candidates.length];
    const pointIndex = index * 3;
    const jitter = index >= candidates.length ? 0.025 : 0.008;
    portrait[pointIndex] = candidate.x + (random() - 0.5) * jitter;
    portrait[pointIndex + 1] = candidate.y + (random() - 0.5) * jitter;
    portrait[pointIndex + 2] = candidate.z + (random() - 0.5) * 0.05;

    const corridorProgress = index / Math.max(1, count - 1);
    const corridorAngle = corridorProgress * Math.PI * 19 + random() * 0.65;
    const corridorRadius = 0.28 + Math.pow(random(), 0.55) * 2.15;
    corridor[pointIndex] = Math.cos(corridorAngle) * corridorRadius;
    corridor[pointIndex + 1] = Math.sin(corridorAngle) * corridorRadius * 0.78;
    corridor[pointIndex + 2] = -3.2 + corridorProgress * 6.4;

    const routeSegments = [
      [-2.05, 0.72, -1.28, 0.72],
      [-1.28, 0.72, -0.64, 0.12],
      [-0.64, 0.12, 0.08, 0.12],
      [0.08, 0.12, 0.63, -0.62],
      [0.63, -0.62, 1.98, -0.62],
      [-0.64, 0.12, -0.64, -0.92],
      [-0.64, -0.92, -1.42, -0.92],
      [0.63, -0.62, 0.63, 0.92],
      [0.63, 0.92, 1.42, 0.92]
    ] as const;
    const routeNodes = [
      [-2.05, 0.72],
      [-0.64, 0.12],
      [-1.42, -0.92],
      [0.63, -0.62],
      [1.42, 0.92],
      [1.98, -0.62]
    ] as const;
    const selector = random();
    if (selector < 0.76) {
      const segment = routeSegments[Math.floor(random() * routeSegments.length)];
      const segmentProgress = random();
      const thickness = (random() - 0.5) * 0.074;
      evidence[pointIndex] = segment[0] + (segment[2] - segment[0]) * segmentProgress;
      evidence[pointIndex + 1] =
        segment[1] + (segment[3] - segment[1]) * segmentProgress + thickness;
    } else {
      const node = routeNodes[Math.floor(random() * routeNodes.length)];
      const angle = random() * Math.PI * 2;
      const radius = 0.105 + (random() - 0.5) * 0.036;
      evidence[pointIndex] = node[0] + Math.cos(angle) * radius;
      evidence[pointIndex + 1] = node[1] + Math.sin(angle) * radius;
    }
    evidence[pointIndex + 2] = (random() - 0.5) * 0.2;

    const isSkin =
      candidate.red > candidate.green * 1.08 &&
      candidate.red > candidate.blue * 1.18 &&
      candidate.luma > 72;
    const isDeep = candidate.luma < 68;
    const color = isSkin
      ? [0.89, 0.62, 0.38]
      : isDeep
        ? [0.48, 0.64, 0.55]
        : [0.89, 0.88, 0.8];
    const brightness = 0.78 + clamp(candidate.luma / 255, 0, 1) * 0.24;
    colors[pointIndex] = color[0] * brightness;
    colors[pointIndex + 1] = color[1] * brightness;
    colors[pointIndex + 2] = color[2] * brightness;
    sizes[index] = 2.15 + random() * 2.65 + (isSkin ? 0.4 : 0);
    seeds[index] = random();
  }

  return { portrait, corridor, evidence, colors, sizes, seeds };
}

class SignalBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function LivingSignal({ portraitUrl }: LivingSignalProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<LivingScore | null>(null);
  const currentSceneRef = useRef(0);
  const [mode, setMode] = useState<VisualMode>("loading");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(58);
  const [elapsed, setElapsed] = useState(0);
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    const supportsWebGL = (() => {
      try {
        const probe = document.createElement("canvas");
        return Boolean(window.WebGL2RenderingContext && probe.getContext("webgl2"));
      } catch {
        return false;
      }
    })();

    if (reduceMotion.matches || saveData || !supportsWebGL) {
      setMode("static");
      return;
    }

    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let points: THREE.Points | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let displayedProgress = 0;
    let targetProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let lastScene = -1;
    let lastTimeUpdate = 0;

    const initialize = async () => {
      try {
        const image = new Image();
        image.decoding = "async";
        image.src = portraitUrl;
        await image.decode();
        if (disposed) return;

        const pointCount = window.innerWidth <= 640 ? 2300 : window.innerWidth <= 980 ? 3400 : 5200;
        const particleData = samplePortrait(image, pointCount);
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance"
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x061b16, 0);

        const scene3d = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
        camera.position.set(0, 0, 7.2);
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(particleData.portrait, 3));
        geometry.setAttribute("aCorridor", new THREE.BufferAttribute(particleData.corridor, 3));
        geometry.setAttribute("aEvidence", new THREE.BufferAttribute(particleData.evidence, 3));
        geometry.setAttribute("aColor", new THREE.BufferAttribute(particleData.colors, 3));
        geometry.setAttribute("aSize", new THREE.BufferAttribute(particleData.sizes, 1));
        geometry.setAttribute("aSeed", new THREE.BufferAttribute(particleData.seeds, 1));

        material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
          uniforms: {
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uAudio: { value: 0 },
            uDpr: { value: Math.min(window.devicePixelRatio || 1, 1.55) },
            uPointer: { value: new THREE.Vector2(0, 0) }
          }
        });
        points = new THREE.Points(geometry, material);
        scene3d.add(points);

        const updateSize = () => {
          if (!renderer || !points) return;
          const width = host.clientWidth;
          const height = host.clientHeight;
          const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 680 ? 1.25 : 1.55);
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(1, height);
          camera.updateProjectionMatrix();
          material!.uniforms.uDpr.value = pixelRatio;
          points.position.x = width <= 700 ? 0.48 : width <= 1050 ? 1.3 : 2.05;
          points.position.y = width <= 700 ? -0.68 : -0.02;
          points.scale.setScalar(width <= 700 ? 0.68 : width <= 1050 ? 0.82 : 1);
        };

        const handlePointer = (event: PointerEvent) => {
          const bounds = host.getBoundingClientRect();
          pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          pointerY = -((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
          scoreRef.current?.setPan(pointerX);
        };

        const clearPointer = () => {
          pointerX = 0;
          pointerY = 0;
          scoreRef.current?.setPan(0);
        };

        const handleContextLoss = (event: Event) => {
          event.preventDefault();
          setMode("static");
        };

        resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(host);
        host.addEventListener("pointermove", handlePointer, { passive: true });
        host.addEventListener("pointerleave", clearPointer);
        canvas.addEventListener("webglcontextlost", handleContextLoss, { once: true });
        updateSize();

        const render = (time: number) => {
          if (disposed || !renderer || !material || !points) return;
          const journey = document.querySelector<HTMLElement>("[data-signal-journey]");
          if (journey) {
            const bounds = journey.getBoundingClientRect();
            const travel = Math.max(1, bounds.height - window.innerHeight);
            const rawProgress = clamp(-bounds.top / travel, 0, 1);
            targetProgress = rawProgress * 2;
            const nextScene = rawProgress < 0.29 ? 0 : rawProgress < 0.68 ? 1 : 2;
            if (nextScene !== lastScene) {
              lastScene = nextScene;
              currentSceneRef.current = nextScene;
              setScene(nextScene);
              scoreRef.current?.setScene(nextScene);
              window.dispatchEvent(
                new CustomEvent("living-signal:state", {
                  detail: { scene: nextScene, progress: rawProgress }
                })
              );
            }
            document.documentElement.style.setProperty("--signal-progress", rawProgress.toFixed(4));
          }

          displayedProgress = THREE.MathUtils.lerp(displayedProgress, targetProgress, 0.055);
          const pointerUniform = material.uniforms.uPointer.value as THREE.Vector2;
          pointerUniform.x = THREE.MathUtils.lerp(pointerUniform.x, pointerX, 0.07);
          pointerUniform.y = THREE.MathUtils.lerp(pointerUniform.y, pointerY, 0.07);
          material.uniforms.uTime.value = time * 0.001;
          material.uniforms.uProgress.value = displayedProgress;
          material.uniforms.uAudio.value = THREE.MathUtils.lerp(
            material.uniforms.uAudio.value,
            scoreRef.current?.getLevel() ?? 0,
            0.18
          );
          points.rotation.y = pointerUniform.x * 0.035;
          points.rotation.x = -pointerUniform.y * 0.025;
          renderer.render(scene3d, camera);

          if (time - lastTimeUpdate > 250 && scoreRef.current?.enabled) {
            lastTimeUpdate = time;
            setElapsed(scoreRef.current.getElapsed());
          }
          frame = window.requestAnimationFrame(render);
        };

        setMode("webgl");
        frame = window.requestAnimationFrame(render);

        return () => {
          host.removeEventListener("pointermove", handlePointer);
          host.removeEventListener("pointerleave", clearPointer);
          canvas.removeEventListener("webglcontextlost", handleContextLoss);
        };
      } catch (error) {
        console.warn("Living Signal entered its static fallback.", error);
        setMode("static");
      }
    };

    let detachEvents: (() => void) | undefined;
    initialize().then((detach) => {
      detachEvents = detach;
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      detachEvents?.();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      document.documentElement.style.removeProperty("--signal-progress");
    };
  }, [portraitUrl]);

  useEffect(() => {
    const handleVisibility = () => scoreRef.current?.handleVisibility(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(
    () => () => {
      scoreRef.current?.destroy();
    },
    []
  );

  const toggleSound = async () => {
    scoreRef.current ??= new LivingScore();
    scoreRef.current.setVolume(volume / 100);

    if (soundEnabled) {
      scoreRef.current.disable();
      setSoundEnabled(false);
      return;
    }

    try {
      scoreRef.current.setScene(currentSceneRef.current);
      await scoreRef.current.enable();
      setSoundEnabled(true);
    } catch {
      setSoundEnabled(false);
    }
  };

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    scoreRef.current?.setVolume(nextVolume / 100);
  };

  const fallback = (
    <figure className="signal-fallback" aria-hidden="true">
      <img src={portraitUrl} alt="" />
      <span className="signal-fallback__field" />
    </figure>
  );

  return (
    <SignalBoundary fallback={fallback}>
      <div
        className={`signal-engine is-${mode}`}
        ref={hostRef}
        data-signal-engine
        data-scene={scene}
      >
        {fallback}
        <canvas ref={canvasRef} aria-hidden="true" />

        <div className="signal-receiver" data-enabled={soundEnabled ? "" : undefined}>
          <button
            className="receiver-toggle"
            type="button"
            aria-pressed={soundEnabled}
            onClick={toggleSound}
          >
            <span className="receiver-icon" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
            </span>
            <span>
              <b>{soundEnabled ? "Sound on" : "Enter with sound"}</b>
              <small>Original adaptive score</small>
            </span>
          </button>

          <div className="receiver-timeline" aria-hidden="true">
            <span>{formatTime(elapsed)}</span>
            <i><b style={{ width: `${(elapsed / SCORE_SECONDS) * 100}%` }} /></i>
            <span>{formatTime(SCORE_SECONDS)}</span>
          </div>

          <label className="receiver-volume">
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={changeVolume}
              aria-label="Sound volume"
            />
          </label>
        </div>

        <p className="sr-only">
          An interactive particle portrait of Gary Virk changes into a three-dimensional
          dependency corridor and then resolves into an evidence route as the page scrolls.
          Sound is optional.
        </p>
      </div>
    </SignalBoundary>
  );
}
