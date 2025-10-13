import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W, height: H } = Dimensions.get('window');
const BASE_H = 844;
const SCALE = Math.min(1, H / BASE_H);

const BG = require('../assets/onboarding1.png');
const LOGO = require('../assets/top_picture1.png');
const MIC = require('../assets/Hall.png');

const GOLD = ['#AE6D09', '#E9B434', '#FAE97F', '#C59922'];
const GOLD_BORDER = 'rgba(198,151,68,0.6)';

type RecordItem = { id: string; name: string; points: number; dateISO: string };
const HOF_KEY = 'HOF_RECORDS_V1';

export default function HallOfFameScreen() {
  const navigation = useNavigation();
  const [records, setRecords] = useState<RecordItem[]>([]);

  const fade = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(20)).current;

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HOF_KEY);
      const list: RecordItem[] = raw ? JSON.parse(raw) : [];
      setRecords(list);
    } catch {
      setRecords([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    fade.setValue(0);
    shift.setValue(20);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [records, fade, shift]);

  const content = useMemo(() => {
    if (!records.length) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>THE HALL IS EMPTY</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={records}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 24 * SCALE }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{new Date(item.dateISO).toLocaleDateString()}</Text>
              <Text style={styles.points}>{item.points} POINTS</Text>
            </View>
            <Image source={MIC} style={styles.mic} resizeMode="contain" />
          </View>
        )}
      />
    );
  }, [records]);

  const SIDE = 76 * SCALE;

  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.overlay} />

      <View style={{ marginTop: 20 * SCALE }}>
        <View style={styles.header}>
          <View style={[styles.sideBox, { width: SIDE }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
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
          </View>

          <View style={styles.centerSlot}>
            <LinearGradient
              colors={GOLD}
              locations={[0, 0.31, 0.63, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.titlePill}
            >
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleShifted}>
                Hall of Fame
              </Text>
            </LinearGradient>
          </View>

          <View style={[styles.sideBox, { width: SIDE }]}>
            <Image source={LOGO} style={styles.logo} />
          </View>
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: shift }] }}>
          {content}
        </Animated.View>
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
    fontSize: 20 * SCALE,
    fontWeight: '900',
    transform: [{ translateX: -10 * SCALE }],
  },

  logo: { width: 68 * SCALE, height: 68 * SCALE, borderRadius: 22 * SCALE },

  emptyWrap: { height: H * 0.7, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 * SCALE, letterSpacing: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24 * SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    backgroundColor: 'rgba(10,10,10,0.65)',
    paddingVertical: 16 * SCALE,
    paddingHorizontal: 18 * SCALE,
    marginTop: 16 * SCALE,
  },
  name: { color: '#fff', fontSize: 18 * SCALE, fontWeight: '800' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 12 * SCALE, marginTop: 4 * SCALE },
  points: { color: '#fff', fontSize: 14 * SCALE, marginTop: 10 * SCALE },
  mic: { width: 110 * SCALE, height: 44 * SCALE, marginLeft: 12 * SCALE },
});