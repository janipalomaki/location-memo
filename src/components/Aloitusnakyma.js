import React from 'react';
import { useEffect, useState } from 'react/cjs/react.development';

import { View, StyleSheet } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text, FAB, List, TextInput } from 'react-native-paper';

// Expo Location - sijaintitiedot puhelimesta
import * as Location from 'expo-location';

// SQLite tietokannan lukemista varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys

// Luodaan tietokanta
db.transaction(
  (tx) => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS sijainnit(
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      sijainti TEXT
      )`);

  }, 
  (err) => {
      console.log(err);
  });


export default function Aloitusnakyma( { navigation } ) {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const [tunnisteTeksti, setTunnisteTeksti] = useState("");
    const [sijaintiTiedot, setSijaintiTiedot] = useState({})

  const [sijainnit, setSijainnit] = useState([]);

// TIETOKANNAN HALLINTA
  // Haetaan sijainnit tietokannasta
  const haeSijainnit = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(`SELECT * FROM sijainnit`, [], 
          (_tx, rs) => {
            setSijainnit(rs.rows._array);
          }
        )
      }, 
      (err) => {
        console,log(err);
      });
  }

  // Lisätään sijainti tietokantaan
  const lisaa = () => {
    db.transaction(
        (tx) => {
            tx.executeSql(`INSERT INTO sijainnit (sijainti) VALUES (?)`, [], 
            (_tx, rs) => {
                setSijainnit(rs.rows._array);
            }
            )
        }, 
        (err) => {
            console,log(err);
        });

  }

  // SIJAINTITIEDOT
  useEffect(() => {
    haeSijainnit(); // Haetaan tallennetut sijainnit

    // Pyydetään lupaa käyttää laitteen sijaintitietoja
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

    return (
      <PaperProvider>
      
      <Text>{text}</Text>
     
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
      />

      </PaperProvider>

      // DIALOGI
      // Lisää sijainti dialogi tähän! ks. video 4
      /*
            
              if (location != null){
                  return (
                      
                      <View>
                          <Text>{text}</Text>

                          <TextInput
                          label="Tunniste"
                          placeholder="Kirjoita sijainnille tunnisteteksti..."
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
      */


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
