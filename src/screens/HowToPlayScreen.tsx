import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  ImageBackground,
  StatusBar,
  Platform,
  Share,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');
const BASE_H = 844;
const SCALE = Math.min(1, H / BASE_H);

const BG = require('../assets/onboarding1.png');
const LOGO = require('../assets/top_picture1.png');

const GOLD = ['#AE6D09', '#E9B434', '#FAE97F', '#C59922'];
const GOLD_BORDER = 'rgba(198,151,68,0.6)';

export default function HowToPlayScreen() {
  const nav = useNavigation();

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const t1 = useRef(new Animated.Value(20)).current;
  const t2 = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fade1, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(t1, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fade2, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(t2, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const onShare = () =>
    Share.share({
      message:
        'Arena of the Shining Star: assemble a team, complete stellar tasks and get to the Hall of Fame!',
    });

  const SIDE = 76 * SCALE;

  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.overlay} />

      <View style={{ marginTop: 20 * SCALE }}>
        <Animated.View style={[styles.header, { opacity: fade1, transform: [{ translateY: t1 }] }]}>
          <View style={[styles.sideBox, { width: SIDE }]}>
            <Pressable onPress={() => nav.goBack()} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <LinearGradient colors={GOLD} locations={[0, 0.31, 0.63, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.backBtn}>
                <Text style={styles.backIcon}>←</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.centerSlot}>
            <LinearGradient colors={GOLD} locations={[0, 0.31, 0.63, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.titlePill}>
              <Text style={styles.titleShifted}>How to play?</Text>
            </LinearGradient>
          </View>

          <View style={[styles.sideBox, { width: SIDE }]}>
            <Image source={LOGO} style={styles.logo} resizeMode="cover" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fade2, transform: [{ translateY: t2 }] }]}>
          <Text style={styles.rule}>Add players and choose a host.</Text>
          <Text style={styles.rule}>The host starts the round, and the app randomly selects a player and a task.</Text>
          <Text style={styles.rule}>The player performs the task, the rest watch and laugh.</Text>
          <Text style={styles.rule}>The host gives everyone points for their performance.</Text>
          <Text style={styles.rule}>After all the rounds, the app counts the points and shows the winner with an award animation.</Text>
          <Text style={styles.rule}>The winner gets into the “Hall of Fame”.</Text>
        </Animated.View>

        <View style={styles.bottom}>
          <Pressable onPress={onShare} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <LinearGradient colors={GOLD} locations={[0, 0.31, 0.63, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.shareBtn}>
              <Text style={styles.shareText}>Share app</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: (Platform.select({ ios: 64, android: 60, default: 40 }) || 40) * SCALE,
    paddingHorizontal: 20 * SCALE,
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 24 * SCALE,
    padding: 8 * SCALE,
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  sideBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 56 * SCALE,
    height: 56 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#1A1200', fontSize: 22 * SCALE, fontWeight: '800' },

  centerSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePill: {
    width: '100%',
    height: 56 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14 * SCALE,
  },
  titleShifted: {
    color: '#1A1200',
    fontSize: 18 * SCALE,
    fontWeight: '800',
    transform: [{ translateX: -10 * SCALE }],
  },

  logo: { width: 68 * SCALE, height: 68 * SCALE, borderRadius: 22 * SCALE },

  card: {
    marginTop: 20 * SCALE,
    marginHorizontal: 10 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 24 * SCALE,
    backgroundColor: 'rgba(10,10,10,0.85)',
    padding: 18 * SCALE,
  },
  rule: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10 * SCALE,
  },

  bottom: {
    marginTop: 10 * SCALE,
    alignItems: 'center',
  },
  shareBtn: {
    width: 200 * SCALE,
    height: 56 * SCALE,
    borderRadius: 18 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  shareText: { color: '#1A1200', fontSize: 18 * SCALE, fontWeight: '800' },
});