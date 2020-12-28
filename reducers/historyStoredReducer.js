import * as actionTypes from '../actions/history/actionTypes';

// V 1.0 schema (uid is using x5gon id):
// byId: [
  // 10937: {
  //   id: 10937,
  //   currentpage: 1,
  //   length: 5, 
  //   lastmodified: 10298401,
  //   ...
  // }
// allIds: [10937]
// ]
export const initialHistoryState = {
  byId: [],
  allIds: []
}

export const history = (state = initialHistoryState, action = null) => {
    
    switch (action.type) {
    
      case actionTypes.PUSH_TO_HSITORY: {
        const { id, item } = action
        console.log("historyStoredReducer.pushToHistory: " + id)

        // Update the items 
        let { byId: items, allIds: ids } = this.state
        items[id] = item
        if(!id in ids) { ids.push(id) }

        return {
          byId: items,
          allIds, ids
        }
      }

      
      case actionTypes.DELETE_HISTORY_ITEM: {
        
      }

      
      case actionTypes.CLEAR_HISTORY: {
        
      }

      default:
        return state;
    }

  };