// React Native stack navigator
import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Omat komponentit
import Aloitusnakyma from "./src/components/Aloitusnakyma";
import SijainninTiedot from "./src/components/SijainninTiedot";

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Aloitus">
        <Stack.Screen name="Aloitusnäkymä" component={Aloitusnakyma} />
        <Stack.Screen name="Sijainnin tiedot" component={SijainninTiedot} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
