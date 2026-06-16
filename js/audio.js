const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const AudioSystem = {
    playTone: function(frequency, type, duration, vol=0.1) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    },
    
    playCorrect: function() {
        this.playTone(600, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.15, 0.1), 100);
    },
    
    playWrong: function() {
        this.playTone(300, 'sawtooth', 0.2, 0.1);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.1), 150);
    },
    
    playLiquid: function() {
        // A bubbling/filling sound
        let freq = 400;
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playTone(freq + (i*50), 'sine', 0.1, 0.05), i * 50);
        }
    },
    
    playFinish: function() {
        this.playTone(400, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(500, 'sine', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(600, 'sine', 0.1, 0.1), 200);
        setTimeout(() => this.playTone(800, 'sine', 0.4, 0.1), 300);
    },
    
    playServe: function() {
        // A happy, crisp "ding-dong" or slide sound to indicate serving
        this.playTone(880, 'sine', 0.1, 0.1); // A5
        setTimeout(() => this.playTone(1046, 'sine', 0.2, 0.1), 100); // C6
    },
    
    playDiscard: function() {
        // A descending sad sound or clank
        this.playTone(300, 'triangle', 0.15, 0.1);
        setTimeout(() => this.playTone(250, 'triangle', 0.15, 0.1), 150);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.15), 300);
    }
};
