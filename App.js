
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers'

import { createLogger } from 'redux-logger';

import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import { PersistGate } from 'redux-persist/integration/react';

import AppContainer from './navigation/AppNavigator';

const App: () => React$Node = () => {

  // Middleware: Redux Persist Config
  const persistConfig = {
    // Root
    key: 'root',
    // Storage Method (React Native)
    storage: AsyncStorage
  };
  
  // Middleware: Redux Persist Persisted Reducer
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  
  // Redux: Store
  const store = createStore(
    persistedReducer,
    applyMiddleware(
      createLogger(),
    ),
  );

  // Middleware: Redux Persist Persister
  let persistor = persistStore(store);
  
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