// ═══════════════════════════════════════════
// Procedural Ambient Audio Engine
// Uses Web Audio API to generate atmospheric sounds
// No external audio files needed — everything is synthesized
// ═══════════════════════════════════════════

type SoundProfile =
  | 'fire-crackle'    // Crackling fire, burning embers
  | 'lava-bubble'     // Deep bubbling, magma flow
  | 'wind'            // Whistling wind, drafts
  | 'rumble'          // Deep volcanic rumble, mountain groaning
  | 'metal-work'      // Hammering, forge clanging
  | 'chant'           // Low droning chant, spiritual hum
  | 'footsteps'       // Heavy periodic thuds
  | 'drip'            // Water dripping, condensation
  | 'crowd'           // Distant murmuring crowd
  | 'tension-drone'   // Eerie sustained drone
  | 'combat-drums'    // Rhythmic war percussion
  | 'stone-crumble'   // Settling stone, crumbling
  | 'wire-hum'        // Faint metallic resonance

interface ActiveSound {
  nodes: AudioNode[];
  gainNode: GainNode;
  profile: SoundProfile;
}

// ── Keyword → Sound Profile mapping ──
// Order matters: more specific matches first, generic last
const KEYWORD_MAP: [string[], SoundProfile][] = [
  [['combat', 'battle', 'clash', 'fight', 'ambush', 'drum', 'war', 'attack'], 'combat-drums'],
  [['tension', 'eerie', 'held breath', 'suspense', 'careful', 'stealth', 'silent'], 'tension-drone'],
  [['chant', 'spiritual', 'prayer', 'meditat', 'sacred', 'ritual'], 'chant'],
  [['hammer', 'forge', 'metal', 'anvil', 'clang', 'iron'], 'metal-work'],
  [['crowd', 'roar', 'cheer', 'murmur', 'spectator', 'arena'], 'crowd'],
  [['fire', 'crackl', 'burn', 'ember', 'torch', 'blaze', 'flame'], 'fire-crackle'],
  [['lava', 'magma', 'bubble', 'molten', 'flow'], 'lava-bubble'],
  [['footstep', 'march', 'stomp', 'patrol', 'walking'], 'footsteps'],
  [['drip', 'water', 'condensat', 'drizzle'], 'drip'],
  [['wind', 'draft', 'sulfur', 'breeze', 'stairwell'], 'wind'],
  [['wire', 'hum', 'reson', 'vibrat'], 'wire-hum'],
  [['stone', 'crumbl', 'settl', 'rock'], 'stone-crumble'],
  [['rumbl', 'groan', 'mountain', 'volcanic', 'quake', 'tremor', 'deep', 'echo'], 'rumble'],
];

export function detectSoundProfile(trackName: string, trackDescription: string): SoundProfile {
  const text = `${trackName} ${trackDescription}`.toLowerCase();
  for (const [keywords, profile] of KEYWORD_MAP) {
    if (keywords.some(kw => text.includes(kw))) {
      return profile;
    }
  }
  return 'rumble'; // default fallback
}

