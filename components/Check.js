import {React, useEffect} from 'react';
import {Text, View} from 'react-native';
import {setComponentName, Log} from './Logger';
import {useRoute} from '@react-navigation/native';
export default function Check() {
    let route = useRoute();
    useEffect(()=>{
        Log('line no 9');
        console.log("setComponentName called...")
        setComponentName(route);
    },[])
    Log('line no 12');

  
  Log('line no 12');
  Log('line no 11');
  Log('line no 13');
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Welcome</Text>
    </View>
  );
}
