import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  IOSCategory,
  IOSCategoryMode,
  IOSCategoryOptions,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUSIC_KEY = 'MUSIC_ON_V1';
const BGM = require('../assets/bgm.mp3');

let initialized = false;
let preparing: Promise<void> | null = null;

async function setupOnce() {
  if (initialized) return;
  if (preparing) return preparing;
  preparing = (async () => {
    await TrackPlayer.setupPlayer({
      iosCategory: IOSCategory.Playback,
      iosCategoryMode: IOSCategoryMode.Default,
      iosCategoryOptions: [IOSCategoryOptions.MixWithOthers],
    });
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        stopForegroundGracePeriod: 5,
      },
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    initialized = true;
  })();
  await preparing;
}

async function ensureQueue() {
  const q = await TrackPlayer.getQueue();
  if (q.length === 0) {
    await TrackPlayer.add([{ id: 'bgm', url: BGM, title: 'BGM' }]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    await TrackPlayer.setVolume(0.6);
  }
}

export const Music = {
  async bootstrap() {
    const saved = await AsyncStorage.getItem(MUSIC_KEY);
    const enabled = saved == null ? true : saved === '1';
    if (enabled) {
      await this.start();
    } else {
      await this.stop();
    }
  },
  async start() {
    await setupOnce();
    await ensureQueue();
    await TrackPlayer.play();
    await AsyncStorage.setItem(MUSIC_KEY, '1');
  },
  async stop() {
    try {
      await TrackPlayer.stop();
    } finally {
      await TrackPlayer.reset(); 
      await AsyncStorage.setItem(MUSIC_KEY, '0');
    }
  },
  async setEnabled(on: boolean) {
    if (on) return this.start();
    return this.stop();
  },
  async getEnabled(): Promise<boolean> {
    const saved = await AsyncStorage.getItem(MUSIC_KEY);
    return saved == null ? true : saved === '1';
  },
};

export default Music;
export { MUSIC_KEY };
