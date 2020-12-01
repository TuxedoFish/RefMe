// Imports: Dependencies
import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'
import { initialReferencesState } from './reducers/referenceReducer'
// Imports: Redux
import rootReducer from './reducers';
// Middleware: Redux Persist Config
const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // State reconciler
  stateReconciler: hardSet, 
  // Whitelist
  whitelist: ['references']
};
// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// Redux: Store
const store = createStore(
  persistedReducer,
  {references: initialReferencesState},
  applyMiddleware(
    createLogger(),
  ),
);
// Middleware: Redux Persist Persister
const persistor = persistStore(store);

AsyncStorage.getAllKeys((err, keys) => {
  AsyncStorage.multiGet(keys, (error, stores) => {
    stores.map((result, i, store) => {
      console.log('log async: ',{ [store[i][0]]: store[i][1] });
      return true;
    });
  });
});

// Exports
export {
  store,
  persistor,
};