import {React, useEffect} from 'react';
import {Text, View} from 'react-native';
import {setComponentName, Log} from './Logger';
import {useRoute} from '@react-navigation/native';
export default function Check() {
    let route = useRoute();
    useEffect(()=>{
        console.log("setComponentName called...")
        setComponentName(route);
        (async()=>{
         await  Log('line no 11');
         await Log('line no 12');
        })();
    },[])
    
    
 
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Welcome</Text>
    </View>
  );
}
