import React, { useEffect, useState } from 'react';
import { Camera } from "expo-camera";
import { StyleSheet, Image } from 'react-native';

// React Native Paper
import { Provider as PaperProvider, Text, FAB, Card, Portal, Dialog, TextInput, Button, Paragraph } from 'react-native-paper';

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

  // Dialogi ikkuna
  const [uusiKuvaDialogi, setUusiKuvaDialogi] = useState({
    nayta : false,
    kuvanTiedot : [],
    teksti : ""
});

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

  
  // TIETOKANNAN HALLINTA - muokataan sijaintitietoa tietokannassa
  const lisaaKuva = () => {

    setUusiKuvaDialogi({ nayta : false, kuvanTiedot : "", teksti : ""});

    db.transaction(
        (tx) => {
            // Muutetaan data stringiksi ennen tallentamista
            let tallenneJson = uusiKuvaDialogi.kuvanTiedot.uri;
            let tallenneString = JSON.stringify(tallenneJson);
           
            tx.executeSql(`UPDATE TALLENNETUTSIJAINNIT SET kuva = ${tallenneString} WHERE id = ?`, [id]);
            (_tx, rs) => {
                console.log(_tx);
            }
            
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

      setKuvaustila(false);   
      setUusiKuvaDialogi({ nayta : true, kuvanTiedot : kuvanTiedot, teksti : "" });
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
        <Card style={styles.kortti}>
          <Card.Title title={tiedot.teksti}></Card.Title>
          
          <Card.Content>
          <Paragraph>Leveysaste: {tiedot.lat}</Paragraph>
          <Paragraph>Pituusaste: {tiedot.lon}</Paragraph>
        
          <FAB
          icon="camera-plus"
          label="Ota kuva sijainnista"
          style={styles.iconCamera}
          onPress={kaynnistaKamera}
          />
          {(virhe) // Jos kameratoimintoa ei voida ottaa käyttöön
          ? <Text>{virhe}</Text> 
          : null
          }
          
          {(kuvatiedostot) // Jos kuvatiedostoja löytyy
          ?<Card.Content>
            <Image
            style={styles.kuva}
            source={{ uri : kuvatiedostot }}
            />
              <FAB 
              style={styles.naviEdellinen}
              mode="contained"
              icon="chevron-left"
              onPress={edellinen}
              />
              <FAB
              style={styles.naviSeuraava}
              mode="contained"
              icon="chevron-right"
              onPress={seuraava}
              />
            </Card.Content>
          : null
          }
          </Card.Content>     
        </Card>

        <Portal>
          <Dialog visible={uusiKuvaDialogi.nayta} onDismiss={() => { setUusiKuvaDialogi({ nayta : false, kuvanUri : kuvanTiedot.uri, teksti : ""})}}>
            <Dialog.Title>Tallenna kuvan tiedot:</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Anna kuvan nimi..."
                mode="outlined"
                placeholder="Kuva..."
                onChangeText={ (teksti) => { setUusiKuvaDialogi( {...uusiKuvaDialogi, teksti: teksti} ) } }
                />
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
              mode="contained"
              onPress={() => {
                lisaaKuva();
              }}
              >Tallenna</Button>
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
      left: 0,
    },
    kameranakyma : {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', 
    },
    kuva : {
      width: 225, 
      height: 300, 
      resizeMode: 'stretch',
    },
    iconDelete : {
      marginLeft : 200,
      marginBottom : 30,
      padding : 2
    },
    iconCamera : {
      marginBottom : 30,
      padding : 2,
      marginTop : 25
    },
    appbar : {
      marginTop: 50
    },
    kortti : {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', 
    },
    naviEdellinen: {
      position: 'absolute',
      margin: 10,
      bottom: -100,
      left: 0
    },
    naviSeuraava: {
      position: 'absolute',
      margin: 10,
      bottom: -100,
      right: 0
    },
   
  });
