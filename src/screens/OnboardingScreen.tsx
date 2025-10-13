
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StatusBar,
  Platform,
  Animated,
  ImageStyle,
  StyleProp,
  AppState,
  AppStateStatus
} from 'react-native';
import Music from '../audio/Music';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: W, height: H } = Dimensions.get('window');
const BASE_H = 844;
const SCALE = Math.min(1, H / BASE_H);
const UPSCALE = Math.min(1.35, Math.max(1, H / BASE_H));

type Page = {
  id: string;
  bg: any;
  topImage?: any;
  title: string;
  text: string;
  cta: string;
};

const BG1 = require('../assets/onboarding1.png');
const BG2 = require('../assets/onboarding2.png');
const BG3 = require('../assets/onboarding3.png');
const TOP1 = require('../assets/top_picture1.png');
const TOP2 = require('../assets/top_picture2.png');
const TOP3 = require('../assets/top_picture3.png');
const TOP4 = require('../assets/top_picture4.png');

const SIZE_SQUARE = { width: 326, height: 326 };
const SIZE_PORTRAIT = { width: 325, height: 504 };

export default function OnboardingScreen({ navigation }: Props) {

  useEffect(() => {
      Music.bootstrap().catch(() => {});
  
      const onAppStateChange = async (nextState: AppStateStatus) => {
        try {
          if (nextState === 'active') {
            await Music.bootstrap();
          } else {
            await Music.stop();
          }
        } catch {}
      };
  
      const sub = AppState.addEventListener('change', onAppStateChange);
      return () => {
        sub.remove();
        Music.stop().catch(() => {});
      };
  }, []);

  const pages: Page[] = useMemo(
    () => [
      {
        id: '1',
        bg: BG1,
        topImage: TOP1,
        title: 'WELCOME TO THE MAIN ENTERTAINMENT STAGE!',
        text: 'Get ready for bright emotions, loud laughter and star moments. Here you can become anyone — from a Hollywood legend to a TikTok superstar!',
        cta: 'Hello!',
      },
      {
        id: '2',
        bg: BG2,
        topImage: TOP2,
        title: 'ASSEMBLE A TEAM OF STARS',
        text: 'Add players and a host. Get ready for a crazy journey into the world of fame and show business.',
        cta: 'Continue!',
      },
      {
        id: '3',
        bg: BG2,
        topImage: TOP3,
        title: 'COMPLETE STELLAR TASKS',
        text: 'The randomizer will show an action that you need to play, sing, or portray like a world celebrity.',
        cta: 'Ok, good!',
      },
      {
        id: '4',
        bg: BG2,
        topImage: TOP4,
        title: 'COMPETE FOR VICTORY',
        text: 'The host evaluates each player, and the application automatically calculates the points.',
        cta: 'Next!',
      },
      {
        id: '5',
        bg: BG3,
        title: 'ENTER THE HALL OF FAME',
        text: 'The winner receives a bright award animation and will forever remain in the history of the game.',
        cta: 'Start now!',
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Page>>(null);

  const imgOpacity = useRef(new Animated.Value(0)).current;
  const imgTranslate = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(20)).current;

  const animateIn = () => {
    imgOpacity.setValue(0);
    imgTranslate.setValue(20);
    cardOpacity.setValue(0);
    cardTranslate.setValue(20);
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(imgOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(imgTranslate, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [index]);

  const onNext = () => {
    if (index < pages.length - 1) {
      const next = index + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    } else {
      navigation.replace('Home');
    }
  };

  const getTopImageLayout = (
    pageId: string
  ): { imgStyle: StyleProp<ImageStyle>; stick: boolean } => {
    const isSquare = pageId === '1';
    const isTargetPage = pageId === '2' || pageId === '3';

  
    const isTall = H / BASE_H >= 1.02;

    const stick = isTargetPage && isTall; 

    const base = isSquare ? SIZE_SQUARE : SIZE_PORTRAIT;
    const k = stick ? UPSCALE : SCALE;

    const imgStyle: ImageStyle = {
      alignSelf: 'center',
      width: base.width * k,
      height: base.height * k,
      borderRadius: 24 * SCALE,
      ...(stick
        ? {
           
            marginBottom: -12 * SCALE,
          }
        : {
            
            marginTop:
              ((Platform.select({ ios: 80, android: 60, default: 60 }) || 60) + 10) * SCALE,
          }),
    };

    return { imgStyle, stick };
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const { imgStyle, stick } = getTopImageLayout(item.id);
          return (
            <ImageBackground source={item.bg} resizeMode="cover" style={styles.bg}>
              <View style={styles.overlay} />

              {item.topImage ? (
                <View style={[styles.imageZone, stick ? styles.imageZoneStick : styles.imageZoneDefault]}>
                  <Animated.Image
                    source={item.topImage}
                    resizeMode="contain"
                    style={[imgStyle, { opacity: imgOpacity, transform: [{ translateY: imgTranslate }] }]}
                  />
                </View>
              ) : (
                <View style={{ height: (H * 0.08) * SCALE }} />
              )}

              <Animated.View
                style={[
                  styles.bottomCardWrap,
                  { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] },
                ]}
              >
                <View style={styles.card}>
                  <Text numberOfLines={2} style={[styles.title, { fontSize: 18 * SCALE }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.text, { fontSize: 14 * SCALE, lineHeight: 20 * SCALE }]}>
                    {item.text}
                  </Text>

                  <Pressable onPress={onNext}>
                    <LinearGradient
                      style={[
                        styles.button,
                        { width: 192 * SCALE, height: 68 * SCALE, borderRadius: 16 * SCALE },
                      ]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      locations={[0, 0.31, 0.63, 1]}
                      colors={['#AE6D09', '#E9B434', '#FAE97F', '#C59922']}
                    >
                      <Text style={[styles.buttonText, { fontSize: 18 * SCALE }]}>{item.cta}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                <View style={styles.dots}>
                  {pages.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === index && styles.dotActive,
                        { width: 7 * SCALE, height: 7 * SCALE, borderRadius: 7 * SCALE },
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>
            </ImageBackground>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { width: W, height: H, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },

  imageZone: { width: '100%' },
  imageZoneDefault: {},
  imageZoneStick: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  bottomCardWrap: {
    paddingHorizontal: 20 * SCALE,
    paddingBottom: (Platform.select({ ios: 28, android: 24, default: 24 }) || 24) * SCALE,
    marginBottom: 20 * SCALE,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderRadius: 22 * SCALE,
    borderWidth: 1,
    borderColor: 'rgba(198,151,68,0.6)',
    paddingVertical: 28 * SCALE,
    paddingHorizontal: 18 * SCALE,
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8 * SCALE,
    textTransform: 'uppercase',
  },
  text: {
    color: '#e6e6e6',
    marginBottom: 16 * SCALE,
  },
  button: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: { color: '#000', fontWeight: '800' },
  dots: { flexDirection: 'row', alignSelf: 'center', marginTop: 14 * SCALE },
  dot: { backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 5 * SCALE },
  dotActive: { backgroundColor: '#fff' },
});
