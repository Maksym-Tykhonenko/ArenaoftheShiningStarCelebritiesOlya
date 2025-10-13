import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  FlatList,
  ScrollView,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const BASE_HEIGHT = 844;
const UI_SCALE = Math.min(1, WINDOW_HEIGHT / BASE_HEIGHT);

const BACKGROUND_IMAGE = require('../assets/onboarding1.png');
const HEADER_LOGO = require('../assets/top_picture1.png');
const AWARD_BACKGROUND = require('../assets/award_bg.png');
const MIC_VIDEO = require('../assets/MIC.mp4');

const GOLD_GRADIENT = ['#AE6D09', '#E9B434', '#FAE97F', '#C59922'];
const GOLD_BORDER_COLOR = 'rgba(198,151,68,0.6)';

type Phase =
  | 'setup'
  | 'game'
  | 'result'
  | 'award_video'
  | 'award_final';

type Player = {
  id: string;
  name: string;
  score: number;
};

type RecordItem = {
  id: string;
  name: string;
  points: number;
  dateISO: string;
};

const HALL_OF_FAME_STORAGE_KEY = 'HOF_RECORDS_V1';
const ROUNDS_PER_PLAYER = 10;
const MAX_POINTS_PER_TASK = 20;

const PROMPTS: string[] = [
  'Sing like Selena Gomez.',
  "Walk like you're on the Victoria's Secret catwalk.",
  'Make a face like Jack Sparrow.',
  'Laugh like Jim Carrey in The Mask.',
  'Dance like Michael Jackson.',
  'Act out how you won an Oscar.',
  'Greet your fans like Ariana Grande.',
  "Do a crying scene like you're in a dramatic movie.",
  "Act out how you're surprised to win the lottery.",
  'Dance like Elvis Presley.',
  "Act out how you're giving an interview like you're a world star.",
  'Imitate singing at the top of your lungs.',
  "Make a toast like you're at a glamorous party.",
  "Act out how you're caught off guard by the paparazzi.",
  "Act out how you're posing on the red carpet.",
  'Dance like a TikTok trend.',
  "Perform a song like you're at Eurovision.",
  "Pretend you're hosting a party.",
  'Mimic a scene from a Marvel movie.',
  'Impersonate a rapper at a concert.',
  'Show how you sign autographs for fans.',
  'React like you just saw your idol.',
  'Dance like Britney Spears.',
  'Sing a piece like an opera singer.',
  'Impersonate a scene from a horror movie.',
  'Show how you win a music competition.',
  'Wish your fans a Happy New Year like a star.',
  "Pretend you're in a perfume commercial.",
  'Impersonate a Disney cartoon character.',
  'Impersonate an action movie star.',
  "Show how you're hosting a live broadcast.",
  'Dance like Beyoncé.',
  'Sing like Freddie Mercury.',
  'Act out presenting an award to another artist.',
  'Act out recording a hit in the studio.',
  'Act out reacting to criticism.',
  'Perform a song from the movie “Frozen.”',
  'Act out hosting a music awards show.',
  'Act out trying on a designer suit.',
  'Dance like an 80s style.',
  'Pretend you’re a director on set.',
  'Act out filming a coffee commercial.',
  'Act out being a fan who storms the stage.',
  'Act out walking on stage to loud applause.',
  'Act out a scene from a romantic movie.',
  'Dance like a K-pop style.',
  'Sing the national anthem like a world-class sports star.',
  "Pretend you're posing for a magazine cover.",
  'Act out how you answer a tough question from a journalist.',
  'Show how you greet fans at the airport.',
];

