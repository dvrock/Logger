import {React, useEffect, useMemo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Home from './components/Home';
import {Logger, Init, sendLog} from './components/Logger';
import Check from './components/Check';
import SyncStorage from 'sync-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

console.reportErrorsAsExceptions = false;

export default function App() {
  const Stack = createNativeStackNavigator();
  useEffect(() => {
    Init('form_submit', 'Jone');
  }, []);

  setInterval(() => {
    console.log('function called');
    sendLog();
  }, 1000 * 60);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Check"
          component={Check}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{title: 'Welcome'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
