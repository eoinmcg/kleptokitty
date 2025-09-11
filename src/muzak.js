const JAZZ_CONFIG = {
    swingRatio: 0.67, // Swing feel
    tempoRange: [3, 4.5], // Slower jazz tempo
    chordProgression: [
        [0, 3, 7, 10], // minor 7th
        [5, 8, 12, 15], // dominant 7th
        // [0, 4, 7, 11], // major 7th
        [2, 5, 9, 12], // minor 7th
    ],
    jazzScales: {
        dorian: [0, 2, 3, 5, 7, 9, 10],
        bebop: [0, 2, 4, 5, 7, 9, 10, 11],
    },
};

const instrumentParams = [
    [0.5, 0, 55, 0.02, 0.6, 0.4, , 0.7], // 0 jazz bass (warmer)
    [15, 0, 120, 0.005, , 0.01, , 0.95, -30, 40], // 1 soft kick
    [0.6, 0, 300, , , 0.15, 2, 1.2, -3, , , , , 3.5], // 2 brush snare
    [0.5, 0, 200, , 0.4, 0.8, 1, 0.3, , , , , , , , 0.08], // 3 muted trumpet
    [1.5, , 250, , , 0.3, 1, 0.2, , 0.8, , , , 1.8], // 4 ride cymbal
    [.5, 0, 150, , 0.3, 0.9, 3, 0.5, , , , , , , , 0.1], // 5 piano comping
];

class JazzMusicGenerator {
    constructor() {
        this.patterns = [[]];
        this.instrumentList = [];
        this.songLength = 0;
        this.lastBeat = -1;
        this.startTime = 0;
        this.tempo = 8;
        this.currentScale = JAZZ_CONFIG.jazzScales.bebop;
    }

    // Optimized RNG-based note selection
    getJazzNote(rng, baseNote, lastNote = null) {
        const scale = this.currentScale;
        let noteIndex = rng.int(scale.length);
        
        // Jazz tendency: avoid large jumps, prefer stepwise motion
        if (lastNote != null && rng.float() < 0.7) {
            const lastIndex = scale.indexOf((lastNote - baseNote) % 12);
            if (lastIndex !== -1) {
                const direction = rng.float() < 0.5 ? -1 : 1;
                noteIndex = Math.max(0, Math.min(scale.length - 1, lastIndex + direction));
            }
        }
        
        return baseNote + scale[noteIndex];
    }

    // Optimized swing rhythm generator
    createSwingRhythm(rng, length = 8) {
        return Array.from({
            length
        }, (_, i) => {
            const probability = i % 2 ? 0.8 : 0.4;
            return rng.float() < probability ? 1 : 0;
        });
    }

    // Streamlined chord progression
    generateChordProgression(rng) {
        const chords = JAZZ_CONFIG.chordProgression;
        
        // Classic jazz progression patterns
        const patterns = [
            [0, 1, 2, 1], // ii-V-I-V
            [0, 2, 1, 0], // ii-I-V-ii
            [2, 1, 0, 1], // I-V-ii-V
        ];
        
        const pattern = patterns[rng.int(patterns.length)];
        return pattern.flatMap(chordIndex => chords[chordIndex]);
    }

    // Optimized bass walking line
    createWalkingBass(rng, chordNotes, measures = 4) {
        const bassLine = [0, -0.1]; // instrument and pan
        const baseOctave = 12;
        let lastNote = baseOctave;
        
        for (let m = 0; m < measures; m++) {
            const chordRoot = chordNotes[m * 4] || 0;
            const targetNote = baseOctave + chordRoot;
            
            for (let beat = 0; beat < 4; beat++) {
                if (beat === 0) {
                    lastNote = targetNote;
                } else {
                    const nextRoot = chordNotes[((m + 1) * 4) % chordNotes.length] || chordRoot;
                    const direction = nextRoot > chordRoot ? 1 : -1;
                    lastNote += direction * (rng.float() < 0.6 ? 1 : 2);
                }
                bassLine.push(lastNote);
            }
        }
        return bassLine;
    }

