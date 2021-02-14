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
  byId: {},
  allIds: []
}

export const history = (state = initialHistoryState, action = null) => {
    
    switch (action.type) {
    
      case actionTypes.PUSH_TO_HISTORY: {
        
        const { id, item } = action

        // Update the items 
        let { byId: items, allIds: ids } = state
        items[id] = item
        
        // Remove old id and re-add to retain time order
        if(ids.includes(id)) { 
          for( var i = 0; i < ids.length; i++){ 
            if (ids[i] === id) { ids.splice(i, 1);}
          }
        }
        ids.unshift(id)

        console.log(id)
        console.log(item.currentpage)

        return {
          byId: items,
          allIds: ids
        }
      }

      
      case actionTypes.DELETE_HISTORY_ITEM: {
        
      }

      
      case actionTypes.CLEAR_HISTORY: {
        return initialHistoryState
      }

      default:
        return state;
    }

  };