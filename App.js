
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

import rootReducer from './reducers/index'

import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

import AppContainer from './navigation/AppNavigator';

const App: () => React$Node = () => {

  const persistConfig = {
    key: 'root',
    storage: AsyncStorage
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer)
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppContainer />
      </PersistGate>
    </Provider>
  );

}

export default App;