import * as actionTypes from '../actions/meta/actionTypes';

export const initialMetaState = {
  byId: [],
  allIds: []
}

export default (state = initialReferencesState, action = null) => {
    
    switch (action.type) {
    
      case actionTypes.AMEND_FLAG: {
        
      }

      default:
        return state;
    }

  };