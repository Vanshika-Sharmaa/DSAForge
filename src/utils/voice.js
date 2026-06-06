/**
 * voice.js — AI Voice Coach utility
 * Uses browser SpeechSynthesis API (no extra deps)
 */

let voiceEnabled = true
let currentUtterance = null

export function setVoiceEnabled(v) { voiceEnabled = v }
export function isVoiceEnabled()   { return voiceEnabled }

/**
 * speak(text, options)
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, volume?: number, priority?: boolean }} options
 */
export function speak(text, { rate = 1, pitch = 1, volume = 1, priority = false } = {}) {
  if (!voiceEnabled || !window.speechSynthesis) return

  if (priority) {
    window.speechSynthesis.cancel()
  }

  const utter = new SpeechSynthesisUtterance(text)
  utter.rate   = rate
  utter.pitch  = pitch
  utter.volume = volume

  // prefer a natural-sounding voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
  )
  if (preferred) utter.voice = preferred

  currentUtterance = utter
  window.speechSynthesis.speak(utter)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}

// Presets for common events
export const VoiceEvents = {
  timerWarning50  : (remaining) => speak(`Heads up! Half your time is gone. ${remaining} seconds left. Stay focused.`, { rate: 1.05 }),
  timerWarning80  : (remaining) => speak(`Time is running out! Only ${remaining} seconds remaining. Speed up!`, { rate: 1.1, pitch: 1.1, priority: true }),
  timerExpired    : ()          => speak('Time is up! Let\'s review what you have so far.', { rate: 1, priority: true }),
  mistake         : (msg)       => speak(`Mistake detected. ${msg || 'Check your logic and try again.'}`, { rate: 0.95, pitch: 0.9 }),
  hint            : (level, txt)=> speak(`Hint level ${level}: ${txt}`, { rate: 0.9, pitch: 1.05 }),
  solved          : (timeSec)   => speak(`Excellent work! You solved it in ${timeSec} seconds. Great job!`, { rate: 1, pitch: 1.1, priority: true }),
  thinkMode       : ()          => speak('Think mode active. Take a moment to plan your approach before coding.', { rate: 0.9 }),
  thinkModeUnlock : ()          => speak('Think time complete. The editor is now unlocked. Start coding!', { rate: 1, priority: true }),
  idle            : ()          => speak('You seem idle. Remember, consistent practice beats long sessions. Try taking the next step.', { rate: 0.95 }),
  tooManyRuns     : ()          => speak('You have run the code many times without changes. Think about the logic first.', { rate: 0.95 }),
  missionStart    : (name)      => speak(`New mission: ${name}. Good luck!`, { rate: 1.05 }),
  bossMode        : ()          => speak('Boss mode activated! Complete all challenges to win.', { rate: 1.1, pitch: 1.1, priority: true }),
}