    // Simplified drum patterns with jazz feel
    createJazzDrums(rng) {
        const measures = 4;
        const beatsPerMeasure = 8; // 8th note subdivisions
        
        // Use a single loop to build all patterns
        const ride = [4, 0.2];
        const kick = [1, 0];
        const snare = [2, 0.1];

        for (let i = 0; i < measures * beatsPerMeasure; i++) {
            // Ride cymbal
            const isMainBeat = i % 2 === 0;
            const isSwingBeat = i % 3 === 2;
            ride.push((isMainBeat || (isSwingBeat && rng.float() < 0.7)) ? 60 : undefined);

            // Kick drum
            const kickProb = (i % 8 === 0) ? 0.9 : 0.1;
            kick.push(rng.float() < kickProb ? 36 : undefined);

            // Snare
            const isBackbeat = i % 8 === 4;
            const isFill = i % 16 > 12 && rng.float() < 0.3;
            snare.push((isBackbeat || isFill) ? 40 : undefined);
        }
        
        return [ride, kick, snare];
    }

    // Main generation function - heavily optimized
    generate(level = 1) {
        const rng = new RandomGenerator(376176 + level * 9999);
        
        // Set jazz tempo
        this.tempo = rng.float(...JAZZ_CONFIG.tempoRange);
        
        // Choose jazz scale
        const scaleNames = Object.keys(JAZZ_CONFIG.jazzScales);
        const scaleName = scaleNames[rng.int(scaleNames.length)];
        this.currentScale = JAZZ_CONFIG.jazzScales[scaleName];
        
        // Initialize instruments
        this.instrumentList = instrumentParams.map(params =>
            params.map(val => (typeof val === 'number') ? val * rng.float(0.8, 1.2) : val));
        
        // Generate chord progression
        const chordNotes = this.generateChordProgression(rng);
        
        // Create melody with jazz phrasing
        const melody = [3, 0]; // trumpet, centered
        let lastNote = null;
        const melodyRhythm = this.createSwingRhythm(rng, 16);
        
        for (let i = 0; i < 16; i++) {
            if (melodyRhythm[i]) {
                const baseNote = 36; // Higher octave for melody
                const note = this.getJazzNote(rng, baseNote, lastNote);
                melody.push(note);
                lastNote = note;
            } else {
                melody.push(undefined);
            }
        }
        
        // Create walking bass
        const bass = this.createWalkingBass(rng, chordNotes);
        
        // Piano comping (sparse chords)
        const piano = [5, 0];
        for (let i = 0; i < 16; i++) {
            const shouldComp = i % 4 !== 0 && rng.float() < 0.3;
            if (shouldComp) {
                const chordNote = chordNotes[Math.floor(i / 4) * 4] || 0;
                piano.push(24 + chordNote);
            } else {
                piano.push(undefined);
            }
        }
        
        // Generate drum patterns
        const drums = this.createJazzDrums(rng);
        
        // Assemble patterns
        this.patterns = [[melody, bass, piano, ...drums]];
        this.songLength = Math.max(melody.length, bass.length) - 2;
        
        return {
            instruments: this.instrumentList,
            patterns: this.patterns,
            tempo: this.tempo,
            songLength: this.songLength
        };
    }
}

// Optimized music system
let jazzGenerator = new JazzMusicGenerator();
let musicOn = true;
let vol = 0.25;

function musicInit(level) {
    const musicData = jazzGenerator.generate(level);
    jazzGenerator.startTime = time;
    jazzGenerator.lastBeat = -1;
    
    // Create sound instances
    jazzGenerator.instrumentList = jazzGenerator.instrumentList.map(params => new Sound(params));
}

// Streamlined update with swing timing
function musicUpdate(player) {
    if (!musicOn) return;
    
    const timeSinceStart = time - jazzGenerator.startTime;
    let beat = Math.floor(timeSinceStart * jazzGenerator.tempo) % jazzGenerator.songLength;
    
    // Apply swing timing
    const swingBeat = beat % 2 === 1;
    if (swingBeat && (timeSinceStart * jazzGenerator.tempo) % 1 < JAZZ_CONFIG.swingRatio - 0.5) return;
    
    if (beat === jazzGenerator.lastBeat) return;
    
    jazzGenerator.lastBeat = beat;
    player?.onNewBeat?.(beat);
    
    // Play patterns
    for (const pattern of jazzGenerator.patterns[0]) {
        const instrument = jazzGenerator.instrumentList[pattern[0]];
        const pan = pattern[1];
        const noteIndex = (beat % (pattern.length - 2)) + 2;
        const semitone = pattern[noteIndex];
        
        if (semitone != null) { // More concise check for undefined or null
            // Use LittleJS Sound.playNote(pitch, pos, volume, pitchRandomness)
            const pos = vec2(cameraPos.x + pan, cameraPos.y);
            instrument.playNote(semitone - 12, pos, vol);
        }
    }
}

export { musicInit, musicUpdate };
