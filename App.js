// React Native stack navigator
import 'react-native-gesture-handler';
import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Omat komponentit
import Aloitus from "./src/components/Aloitus";
import Sijainti from "./src/components/Sijainti";


const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Aloitus">
        <Stack.Screen name="Aloitus" component={Aloitus} />
        <Stack.Screen name="Sijainti" component={Sijainti} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
