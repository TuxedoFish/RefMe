import * as actionTypes from '../actions/citation/actionTypes';

export const initialCitationsState = {
  defaultById: {},
  currentById: {},
  allIds: []
}

export default (state = initialReferencesState, action = null) => {
    
    switch (action.type) {
    
      case actionTypes.ADD_CITATION_ITEM: {
        
      }

      
      case actionTypes.DELETE_CITATION_ITEM: {
        
      }

      
      case actionTypes.CLEAR_HISTORY: {
        
      }

      default:
        return state;
    }
    
  };