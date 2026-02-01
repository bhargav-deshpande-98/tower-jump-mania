// Web Audio API sound effects — Icy Tower / bouncy platformer theme

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available, silently fail
  }
}

// Normal jump — springy boing
export function playJumpSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(280, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // Audio not available
  }
}

// Super jump — powerful whoosh upward
export function playSuperJumpSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    // Low power burst
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'square'
    osc1.frequency.setValueAtTime(150, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12)
    gain1.gain.setValueAtTime(0.1, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.14)

    // High ascending whistle
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(400, ctx.currentTime + 0.03)
    osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.01, ctx.currentTime)
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.03)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 0.18)
  } catch {
    // Audio not available
  }
}

// Land on platform — soft thud tap
export function playLandSound() {
  playTone(180, 0.04, 'triangle', 0.08)
  setTimeout(() => playTone(120, 0.03, 'sine', 0.05), 15)
}

// Score — quick ping
export function playScoreSound() {
  playTone(800, 0.05, 'sine', 0.1)
  setTimeout(() => playTone(1000, 0.04, 'sine', 0.07), 25)
}

// Combo start — ascending power chord
export function playComboSound(combo: number) {
  const baseFreq = Math.min(600 + combo * 80, 1400)
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    // Rising tone that gets higher with combo count
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)

    // Sparkle overtone
    setTimeout(() => {
      playTone(baseFreq * 2, 0.03, 'sine', 0.05)
    }, 30)
  } catch {
    // Audio not available
  }
}

// Game over — descending tumble with impact
export function playGameOverSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    // Falling whistle
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(800, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.35)

    // Impact thud
    setTimeout(() => {
      playTone(60, 0.15, 'square', 0.18)
      playTone(90, 0.1, 'sawtooth', 0.1)
    }, 200)

    // Sad trombone notes
    setTimeout(() => {
      playTone(350, 0.12, 'triangle', 0.08)
    }, 400)
    setTimeout(() => {
      playTone(300, 0.12, 'triangle', 0.07)
    }, 520)
    setTimeout(() => {
      playTone(250, 0.18, 'triangle', 0.06)
    }, 640)
  } catch {
    // Audio not available
  }
}

// Resume audio context on user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch {
    // Audio not available
  }
}
