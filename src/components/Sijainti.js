import React from 'react';
import { StyleSheet } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text } from 'react-native-paper';

export default function Sijainti ( { navigation } ) {
  
    return (
      <PaperProvider>
          <Text>Sijainti</Text>
      </PaperProvider>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon : {
      padding : 10,
      marginTop : 50,
      margin : 20
    },
   
  });
