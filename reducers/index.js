import { combineReducers } from 'redux';
// V2.0 Updated reducers
import { history, initialHistoryState } from './historyStoredReducer';
import { citations, initialCitationsState } from './citationStoredReducer';

// V1.0 Deprecated 
import { references, initialReferencesState } from './referenceReducer';

// Redux: Root Reducer
export const rootReducer = combineReducers({
    references: references,
    history: history,
    citations: citations
});

export const initialState = {
    references: initialReferencesState,
    history: initialHistoryState,
    citations: initialCitationsState
}