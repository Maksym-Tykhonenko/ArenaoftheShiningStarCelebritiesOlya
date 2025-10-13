declare module 'react-native-sound' {
  export default class Sound {
    constructor(
      filename: number | string,
      basePathOrCallback?: string | ((error?: unknown) => void),
      callback?: (error?: unknown) => void
    );

    static setCategory(category: string): void;

    setNumberOfLoops(loops: number): void; 
    setVolume(volume: number): void;       
    play(onEnd?: (success: boolean) => void): void;
    stop(cb?: () => void): void;
    reset(): void;
    getCurrentTime(cb: (seconds: number) => void): void;
  }
}
