import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  StatusBar,
  Image,
  Share,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Music, { MUSIC_KEY } from '../audio/Music';

const BG = require('../assets/onboarding1.png');
const LOGO = require('../assets/top_picture1.png');
const ICON_VECTOR = require('../assets/Vector.png');

const GOLD = ['#AE6D09', '#E9B434', '#FAE97F', '#C59922'];
const GOLD_BORDER = 'rgba(198,151,68,0.6)';
const HOF_KEY = 'HOF_RECORDS_V1';

const { height: H } = Dimensions.get('window');
const BASE_H = 844;
const SCALE = Math.min(1, H / BASE_H);

export default function SettingsScreen() {
  const nav = useNavigation();
  const [music, setMusic] = useState(true);

  const fade = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(20 * SCALE)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fade, shift]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(MUSIC_KEY);
        const enabled = saved == null ? true : saved === '1';
        setMusic(enabled);
        await Music.setEnabled(enabled);
      } catch {}
    })();
  }, []);

  const onShare = async () => {
    try {
      await Share.share(
        {
          message: 'Play Arena of the Shining Star! Become a star and get into the Hall of Fame ⭐️',
          url: 'https://example.com/app',
          title: 'Arena of the Shining Star',
        },
        { dialogTitle: 'Share app', subject: 'Arena of the Shining Star' },
      );
    } catch {}
  };

  const onToggleMusic = async () => {
    const next = !music;
    setMusic(next);
    await Music.setEnabled(next);
  };

  const onClearHall = useCallback(() => {
    Alert.alert('Clear Hall of Fame', 'Are you sure you want to delete all saved winners?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.setItem(HOF_KEY, JSON.stringify([]));
            Alert.alert('Done', 'Hall of Fame cleared.');
          } catch {
            Alert.alert('Error', 'Failed to clear records.');
          }
        },
      },
    ]);
  }, []);

  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.overlay} />

      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()}>
          <LinearGradient
            colors={GOLD}
            locations={[0, 0.31, 0.63, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </LinearGradient>
        </Pressable>

        <LinearGradient
          colors={GOLD}
          locations={[0, 0.31, 0.63, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.titlePill}
        >
          <Text style={styles.title}>Settings</Text>
        </LinearGradient>

        <Image source={LOGO} style={styles.headerLogo} resizeMode="cover" />
      </View>

      <Animated.View style={{ opacity: fade, transform: [{ translateY: shift }] }}>
        <View style={styles.card}>
          <Text style={styles.label}>Game sound</Text>
          <GoldToggle value={music} onChange={onToggleMusic} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Clear Hall of Fame</Text>
          <Pressable onPress={onClearHall} accessibilityLabel="Clear Hall of Fame">
            <LinearGradient
              colors={GOLD}
              locations={[0, 0.31, 0.63, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.clearBtn}
            >
              <Image
                source={ICON_VECTOR}
                style={styles.clearIconOverlay}
                resizeMode="contain"
              />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.shareCard}>
          <Image source={LOGO} style={styles.shareImg} resizeMode="cover" />
          <Text style={styles.shareText}>
            Play, become a star, collect points and get into the Hall of Fame. Your stage, your
            rules!
          </Text>

          <Pressable onPress={onShare} style={{ marginTop: 14 * SCALE }}>
            <LinearGradient
              colors={GOLD}
              locations={[0, 0.31, 0.63, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shareBtn}
            >
              <Text style={styles.shareBtnText}>Share app</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

function GoldToggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <Pressable onPress={onChange} hitSlop={10}>
      <View style={styles.toggleWrap}>
        <View style={styles.toggleBg} />
        <LinearGradient
          colors={GOLD}
          locations={[0, 0.31, 0.63, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.toggleThumb, value ? styles.thumbRight : styles.thumbLeft]}
        />
        <View style={[styles.toggleLabelBox, value ? styles.labelRight : styles.labelLeft]}>
          <Text style={styles.toggleLabel}>{value ? 'OFF' : 'ON'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: (Platform.select({ ios: 64, android: 68, default: 48 }) || 48) * SCALE,
    paddingHorizontal: 20 * SCALE,
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },

  header: {
    marginTop: 12 * SCALE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 22 * SCALE,
    padding: 8 * SCALE,
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  backBtn: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#1A1200', fontSize: 22 * SCALE, fontWeight: '800' },
  titlePill: {
    flex: 1,
    height: 56 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#1A1200', fontSize: 24 * SCALE, fontWeight: '900' },
  headerLogo: { width: 68 * SCALE, height: 68 * SCALE, borderRadius: 22 * SCALE },

  card: {
    marginTop: 22 * SCALE,
    paddingVertical: 18 * SCALE,
    paddingHorizontal: 16 * SCALE,
    borderRadius: 22 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    backgroundColor: 'rgba(10,10,10,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: '#fff', fontSize: 22 * SCALE, fontWeight: '800' },

  clearBtn: {
    width: 120 * SCALE,
    height: 52 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clearIconOverlay: {
    position: 'absolute',
    width: 25 * SCALE,
    height: 25 * SCALE,
  },

  shareCard: {
    marginTop: 22 * SCALE,
    borderRadius: 22 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    backgroundColor: 'rgba(10,10,10,0.6)',
    padding: 18 * SCALE,
    alignItems: 'center',
  },
  shareImg: { width: 200 * SCALE, height: 200 * SCALE, borderRadius: 26 * SCALE, marginBottom: 14 * SCALE },
  shareText: { color: '#fff', fontSize: 18 * SCALE, lineHeight: 26 * SCALE, textAlign: 'center', marginHorizontal: 6 * SCALE },

  shareBtn: {
    width: 150 * SCALE,
    height: 55 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14 * SCALE,
  },
  shareBtnText: { color: '#1A1200', fontSize: 18 * SCALE, fontWeight: '900' },

  toggleWrap: {
    width: 97 * SCALE,
    height: 47 * SCALE,
    borderRadius: 24 * SCALE,
    borderWidth: 2,
    borderColor: GOLD_BORDER,
    backgroundColor: '#13100D',
    overflow: 'hidden',
    position: 'relative',
  },
  toggleBg: { ...StyleSheet.absoluteFillObject, borderRadius: 24 * SCALE, backgroundColor: '#161310' },
  toggleThumb: { position: 'absolute', top: 5 * SCALE, width: 37 * SCALE, height: 37 * SCALE, borderRadius: 19 * SCALE },
  thumbLeft: { left: 5 * SCALE },
  thumbRight: { right: 5 * SCALE },
  toggleLabelBox: { position: 'absolute', top: 2 * SCALE, bottom: 2 * SCALE, justifyContent: 'center' },
  labelLeft: { left: 52 * SCALE },
  labelRight: { right: 52 * SCALE },
  toggleLabel: { color: '#F6D566', fontWeight: '900', fontSize: 16 * SCALE },
});