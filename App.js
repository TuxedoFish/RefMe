import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

import rootReducer from './reducers/index'

import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';

// Imports: Redux Persist Persister
import { store, persistor } from './store';

import AppContainer from './navigation/AppNavigator';

export default class App extends React.Component {
  
  constructor() {
    super()
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppContainer />
        </PersistGate>
      </Provider>
    );
  }

}