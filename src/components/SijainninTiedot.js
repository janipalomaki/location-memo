import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text } from 'react-native-paper';

// SQLite tietokannan lukemista varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys


export default function SijainninTiedot ( {route, navigation } ) {

  const { id, tiedot } = route.params; // Sijainnin tiedot aloitusnäkymästä (tiedot sijaintietokannasta)

  // Tilamuuttujat kuvaustoimintoa varten
  const [kuvaustila, setKuvaustila] = useState(false);
  const [kuvaustilaInfo, setKuvaustilaInfo] = useState("");
  const [virhe, setVirhe] = useState(null);
  const [kameranRef, setKameranRef] = useState(null);
  const [kuvanTiedot, setKuvanTiedot] = useState(null);
  const [kuvat, setKuvat] = useState([]);

  // TIETOKANNAN HALLINTA - muokataan sijaintitietoa tietokannassa
  const muokkaaSijainninTiedot = () => {

    db.transaction(
        (tx) => {
            // Muutetaan data tallennettavaan muotoon ennen tallentamista (string)
            let tallenneJson = uusiSijaintiDialogi.uusiSijainti; // TÄMÄ MUUTETTAVA!
            let tallenneString = JSON.stringify(tallenneJson);
            tx.executeSql(`UPDATE OMATSIJAINNIT SET (sijainti) VALUES (?)`, [tallenneString], 
            (_tx, rs) => {
                haeSijainnit();
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
      setKuvaustila(false);
      setUusiKuvaDialogi({ nayta : true, teksti : "", kuvanTiedot : kuvanTiedot });
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