export default function StartPlayScreen() {
  const navigation = useNavigation<any>();

  const [phase, setPhase] = useState<Phase>('setup');
  const [hostName, setHostName] = useState('');
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: '', score: 0 },
    { id: 'p2', name: '', score: 0 },
  ]);

  const [order, setOrder] = useState<number[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(20)).current;

  const headerTitle = useMemo(() => {
    if (phase === 'setup') return 'Start Game!';
    if (phase === 'game') return 'Game!';
    if (phase === 'result') return 'Result!';
    return '';
  }, [phase]);

  useEffect(() => {
    fade.setValue(0);
    shift.setValue(20);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [phase, turnIndex, roundIndex]);

  const addPlayerField = () => {
    setPlayers(prev => [...prev, { id: `p${prev.length + 1}`, name: '', score: 0 }]);
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => (p.id === id ? { ...p, name } : p)));
  };

  const canStart = useMemo(
    () => hostName.trim().length > 0 && players.filter(p => p.name.trim().length > 0).length >= 2,
    [hostName, players]
  );

  const drawTask = () => {
    return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  };

  const startGame = () => {
    const validPlayers = players.filter(p => p.name.trim().length > 0);
    if (validPlayers.length < 2) return;

    setPlayers(validPlayers.map(p => ({ ...p, score: 0 })));

    const indices = [...validPlayers.keys()];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    setOrder(indices);
    setTurnIndex(0);
    setRoundIndex(0);
    setCurrentTask(drawTask());
    setSelectedScore(null);
    setPhase('game');
  };

  const currentPlayer = useMemo(() => {
    if (!order.length) return undefined;
    return players[order[turnIndex]];
  }, [order, turnIndex, players]);

  const advanceTurn = () => {
    const nextTurnIndex = (turnIndex + 1) % order.length;
    let nextRoundIndex = roundIndex;
    if (nextTurnIndex === 0) nextRoundIndex = roundIndex + 1;

    if (nextRoundIndex >= ROUNDS_PER_PLAYER) {
      setPhase('result');
    } else {
      setTurnIndex(nextTurnIndex);
      setRoundIndex(nextRoundIndex);
      setCurrentTask(drawTask());
      setSelectedScore(null);
    }
  };

  const saveScoreAndNext = () => {
    const points = selectedScore ?? 0;
    if (currentPlayer) {
      setPlayers(prev =>
        prev.map((p, i) =>
          i === order[turnIndex] ? { ...p, score: p.score + points } : p
        )
      );
    }
    advanceTurn();
  };

  const skipTask = () => {
    setSelectedScore(0);
    saveScoreAndNext();
  };

  const goHome = () => {
    navigation.goBack();
  };

  const winner = useMemo(() => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return { name: sorted[0]?.name || 'Star', points: sorted[0]?.score ?? 0 };
  }, [players]);

  const persistWinner = async (name: string, points: number) => {
    try {
      const raw = await AsyncStorage.getItem(HALL_OF_FAME_STORAGE_KEY);
      const list: RecordItem[] = raw ? JSON.parse(raw) : [];
      const next: RecordItem[] = [
        { id: `${Date.now()}`, name, points, dateISO: new Date().toISOString() },
        ...list,
      ].slice(0, 100);
      await AsyncStorage.setItem(HALL_OF_FAME_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const goToAward = async () => {
    await persistWinner(winner.name, winner.points);
    setPhase('award_video');
    setTimeout(() => setPhase('award_final'), 5000);
  };

  const onShareAward = () => {
    Share.share({
      message: `${winner.name} CELEBRITIES — winner of the Arena of the Shining Star!`,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {phase === 'award_video' ? (
        <View style={styles.videoRoot}>
          <StatusBar hidden />
          <Video
            source={MIC_VIDEO}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            onEnd={() => setPhase('award_final')}
            paused={false}
            repeat={false}
            muted={false}
          />
        </View>
      ) : phase === 'award_final' ? (
        <ImageBackground source={AWARD_BACKGROUND} resizeMode="cover" style={styles.awardRoot}>
          <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
          <Animated.View style={[styles.awardCenter, { opacity: fade, transform: [{ translateY: shift }] }]}>
            <View style={styles.titlePillAward}>
              <Text style={styles.titleText}>{(winner.name || 'STAR').toUpperCase()} CELEBRITIES</Text>
            </View>

            <View style={styles.bottomRow}>
              <Pressable onPress={onShareAward}>
                <LinearGradient
                  colors={GOLD_GRADIENT}
                  locations={[0, 0.31, 0.63, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>Share</Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={goHome}>
                <LinearGradient
                  colors={GOLD_GRADIENT}
                  locations={[0, 0.31, 0.63, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>Go home</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </ImageBackground>
      ) : (
        <ImageBackground source={BACKGROUND_IMAGE} resizeMode="cover" style={styles.root}>
          <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
          <View style={styles.overlay} />

          <View style={{ marginTop: 20 * UI_SCALE }}>
            <View style={styles.header}>
              <Pressable onPress={goHome}>
                <LinearGradient
                  colors={GOLD_GRADIENT}
                  locations={[0, 0.31, 0.63, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.backBtn}
                >
                  <Text style={styles.backIcon}>←</Text>
                </LinearGradient>
              </Pressable>

              <LinearGradient
                colors={GOLD_GRADIENT}
                locations={[0, 0.31, 0.63, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.titlePill}
              >
                <Text style={styles.title}>{headerTitle}</Text>
              </LinearGradient>

              <Image source={HEADER_LOGO} style={styles.headerLogo} resizeMode="cover" />
            </View>

            <Animated.View style={{ opacity: fade, transform: [{ translateY: shift }] }}>
              {phase === 'setup' && (
                <View>
                  <LabeledInput
                    label="Enter the host’s name"
                    placeholder="Enter name"
                    value={hostName}
                    onChangeText={setHostName}
                  />

                  <FlatList
                    data={players}
                    keyExtractor={p => p.id}
                    style={{ marginTop: 8 * UI_SCALE }}
                    renderItem={({ item, index }) => (
                      <LabeledInput
                        label={`Enter player name ${index + 1}`}
                        placeholder="Enter name"
                        value={item.name}
                        onChangeText={text => updatePlayerName(item.id, text)}
                      />
                    )}
                  />

                  <Pressable onPress={addPlayerField} style={{ marginTop: 10 * UI_SCALE }}>
                    <LinearGradient
                      colors={GOLD_GRADIENT}
                      locations={[0, 0.31, 0.63, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.wideBtn}
                    >
                      <Text style={styles.wideBtnText}>ADD NEW PLAYER</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    disabled={!canStart}
                    onPress={startGame}
                    style={{ marginTop: 18 * UI_SCALE, opacity: canStart ? 1 : 0.5 }}
                  >
                    <LinearGradient
                      colors={GOLD_GRADIENT}
                      locations={[0, 0.31, 0.63, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.bigStart}
                    >
                      <Text style={styles.bigStartText}>START GAME</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}

              {phase === 'game' && currentPlayer && (
                <View>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      Round {roundIndex + 1}/{ROUNDS_PER_PLAYER} • {currentPlayer.name.toUpperCase()}
                    </Text>
                    <Text style={[styles.pillText, { opacity: 0.7, marginTop: 4 * UI_SCALE }]}>
                      Total: {currentPlayer.score} pts
                    </Text>
                  </View>

                  <View style={styles.taskCard}>
                    <Text style={styles.taskIcon}>🎬</Text>
                    <Text style={styles.taskText}>{currentTask}</Text>
                  </View>

                  <Text style={styles.scoreTitle}>Set points (0–{MAX_POINTS_PER_TASK})</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scoreRow}
                  >
                    {Array.from({ length: MAX_POINTS_PER_TASK + 1 }, (_, value) =>
                      selectedScore === value ? (
                        <Pressable key={value} onPress={() => setSelectedScore(value)} style={{ marginHorizontal: 6 * UI_SCALE }}>
                          <LinearGradient
                            colors={GOLD_GRADIENT}
                            locations={[0, 0.31, 0.63, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.scoreBadgeActive}
                          >
                            <Text style={styles.scoreBadgeActiveText}>{value}</Text>
                          </LinearGradient>
                        </Pressable>
                      ) : (
                        <Pressable key={value} onPress={() => setSelectedScore(value)} style={{ marginHorizontal: 6 * UI_SCALE }}>
                          <View style={styles.scoreBadge}>
                            <Text style={styles.scoreBadgeText}>{value}</Text>
                          </View>
                        </Pressable>
                      )
                    )}
                  </ScrollView>

                  <View style={{ alignItems: 'center', marginTop: 12 * UI_SCALE }}>
                    <Pressable
                      onPress={saveScoreAndNext}
                      disabled={selectedScore === null}
                      style={{ opacity: selectedScore === null ? 0.6 : 1 }}
                    >
                      <LinearGradient
                        colors={GOLD_GRADIENT}
                        locations={[0, 0.31, 0.63, 1]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.actionBtn}
                      >
                        <Text style={styles.actionBtnText}>Save points & Next</Text>
                      </LinearGradient>
                    </Pressable>

                    <Pressable onPress={skipTask} style={{ marginTop: 8 * UI_SCALE }}>
                      <LinearGradient
                        colors={GOLD_GRADIENT}
                        locations={[0, 0.31, 0.63, 1]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.actionBtn}
                      >
                        <Text style={styles.actionBtnText}>Skip (0 pts)</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              )}

              {phase === 'result' && (
                <View>
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>GAME OVER!</Text>
                  </View>

                  <View style={styles.resultCard}>
                    {[...players].sort((a, b) => b.score - a.score).map((p, index) => (
                      <View key={p.id} style={styles.resultRow}>
                        <Text style={styles.resultName}>{index === 0 ? '🏆 ' : ''}{p.name}</Text>
                        <Text style={styles.resultPts}>{p.score} pts</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable onPress={goToAward} style={{ alignSelf: 'center', marginTop: 18 * UI_SCALE }}>
                    <LinearGradient
                      colors={GOLD_GRADIENT}
                      locations={[0, 0.31, 0.63, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.goAward}
                    >
                      <Text style={styles.goAwardText}>Go to the award  →</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </View>
        </ImageBackground>
      )}
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 10 * UI_SCALE }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: (Platform.select({ ios: 64, android: 68, default: 48 }) || 48) * UI_SCALE,
    paddingHorizontal: 20 * UI_SCALE,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
    borderRadius: 22 * UI_SCALE,
    padding: 8 * UI_SCALE,
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  backBtn: {
    width: 56 * UI_SCALE,
    height: 56 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#1A1200',
    fontSize: 22 * UI_SCALE,
    fontWeight: '800',
  },
  titlePill: {
    flex: 1,
    height: 56 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#1A1200',
    fontSize: 18 * UI_SCALE,
    fontWeight: '800',
  },
  headerLogo: {
    width: 68 * UI_SCALE,
    height: 68 * UI_SCALE,
    borderRadius: 22 * UI_SCALE,
  },

  label: {
    color: '#fff',
    fontSize: 13 * UI_SCALE,
    marginTop: 12 * UI_SCALE,
    marginBottom: 6 * UI_SCALE,
    opacity: 0.9,
  },
  input: {
    height: 44 * UI_SCALE,
    borderRadius: 12 * UI_SCALE,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 12 * UI_SCALE,
    color: '#fff',
  },

  wideBtn: {
    height: 48 * UI_SCALE,
    borderRadius: 16 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideBtnText: {
    color: '#1A1200',
    fontWeight: '800',
    fontSize: 14 * UI_SCALE,
  },
  bigStart: {
    height: 64 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigStartText: {
    color: '#1A1200',
    fontWeight: '800',
    fontSize: 16 * UI_SCALE,
  },

  pill: {
    marginTop: 16 * UI_SCALE,
    borderRadius: 22 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
    backgroundColor: 'rgba(10,10,10,0.6)',
    paddingVertical: 12 * UI_SCALE,
    paddingHorizontal: 16 * UI_SCALE,
  },
  pillText: {
    color: '#fff',
    fontSize: 16 * UI_SCALE,
    fontWeight: '800',
  },

  taskCard: {
    marginTop: 12 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
    borderRadius: 22 * UI_SCALE,
    backgroundColor: 'rgba(10,10,10,0.6)',
    padding: 18 * UI_SCALE,
    alignItems: 'center',
  },
  taskIcon: {
    fontSize: 22 * UI_SCALE,
    color: '#fff',
    marginBottom: 10 * UI_SCALE,
  },
  taskText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16 * UI_SCALE,
    lineHeight: 22 * UI_SCALE,
  },

  scoreTitle: {
    color: '#fff',
    marginTop: 12 * UI_SCALE,
    fontSize: 14 * UI_SCALE,
    opacity: 0.9,
    textAlign: 'center',
  },
  scoreRow: {
    paddingHorizontal: 10 * UI_SCALE,
    paddingVertical: 8 * UI_SCALE,
  },
  scoreBadge: {
    width: 44 * UI_SCALE,
    height: 44 * UI_SCALE,
    borderRadius: 14 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,10,0.6)',
  },
  scoreBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14 * UI_SCALE,
  },
  scoreBadgeActive: {
    width: 44 * UI_SCALE,
    height: 44 * UI_SCALE,
    borderRadius: 14 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeActiveText: {
    color: '#1A1200',
    fontWeight: '900',
    fontSize: 14 * UI_SCALE,
  },

  actionBtn: {
    width: 240 * UI_SCALE,
    height: 56 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#1A1200',
    fontSize: 16 * UI_SCALE,
    fontWeight: '800',
  },

  resultCard: {
    marginTop: 12 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
    borderRadius: 22 * UI_SCALE,
    backgroundColor: 'rgba(10,10,10,0.6)',
    padding: 12 * UI_SCALE,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8 * UI_SCALE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  resultName: {
    color: '#fff',
    fontSize: 15 * UI_SCALE,
  },
  resultPts: {
    color: '#fff',
    fontSize: 15 * UI_SCALE,
    opacity: 0.85,
  },
  goAward: {
    width: 240 * UI_SCALE,
    height: 56 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goAwardText: {
    color: '#1A1200',
    fontSize: 16 * UI_SCALE,
    fontWeight: '800',
  },

  videoRoot: {
    flex: 1,
    backgroundColor: '#000',
  },

  awardRoot: {
    flex: 1,
    paddingTop: (Platform.select({ ios: 24, android: 10, default: 10 }) || 10) * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 34 * UI_SCALE,
  },
  awardCenter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titlePillAward: {
    width: WINDOW_WIDTH * 0.82,
    borderRadius: 28 * UI_SCALE,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 16 * UI_SCALE,
    alignItems: 'center',
    marginBottom: 18 * UI_SCALE,
    borderWidth: 1,
    borderColor: GOLD_BORDER_COLOR,
  },
  titleText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.8,
    fontSize: 18 * UI_SCALE,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 14 * UI_SCALE,
    marginBottom: 6 * UI_SCALE,
  },
  smallBtn: {
    width: 120 * UI_SCALE,
    height: 52 * UI_SCALE,
    borderRadius: 18 * UI_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: {
    color: '#1A1200',
    fontWeight: '800',
    fontSize: 15 * UI_SCALE,
  },
});