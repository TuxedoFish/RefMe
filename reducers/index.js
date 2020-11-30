import { combineReducers } from 'redux';
import references from './referenceReducer';

// Redux: Root Reducer
const rootReducer = combineReducers({
    references: references
});
// Exports
export default rootReducer;