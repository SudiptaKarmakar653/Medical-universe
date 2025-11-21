
export class VoiceAssistant {
  private synth: SpeechSynthesis;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initVoices();
  }

  private initVoices() {
    // Wait for voices to be loaded
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.setDefaultVoice();
      });
    } else {
      this.setDefaultVoice();
    }
  }

  private setDefaultVoice() {
    const voices = this.synth.getVoices();
    // Try to find an English voice
    this.currentVoice = voices.find(voice => voice.lang.includes('en')) || voices[0] || null;
  }

  setLanguage(language: 'english' | 'bengali') {
    const voices = this.synth.getVoices();
    if (language === 'bengali') {
      // Try to find Bengali voice
      this.currentVoice = voices.find(voice => 
        voice.lang.includes('bn') || voice.lang.includes('hi')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0] || null;
    } else {
      this.currentVoice = voices.find(voice => voice.lang.includes('en')) || voices[0] || null;
    }
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.isEnabled || !text.trim()) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }
    
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 0.8;

    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
    return this.isEnabled;
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }

  generateDailyMotivation(dayNumber: number, completionPercentage: number) {
    const motivationalMessages = [
      `Today is your day ${dayNumber} of recovery. You're doing amazing!`,
      `Day ${dayNumber} - Every step forward is progress. Keep going!`,
      `Welcome to day ${dayNumber} of your healing journey. You've got this!`,
      `Day ${dayNumber} brings new possibilities for healing. Stay strong!`,
      `You're on day ${dayNumber} - your body is healing more each day.`
    ];

    const progressMessages = completionPercentage > 80 ? 
      " You're making excellent progress!" :
      completionPercentage > 50 ? 
      " You're doing well, keep it up!" :
      " Every task completed helps your recovery.";

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return randomMessage + progressMessages;
  }

  generateTaskInstruction(taskTitle: string, taskDescription: string, duration: number) {
    return `Now it's time for: ${taskTitle}. ${taskDescription} This should take about ${duration} minutes. Take your time and listen to your body.`;
  }

  generateCompletionPraise(taskTitle: string) {
    const praises = [
      `Excellent work completing your ${taskTitle}!`,
      `Well done! You've finished your ${taskTitle}.`,
      `Great job on completing your ${taskTitle}!`,
      `Outstanding! Your ${taskTitle} is complete.`
    ];
    return praises[Math.floor(Math.random() * praises.length)];
  }
}

export const voiceAssistant = new VoiceAssistant();
