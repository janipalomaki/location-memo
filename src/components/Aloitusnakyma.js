import React from 'react';
import { useEffect, useState } from 'react/cjs/react.development';

import { View, StyleSheet, Button } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text, FAB, List, TextInput, Portal, Dialog } from 'react-native-paper';

// Expo Location - sijaintitiedot puhelimesta
import * as Location from 'expo-location';

// SQLite tietokannan lukemista varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys

// Luodaan tietokanta
db.transaction(
  (tx) => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS OMATSIJAINNIT(
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

  // Tietokantaan tallennetut sijainnit tilamuuttujassa
  const [sijainnit, setSijainnit] = useState([]);

  // Dialogi
  const [uusiSijaintiDialogi, setUusiSijaintiDialogi] = useState({
                                                        nayta : false,
                                                        uusiSijainti : []
                                                        })

// TIETOKANNAN HALLINTA

  // Tyhjennetään tietokannan taulu
  const tyhjennaTiedot = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(`DELETE FROM OMATSIJAINNIT`, [], 
          (_tx, rs) => {
            haeSijainnit();
          }
        )
      }, 
      (err) => {
        console,log(err);
      });
  }

  // Haetaan sijainnit tietokannasta
  const haeSijainnit = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(`SELECT * FROM OMATSIJAINNIT`, [], 
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
  const lisaaSijainti = () => {

    // Suljetaan ja tyhjennetään dialogi
    setUusiSijaintiDialogi({ nayta : false, uusiSijainti : ""});

    db.transaction(
        (tx) => {
            let tallenneJson = uusiSijaintiDialogi.uusiSijainti;
            let tallenneString = JSON.stringify(tallenneJson);
            console.log(tallenneString);
            tx.executeSql(`INSERT INTO OMATSIJAINNIT (sijainti) VALUES (?)`, [tallenneString], 
            (_tx, rs) => {
                haeSijainnit();
            }
            )
        }, 
        (err) => {
            console.log(err);
        });

  }

  // SIJAINTITIEDOT
  useEffect(() => {
    haeSijainnit(); // Haetaan tallennetut sijainnit kun sovellus käynnistyy

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
    text = "";
    }
    
    return (
    <PaperProvider>
      
    <Text>{text}</Text>

    {(sijainnit.length > 0)


    ? sijainnit.map((sijainti, idx) => {

      let sijaintiObj = JSON.parse(sijainti.sijainti);
      let d = new Date(sijaintiObj.aikaleima);
      let paivamaara = d.toString();

      return(
      <List.Item
      onPress={ () => navigation.navigate("Sijainnin tiedot")}
      key={sijainti.id}
      title={sijaintiObj.teksti}
      description={paivamaara}
      left={props => <List.Icon {...props} icon="map-marker" />}
      right={props =>
            <List.Icon
            {...props} 
            icon="plus-box" 
            />
            }
            />
      )

    })
    : <Text>Ei tallennettuja sijainteja</Text>
    }
     
      <FAB 
      style={styles.nappiLisaa}
      icon="map-marker-plus"
      onPress={() => {
        setUusiSijaintiDialogi({
          nayta : true,
          uusiSijainti : ""
        })
      }}
      />
       <FAB 
      style={styles.nappiPoista}
      icon="delete-forever"
      onPress={tyhjennaTiedot}
      />

      <Portal>
        <Dialog visible={uusiSijaintiDialogi.nayta} onDismiss={() => { 
          setUusiSijaintiDialogi({ 
          nayta : false, 
          uusiSijainti : ""
          })}}>
          <Dialog.Title>Tallenna sijainnin tiedot:</Dialog.Title>
          <Dialog.Content>

          <TextInput
            label="Tunnisteteksti"
            mode="outlined"
            placeholder="Kirjoita sijainnille tunnisteteksti..."
            onChangeText={ (teksti) => { setUusiSijaintiDialogi( {
            ...uusiSijaintiDialogi, 
            uusiSijainti : {
                lat : location.coords.latitude,
                lon : location.coords.longitude,
                aikaleima : location.timestamp,
                teksti: teksti
            }
          })}}
            />

          </Dialog.Content>

          <Dialog.Actions>
            <FAB 
            label="Lisää sijainti"
            mode="contained"
            onPress={lisaaSijainti}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
    },
    nappiPoista: {
      position : "absolute",
      margin: 20,
      bottom: 15,
      left: 75,
    }
  
  });