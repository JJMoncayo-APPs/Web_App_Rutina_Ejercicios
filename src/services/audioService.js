// src/services/audioService.js

let audioContext = null

const getAudioContext = () => {
  if (audioContext) {
    return audioContext
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  audioContext = new AudioContextClass()

  return audioContext
}

export const unlockAudio = async () => {
  const context = getAudioContext()

  if (!context) {
    return false
  }

  if (context.state === 'suspended') {
    await context.resume()
  }

  return context.state === 'running'
}

const playTone = ({
  frequency,
  duration,
  volume = 0.22,
  type = 'sine',
}) => {
  const context = getAudioContext()

  if (!context) {
    return
  }

  const oscillator = context.createOscillator()
  const gainNode = context.createGain()

  const startTime = context.currentTime
  const endTime = startTime + duration

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(0.0001, startTime)
  gainNode.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.015
  )
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime
  )

  oscillator.connect(gainNode)
  gainNode.connect(context.destination)

  oscillator.start(startTime)
  oscillator.stop(endTime + 0.02)
}

export const playPreparationBeep = () => {
  playTone({
    frequency: 880,
    duration: 0.16,
    volume: 0.2,
    type: 'sine',
  })
}

export const playStartBeep = () => {
  playTone({
    frequency: 1175,
    duration: 0.75,
    volume: 0.28,
    type: 'sine',
  })

  if ('vibrate' in navigator) {
    navigator.vibrate([120, 70, 260])
  }
}

export const playFinishBeep = () => {
  playTone({
    frequency: 740,
    duration: 0.18,
    volume: 0.2,
    type: 'sine',
  })

  window.setTimeout(() => {
    playTone({
      frequency: 988,
      duration: 0.45,
      volume: 0.26,
      type: 'sine',
    })
  }, 210)

  if ('vibrate' in navigator) {
    navigator.vibrate([180, 90, 300])
  }
}