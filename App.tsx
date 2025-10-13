
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Music from './src/audio/Music';

export default function App() {
  //useEffect(() => {
  //  Music.bootstrap().catch(() => {});
//
  //  const onAppStateChange = async (nextState: AppStateStatus) => {
  //    try {
  //      if (nextState === 'active') {
  //        await Music.bootstrap();
  //      } else {
  //        await Music.stop();
  //      }
  //    } catch {}
  //  };
//
  //  const sub = AppState.addEventListener('change', onAppStateChange);
  //  return () => {
  //    sub.remove();
  //    Music.stop().catch(() => {});
  //  };
  //}, []);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
