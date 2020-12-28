// Imports: Dependencies
import AsyncStorage from '@react-native-community/async-storage';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'
// Imports: Redux
import { rootReducer, initialState } from './reducers';
// Middleware: Redux Persist Config
const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // State reconciler
  stateReconciler: hardSet, 
  // Whitelist
  whitelist: ['references', 'history', 'citations']
};
// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// Redux: Store
const store = createStore(
  persistedReducer,
  initialState,
  applyMiddleware(
    createLogger(),
  ),
);
// Middleware: Redux Persist Persister
const persistor = persistStore(store);

// Exports
export {
  store,
  persistor,
};