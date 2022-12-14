import {React, useEffect} from 'react';
import {Text, View} from 'react-native';
import {setComponentName, Log} from './Logger';
export default function Home() {
  setComponentName();
  useEffect(() => {
    Log('line no 7');
  }, []);
  Log('line no 9');
  Log('line no 10');
  Log('line no 11');
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Welcome</Text>
    </View>
  );
}
