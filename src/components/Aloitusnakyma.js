import React from 'react';
import { StyleSheet } from 'react-native';

// React Native Paper
import { FAB, List, Provider as PaperProvider, Text } from 'react-native-paper';

// Omat komponentit
import LisaaSijainti from "./LisaaSijainti";

export default function Aloitusnakyma( { navigation } ) {
  
    return (
      <PaperProvider>
     
     <List.Item
      title="1 Item"
      description="Item description"
      left={props => <List.Icon {...props} icon="map-marker" />}
      right={props =>
            <FAB 
            {...props} 
            icon="pencil-outline" 
            onPress={ () => navigation.navigate("Sijainnin tiedot")}
            />
            }
      />

      <FAB 
      style={styles.nappiLisaa}
      icon="map-marker-plus"
      onPress={ () => navigation.navigate("Lisää sijainti")}
      />

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
    nappiLisaa: {
      position : "absolute",
      margin: 20,
      bottom: 15,
      left: 15,
    }
   
  });
