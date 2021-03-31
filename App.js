/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import secp256k1 from 'react-native-secp256k1';
import {captureScreen} from 'react-native-view-shot';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const veryIntensiveTask = async taskDataArguments => {
  console.log('running veryIntensiveTask.....');
  const {delay} = taskDataArguments;
  await new Promise(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      console.log(i);
      captureScreen({
        format: 'jpg',
        quality: 0.8,
        // result: 'data-uri',
        result: 'base64',
      }).then(
        async uri => {
          console.log('Image URI', uri);
          const privA = await secp256k1.ext.generateKey();
          const privB = await secp256k1.ext.generateKey();

          const pubA = await secp256k1.computePubkey(privA, true);
          const pubB = await secp256k1.computePubkey(privB, true);

          // sign verify
          const data = '1H1SJuGwoSFTqNI8wvVWEdGRpBvTnzLckoZ1QTF7gI0';
          const sigA = await secp256k1.sign(data, privA);
          console.log('verify: ', await secp256k1.verify(data, sigA, pubA));

          // ecdh && aes256
          const encryped1 = await secp256k1.ext.encryptECDH(privA, pubB, uri);
          const decryped1 = await secp256k1.ext.decryptECDH(
            privB,
            pubA,
            encryped1,
          );
          console.log('Encrypted Image URI ', encryped1);
          console.log('Decrypted Image URI ', decryped1);

          /* const data = '1H1SJuGwoSFTqNI8wvVWEdGRpBvTnzLckoZ1QTF7gI0';
          const data = await secp256k1.hex_encode(uri);
          const privA = await secp256k1.ext.generateKey();
          const sigA = await secp256k1.sign(data, privA);
          const pubA = await secp256k1.computePubkey(privA, true);
          console.log('verify: ', await secp256k1.verify(data, sigA, pubA)); */
        },
        error => console.error('Oops, snapshot failed', error),
      );
      await sleep(delay);
    }
  });
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    async function task() {
      const options = {
        taskName: 'Example',
        taskTitle: 'ExampleTask title',
        taskDesc: 'ExampleTask description',
        taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
        },
        color: '#ff00ff',
        parameters: {
          delay: 10000,
        },
      };
      await BackgroundService.start(veryIntensiveTask, options);
    }
    task();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
