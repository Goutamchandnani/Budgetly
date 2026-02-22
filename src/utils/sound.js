// Simple synth for UI sounds using Web Audio API
// No external assets required = faster load times

export const playSuccesSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const t = ctx.currentTime;

        // Pleasing "Level Up" / "Success" Major Chord Arpeggio (C Major 7)
        // Notes: C5, E5, G5, B5, C6
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Slight delay between notes for arpeggio effect
            const startTime = t + (i * 0.05);

            osc.frequency.setValueAtTime(freq, startTime);
            osc.type = 'sine'; // Sine is soft and pleasing

            // Smooth envelope
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6); // Long decay

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.6);
        });

    } catch (e) {
        console.error("Audio play failed", e);
    }
};

export const playHoverSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Subtle transparent click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
        // Ignore audio errors
    }
};
