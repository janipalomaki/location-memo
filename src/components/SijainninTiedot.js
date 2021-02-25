import React from 'react';
import { StyleSheet } from 'react-native';

// SQLite tietokannan lukemista varten
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("sijaintitietokanta.db"); // Luodaan tietokantayhteys

// React Native Paper
import { Provider as PaperProvider, Text } from 'react-native-paper';
import { useEffect, useState } from 'react/cjs/react.development';

export default function SijainninTiedot ( { navigation } ) {

  const [sijainnit, setSijainnit] = useState([]);

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

  useEffect(() => {
    haeSijainnit();
  }, []);
  
    return (
      <PaperProvider>
          <Text>Sijainnin tiedot tähän</Text>
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
