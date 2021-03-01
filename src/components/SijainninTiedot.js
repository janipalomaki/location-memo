import React, { useEffect, useState } from 'react';
import { Camera } from "expo-camera";
import { StyleSheet, Image } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text, FAB, Card, Portal, Dialog, TextInput, Button } from 'react-native-paper';

// SQLite tietokannan lukemista varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys


export default function SijainninTiedot ( {route, navigation } ) {

  const { id, tiedot, kuvatiedostot } = route.params; // Sijainnin tiedot aloitusnäkymästä (tiedot sijaintietokannasta)

  // Tilamuuttujat kuvaustoimintoa varten
  const [kuvaustila, setKuvaustila] = useState(false);
  const [kuvaustilaInfo, setKuvaustilaInfo] = useState("");
  const [virhe, setVirhe] = useState(null);
  const [kameranRef, setKameranRef] = useState(null);
  const [kuvanTiedot, setKuvanTiedot] = useState(null);
  const [kuvat, setKuvat] = useState([]);

  const edellinen = () => {
    if (idx != 0) {
      setIdx(idx - 1);
    }
  }

  const seuraava = () => {
    let ylaraja = Number(kuvat.length) - 1;

    if (idx != ylaraja){
      setIdx(idx + 1);
    }
  }

  // Dialogi ikkuna
  const [uusiKuvaDialogi, setUusiKuvaDialogi] = useState({
    nayta : false,
    kuvanTiedot : []
});

  // TIETOKANNAN HALLINTA - muokataan sijaintitietoa tietokannassa
  const muokkaaSijainninTiedot = () => {
    setUusiKuvaDialogi({ nayta : false, kuvanTiedot : "" });

    db.transaction(
        (tx) => {
            // Muutetaan data tallennettavaan muotoon ennen tallentamista (string)
            let uri = uusiKuvaDialogi.kuvanTiedot.uri;
            let uriString = JSON.stringify(uri);
           
            tx.executeSql(`UPDATE TALLENNETUTSIJAINNIT SET kuva = ${uriString} WHERE id = ${id}`, 
            (_tx, rs) => {
                console.log(_tx);
            }
            )
        }, 
        (err) => {
            console.log(err);
        });
  }


  // --- Kameratoiminnot ---
  const kaynnistaKamera = async () => {

    setKuvaustilaInfo("");

    const {status} = await Camera.requestPermissionsAsync(); // Kysytään lupaa (is status granted?)

    if (status === "granted") {

      setKuvaustila(true);

    } else {
      setVirhe("Kamera ei saatavilla"); // Jos lupaa ei anneta
    }

  }

  const otaKuva = async () => {

    setKuvaustilaInfo("Tallennetaan kuvaa...");

    if (kameranRef) {

      const kuvanTiedot = await kameranRef.takePictureAsync();

      setKuvanTiedot(kuvanTiedot);
      setKuvat(kuvanTiedot.uri);
      setKuvaustila(false);
      setUusiKuvaDialogi({ nayta : true, kuvanTiedot : kuvanTiedot });
    }

  }

    return (



      (kuvaustila) // Jos kuvaustila päällä
    ?<Camera style={styles.kameranakyma} ref={ (r) => { setKameranRef(r) }}>
      <Text style={{color: "#fff"}}>{kuvaustilaInfo}</Text>
      
      <FAB
      style={styles.nappiSulje}
      icon="close"
      label="sulje"
      small
      onPress={() => {
        setKuvaustila(false);
      }}
      />

      <FAB
      style={styles.nappiOtaKuva}
      icon="camera"
      label="Ota kuva"
      onPress={() => {
        otaKuva();
      }}
      />
    </Camera>

      // Jos kuvaustila ei ole päällä
      :<PaperProvider>
          <Text>{JSON.stringify(id)}</Text>
          <Text>{JSON.stringify(tiedot)}</Text>
          <Text>{JSON.stringify(kuvatiedostot)}</Text>

          <FAB
          icon="camera-plus"
          style={styles.iconCamera}
          onPress={kaynnistaKamera}
          />

    
      <Text>{virhe}</Text>

      {(!kuvat) // Näytetään kuvat tässä (Jos kuvia löytyy tilamuuttujasta)
      ?<Card style={styles.kortti}>
        <Card.Content>
        <Image
          style={styles.kuva}
          source={{ uri : kuvat[idx].kuvanUri }}
        /> 
        <Title>{kuvat[idx].teksti}</Title>
        <Card.Actions style={styles.kortti}>
              <FAB 
              style={styles.navi}
              mode="contained"
              icon="chevron-left"
              onPress={edellinen}
              />
              <FAB
              style={styles.navi}
              mode="contained"
              icon="chevron-right"
              onPress={seuraava}
              />
        </Card.Actions>
        </Card.Content>
      </Card>

      // Jos kuvaa ei ole määritelty niin null
      : null
      }

    
        <Portal>
          <Dialog visible={uusiKuvaDialogi.nayta} onDismiss={() => { setUusiKuvaDialogi({ nayta : false, kuvanUri : kuvanTiedot.uri })}}>
            <Dialog.Title>Kuva on valmis </Dialog.Title>
            <Dialog.Content>
             
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
              mode="contained"
              onPress={() => {
                muokkaaSijainninTiedot();
              }}
              >Ok</Button>
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
    icon : {
      padding : 10,
      marginTop : 50,
      margin : 20
    },
    nappiSulje: {
      position: 'absolute',
      margin: 20,
      bottom: 0,
      right: 0
    },
    nappiOtaKuva: {
      position: 'absolute',
      margin: 20,
      bottom: 0,
      left: 0
    },
    kameranakyma : {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', 
    },
    kuva : {
      width: 300, 
      height: 400, 
      resizeMode: 'stretch',
    },
    iconDelete : {
      marginLeft : 200,
      marginBottom : 30,
      padding : 2
    },
    iconCamera : {
      marginLeft : 20,
      marginBottom : 30,
      padding : 2
    },
    appbar : {
      marginTop: 50
    },
    kortti : {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', 
    },
    navi : {
      padding : 2,
      margin : 25
    }
   
  });
