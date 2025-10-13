import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: W, height: H } = Dimensions.get('window');
const BASE_H = 844;
const SCALE = Math.min(1, H / BASE_H);

const BG = require('../assets/onboarding1.png');
const LOGO = require('../assets/top_picture1.png');
const GOLD_STOPS = ['#AE6D09', '#E9B434', '#FAE97F', '#C59922'];
const GOLD_BORDER = 'rgba(198,151,68,0.6)';

export default function HomeScreen({ navigation }: Props) {
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

  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.overlay} />

      <Animated.Image
        source={LOGO}
        resizeMode="contain"
        style={[
          styles.logo,
          { opacity: fade1, transform: [{ translateY: t1 }] },
        ]}
      />

      <Animated.View
        style={[
          styles.card,
          { opacity: fade2, transform: [{ translateY: t2 }] },
        ]}
      >
        <ScrollView contentContainerStyle={styles.menu} showsVerticalScrollIndicator={false}>
          <MenuButton label="Start Game!" onPress={() => navigation.navigate('StartPlay')} />
          <MenuButton label="Hall of Fame" onPress={() => navigation.navigate('HallOfFame')} />
          <MenuButton label="How to play?" onPress={() => navigation.navigate('HowToPlay')} />
          <MenuButton label="Settings" onPress={() => navigation.navigate('Settings')} />
        </ScrollView>
      </Animated.View>
    </ImageBackground>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <LinearGradient
        colors={GOLD_STOPS}
        locations={[0, 0.31, 0.63, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.btn}
      >
        <Text style={styles.btnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: (Platform.select({ ios: 68, android: 60, default: 40 }) || 40) * SCALE,
    paddingHorizontal: 22 * SCALE,
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  logo: {
    alignSelf: 'center',
    width: (W - 44 * SCALE),
    height: (W - 44 * SCALE) * 0.82,
    borderRadius: 24 * SCALE,
  },
  card: {
    marginTop: 18 * SCALE,
    marginBottom: 20 * SCALE,
    width: '100%',
    borderRadius: 24 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    backgroundColor: 'rgba(10,10,10,0.85)',
    padding: 18 * SCALE,
  },
  menu: {
    gap: 14 * SCALE,
    paddingVertical: 6 * SCALE,
  },
  btn: {
    width: '100%',
    height: 68 * SCALE,
    borderRadius: 20 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnText: {
    color: '#1A1200',
    fontSize: 18 * SCALE,
    fontWeight: '800',
  },
});