// ═══════════════════════════════════════════
// Audio Engine Class
// ═══════════════════════════════════════════

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private masterVolume = 0.5;
  private analyser: AnalyserNode | null = null;

  private async ensureContext(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  // Synchronous accessor for already-initialized context (used by non-play methods)
  private getContext(): AudioContext {
    if (!this.ctx) throw new Error('AudioContext not initialized — call play() first');
    return this.ctx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx!.currentTime, 0.05);
    }
  }

  setTrackVolume(trackId: string, vol: number) {
    const sound = this.activeSounds.get(trackId);
    if (sound) {
      sound.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx!.currentTime, 0.05);
    }
  }

  getTrackVolume(trackId: string): number {
    const sound = this.activeSounds.get(trackId);
    return sound ? sound.gainNode.gain.value : 0.5;
  }

  isPlaying(trackId: string): boolean {
    return this.activeSounds.has(trackId);
  }

  getActiveCount(): number {
    return this.activeSounds.size;
  }

  // ── Start a sound ──
  async play(trackId: string, profile: SoundProfile, volume = 0.5) {
    if (this.activeSounds.has(trackId)) return; // already playing

    const ctx = await this.ensureContext();
    const trackGain = ctx.createGain();
    trackGain.gain.value = volume;
    trackGain.connect(this.masterGain!);

    const nodes = this.createSound(ctx, profile, trackGain);
    this.activeSounds.set(trackId, { nodes, gainNode: trackGain, profile });
  }

  // ── Stop a sound ──
  stop(trackId: string) {
    const sound = this.activeSounds.get(trackId);
    if (!sound) return;

    // Fade out over 500ms
    const now = this.ctx!.currentTime;
    sound.gainNode.gain.setTargetAtTime(0, now, 0.15);

    // Clean up after fade
    setTimeout(() => {
      sound.nodes.forEach(node => {
        try {
          if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
            node.stop();
          }
          node.disconnect();
        } catch { /* already stopped */ }
      });
      sound.gainNode.disconnect();
      this.activeSounds.delete(trackId);
    }, 600);
  }

  // ── Stop all ──
  stopAll() {
    for (const trackId of this.activeSounds.keys()) {
      this.stop(trackId);
    }
  }

  // ── Dispose ──
  dispose() {
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
  }

  // ═══════════════════════════════════════════
  // Sound Generators
  // ═══════════════════════════════════════════

  private createSound(ctx: AudioContext, profile: SoundProfile, output: AudioNode): AudioNode[] {
    switch (profile) {
      case 'fire-crackle': return this.createFireCrackle(ctx, output);
      case 'lava-bubble': return this.createLavaBubble(ctx, output);
      case 'wind': return this.createWind(ctx, output);
      case 'rumble': return this.createRumble(ctx, output);
      case 'metal-work': return this.createMetalWork(ctx, output);
      case 'chant': return this.createChant(ctx, output);
      case 'footsteps': return this.createFootsteps(ctx, output);
      case 'drip': return this.createDrip(ctx, output);
      case 'crowd': return this.createCrowd(ctx, output);
      case 'tension-drone': return this.createTensionDrone(ctx, output);
      case 'combat-drums': return this.createCombatDrums(ctx, output);
      case 'stone-crumble': return this.createStoneCrumble(ctx, output);
      case 'wire-hum': return this.createWireHum(ctx, output);
      default: return this.createRumble(ctx, output);
    }
  }

  // ── Noise buffer utility ──
  private createNoiseBuffer(ctx: AudioContext, type: 'white' | 'brown' | 'pink', duration = 4): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5; // boost
      }
    } else { // pink
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private createLoopingNoise(ctx: AudioContext, type: 'white' | 'brown' | 'pink'): AudioBufferSourceNode {
    const buffer = this.createNoiseBuffer(ctx, type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }

  // ── Fire Crackle: Filtered white noise + random gain spikes ──
  private createFireCrackle(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const noise = this.createLoopingNoise(ctx, 'white');
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;

    // Crackle modulation via scriptProcessor alternative (gain scheduling)
    const cracklGain = ctx.createGain();
    cracklGain.gain.value = 0.3;

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(cracklGain);
    cracklGain.connect(output);

    // Schedule random crackle bursts
    const scheduleCrackles = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const time = now + Math.random() * 2;
        const intensity = 0.2 + Math.random() * 0.6;
        cracklGain.gain.setValueAtTime(intensity, time);
        cracklGain.gain.setTargetAtTime(0.15, time + 0.02, 0.05);
      }
      setTimeout(scheduleCrackles, 2000);
    };
    scheduleCrackles();

    return [noise, bandpass, highpass, cracklGain];
  }

  // ── Lava Bubble: Low brown noise + periodic low impulses ──
  private createLavaBubble(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const noise = this.createLoopingNoise(ctx, 'brown');
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 120;
    lowpass.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.value = 0.6;

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(output);

    // Bubble pops — periodic low oscillator bursts
    const scheduleBubbles = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const time = now + Math.random() * 3;
        const osc = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 40 + Math.random() * 30;
        bubbleGain.gain.setValueAtTime(0, time);
        bubbleGain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.3, time + 0.05);
        bubbleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2 + Math.random() * 0.3);
        osc.connect(bubbleGain);
        bubbleGain.connect(output);
        osc.start(time);
        osc.stop(time + 0.6);
      }
      setTimeout(scheduleBubbles, 3000);
    };
    scheduleBubbles();

    return [noise, lowpass, gain];
  }

  // ── Wind: Filtered noise with slow modulation ──
  private createWind(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const noise = this.createLoopingNoise(ctx, 'pink');
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 400;
    bandpass.Q.value = 0.3;

    // LFO to modulate filter frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(output);

    return [noise, bandpass, lfo, lfoGain, gain];
  }

  // ── Rumble: Very low brown noise ──
  private createRumble(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const noise = this.createLoopingNoise(ctx, 'brown');
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 80;
    lowpass.Q.value = 1;

    // Slow volume modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);

    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    lfoGain.connect(gain.gain);
    lfo.start();

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(output);

    return [noise, lowpass, lfo, lfoGain, gain];
  }

  // ── Metal Work: Periodic resonant strikes ──
  private createMetalWork(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.4;
    gain.connect(output);

    // Background low hum
    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 55;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.05;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 200;
    hum.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(gain);
    hum.start();

    // Periodic hammer strikes
    const scheduleStrikes = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const numStrikes = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numStrikes; i++) {
        const time = now + 0.6 * i + Math.random() * 0.1;
        // Metallic impact: short sine burst through resonant filter
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 180 + Math.random() * 120;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800 + Math.random() * 600;
        filter.Q.value = 8;
        const strikeGain = ctx.createGain();
        strikeGain.gain.setValueAtTime(0, time);
        strikeGain.gain.linearRampToValueAtTime(0.5, time + 0.005);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(filter);
        filter.connect(strikeGain);
        strikeGain.connect(gain);
        osc.start(time);
        osc.stop(time + 0.2);
      }
      // Random gap between strike groups (1.5–4 seconds)
      setTimeout(scheduleStrikes, 1500 + Math.random() * 2500);
    };
    scheduleStrikes();

    return [hum, humFilter, humGain, gain];
  }

  // ── Chant: Layered low drones ──
  private createChant(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    gain.connect(output);

    const nodes: AudioNode[] = [gain];
    const fundamentals = [82, 110, 165]; // low tones

    for (const freq of fundamentals) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow tremolo
      const tremolo = ctx.createOscillator();
      tremolo.type = 'sine';
      tremolo.frequency.value = 0.2 + Math.random() * 0.3;
      const tremoloGain = ctx.createGain();
      tremoloGain.gain.value = 0.1;
      tremolo.connect(tremoloGain);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.15;
      tremoloGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      tremolo.start();

      nodes.push(osc, tremolo, tremoloGain, oscGain);
    }

    return nodes;
  }

  // ── Footsteps: Periodic low thuds ──
  private createFootsteps(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    gain.connect(output);

    const scheduleSteps = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      // 2-4 steps then pause
      const steps = 2 + Math.floor(Math.random() * 3);
      const interval = 0.8 + Math.random() * 0.4; // step interval
      for (let i = 0; i < steps; i++) {
        const time = now + interval * i;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 35 + Math.random() * 15;
        const noise = this.createNoiseBuffer(ctx, 'brown', 0.2);
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noise;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(0.3, time + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        const stepGain = ctx.createGain();
        stepGain.gain.setValueAtTime(0, time);
        stepGain.gain.linearRampToValueAtTime(0.4, time + 0.01);
        stepGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(stepGain);
        noiseSrc.connect(noiseGain);
        stepGain.connect(gain);
        noiseGain.connect(gain);
        osc.start(time);
        osc.stop(time + 0.3);
        noiseSrc.start(time);
        noiseSrc.stop(time + 0.2);
      }
      setTimeout(scheduleSteps, (steps * interval + 2 + Math.random() * 4) * 1000);
    };
    scheduleSteps();

    return [gain];
  }

  // ── Drip: Random high-pitched plinks ──
  private createDrip(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.4;
    gain.connect(output);

    const scheduleDrips = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const numDrips = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numDrips; i++) {
        const time = now + Math.random() * 2;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const baseFreq = 800 + Math.random() * 1200;
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, time + 0.08);
        const dripGain = ctx.createGain();
        dripGain.gain.setValueAtTime(0, time);
        dripGain.gain.linearRampToValueAtTime(0.2, time + 0.003);
        dripGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.connect(dripGain);
        dripGain.connect(gain);
        osc.start(time);
        osc.stop(time + 0.15);
      }
      setTimeout(scheduleDrips, 1500 + Math.random() * 3000);
    };
    scheduleDrips();

    return [gain];
  }

  // ── Crowd: Layered modulated noise ──
  private createCrowd(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const noise = this.createLoopingNoise(ctx, 'pink');
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 0.8;

    // Vocal range modulation
    const lfo1 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.value = 0.5;
    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.value = 200;
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(bandpass.frequency);
    lfo1.start();

    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.8;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 100;
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(bandpass.frequency);
    lfo2.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(output);

    return [noise, bandpass, lfo1, lfo1Gain, lfo2, lfo2Gain, gain];
  }

  // ── Tension Drone: Eerie sustained tones ──
  private createTensionDrone(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    gain.connect(output);

    const nodes: AudioNode[] = [gain];
    // Dissonant interval
    const freqs = [110, 116.5, 164.8]; // A2, Bb2, E3 — uneasy

    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.12;

      // Very slow vibrato
      const vib = ctx.createOscillator();
      vib.type = 'sine';
      vib.frequency.value = 0.1 + Math.random() * 0.15;
      const vibGain = ctx.createGain();
      vibGain.gain.value = 2;
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start();

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();

      nodes.push(osc, oscGain, vib, vibGain);
    }

    // Add some filtered noise for texture
    const noise = this.createLoopingNoise(ctx, 'pink');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(gain);
    nodes.push(noise, filter, noiseGain);

    return nodes;
  }

  // ── Combat Drums: Rhythmic low percussion ──
  private createCombatDrums(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.4;
    gain.connect(output);

    const bpm = 100 + Math.floor(Math.random() * 20);
    const beatInterval = 60 / bpm;

    let beat = 0;
    const scheduleBeats = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      // 4-beat pattern
      for (let i = 0; i < 4; i++) {
        const time = now + beatInterval * i;
        const isStrong = (beat + i) % 4 === 0;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isStrong ? 60 : 80, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
        const beatGain = ctx.createGain();
        const vol = isStrong ? 0.5 : 0.25;
        beatGain.gain.setValueAtTime(0, time);
        beatGain.gain.linearRampToValueAtTime(vol, time + 0.005);
        beatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(beatGain);
        beatGain.connect(gain);
        osc.start(time);
        osc.stop(time + 0.2);
      }
      beat += 4;
      setTimeout(scheduleBeats, beatInterval * 4 * 1000);
    };
    scheduleBeats();

    return [gain];
  }

  // ── Stone Crumble: Low rumble + periodic debris ──
  private createStoneCrumble(ctx: AudioContext, output: AudioNode): AudioNode[] {
    // Low ambient rumble
    const noise = this.createLoopingNoise(ctx, 'brown');
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 100;
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(output);

    // Periodic crumble events
    const scheduleCrumble = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = ctx.currentTime;
      const time = now + Math.random() * 2;
      const crumbleNoise = this.createNoiseBuffer(ctx, 'white', 0.5);
      const src = ctx.createBufferSource();
      src.buffer = crumbleNoise;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300 + Math.random() * 400;
      filter.Q.value = 1;
      const crumbleGain = ctx.createGain();
      crumbleGain.gain.setValueAtTime(0, time);
      crumbleGain.gain.linearRampToValueAtTime(0.15, time + 0.02);
      crumbleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      src.connect(filter);
      filter.connect(crumbleGain);
      crumbleGain.connect(output);
      src.start(time);
      src.stop(time + 0.5);
      setTimeout(scheduleCrumble, 3000 + Math.random() * 5000);
    };
    scheduleCrumble();

    return [noise, lowpass, gain];
  }

  // ── Wire Hum: Metallic resonance ──
  private createWireHum(ctx: AudioContext, output: AudioNode): AudioNode[] {
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(output);

    const nodes: AudioNode[] = [gain];
    // Harmonic series of a tense wire
    const fundamental = 220;
    for (let harmonic = 1; harmonic <= 4; harmonic++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamental * harmonic;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.06 / harmonic;

      // Slow beating
      const beat = ctx.createOscillator();
      beat.type = 'sine';
      beat.frequency.value = 0.5 + harmonic * 0.2;
      const beatGain = ctx.createGain();
      beatGain.gain.value = 0.03 / harmonic;
      beat.connect(beatGain);
      beatGain.connect(oscGain.gain);
      beat.start();

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();

      nodes.push(osc, oscGain, beat, beatGain);
    }

    return nodes;
  }
}

// Singleton instance
let engineInstance: AmbientAudioEngine | null = null;

export function getAudioEngine(): AmbientAudioEngine {
  if (!engineInstance) {
    engineInstance = new AmbientAudioEngine();
  }
  return engineInstance;
}
