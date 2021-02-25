import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

// React Native Paper
import { Text, TextInput, FAB  } from 'react-native-paper';

// Expo Location - sijaintitiedot puhelimesta
import * as Location from 'expo-location';

// SQLite tietokantaan tallennusta varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys

db.transaction(
    (tx) => {
        tx.executeSql(`CREATE TABLE IF NOT EXISTS sijainnit(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        tunniste TEXT,
                        lat TEXT,
                        lon TEXT,
                        aikaleima TEXT
        )`);

    }, 
    (err) => {
        console.log(err);
    });

export default function LisaaSijainti( { navigation } ) {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Käyttäjän syöttämät tiedot
    const [tunnisteTeksti, setTunnisteTeksti] = useState("");

    const lisaa = () => {

    }

    
    useEffect(() => {
        (async () => {
          let { status } = await Location.requestPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          // Haetaan sijaintitiedot ja päivitetään tilamuuttujat
          let location = await Location.getCurrentPositionAsync({});
          setLocation(location);

        })();
      }, []);

    let text = 'Haetaan sijaintitietoja..';
    if (errorMsg) {
    text = errorMsg;
    } else if (location) {
    text = JSON.stringify(location);
    }


    if (location != null){
        return (
            
            <View>
                <Text>{text}</Text>

                <TextInput
                label="Tunniste"
                placeholder="Kirjoita sijainnille tunnisteTekstiteksti..."
                value={tunnisteTeksti}
                onChangeText={tunnisteTeksti => setTunnisteTeksti(tunnisteTeksti)}
                />
                <FAB
                icon="map-marker-plus"
                label="Lisää sijainti"
                onPress={lisaa}
                />
            </View>
           
        )
    } else {
        return (
           
                <Text>{text}</Text>
        
        )
    }
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
