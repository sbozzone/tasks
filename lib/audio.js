/* ================================================================
   AUDIO HELPERS — Web Audio API sound effects for Bozzone Tasks.

   Loaded by both index.html and myday.html.  All audio is generated
   programmatically via the Web Audio API (no external sound files),
   so the app works fully offline.

   A single AudioContext is reused across calls (creating one per
   sound would exhaust the browser limit of ~6 contexts per page).
   The context is lazily initialised on the first user gesture that
   triggers a sound, which satisfies the browser autoplay policy.
   ================================================================ */

/** @type {AudioContext|null} Singleton audio context, created on demand */
var _audioCtx = null;

/**
 * Return the shared AudioContext, creating it if needed.
 * Also resumes a suspended context (iOS suspends on page load).
 * @returns {AudioContext|null} null when Web Audio is unavailable
 */
function getAudioCtx() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  /* iOS requires an explicit resume() after the first user gesture */
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

/**
 * Play a two-note ascending chime (C5 → E5) to celebrate task completion.
 * Used by both pages when a task is marked done.
 */
function playDoneChime() {
  var ctx = getAudioCtx();
  if (!ctx) return;
  /* C5 (523 Hz) followed by E5 (659 Hz) with a short overlap */
  var notes = [523.25, 659.25];
  notes.forEach(function(freq, i) {
    var osc  = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    var t = ctx.currentTime + i * 0.18; /* stagger notes by 180 ms */
    gain.gain.setValueAtTime(0,    t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.start(t);
    osc.stop(t + 0.56);
  });
}

/**
 * Alias used by index.html's cycleStatus() which calls
 * playCompletionSound() when a task transitions to 'done'.
 * Points to the same implementation as playDoneChime().
 */
var playCompletionSound = playDoneChime;

/**
 * Play a short descending sweep to confirm removal from My Day.
 * Used by myday.html when the user swipes a task left.
 */
function playRemoveSound() {
  var ctx = getAudioCtx();
  if (!ctx) return;
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  /* Frequency sweeps down from A4 (440 Hz) to A3 (220 Hz) */
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.22);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.26);
}
