import { combineReducers } from 'redux';
import { initialHistoryState } from './historyStoredReducer';
import { initialCitationsState } from './citationStoredReducer';
import references, { initialReferencesState } from './referenceReducer';

// Redux: Root Reducer
export const rootReducer = combineReducers({
    references: references
});

export const initialState = {
    references: initialReferencesState,
    history: initialHistoryState,
    citations: initialCitationsState
}