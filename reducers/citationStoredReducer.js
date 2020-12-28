import * as actionTypes from '../actions/citation/actionTypes';

// V 1.0 schema (uid is using x5gon id):
// (default/current)ById: [
  // 10937: {
  //   id: 10937,
  //   author: "John Doe",
  //   title: "ML Algorithms",
  //   uploadedDate: 30817921,
  //   accessedDate: 30817921,
  //   publisher: "VideoLectures.Net",
  //   url: "https://www.website.com",
  //   pages: "1-4",
  //   ...
  // }
// allIds: [10937]
// ]
// For V2.0 => ( Future: journal issue number / journal volume number / journal )
export const initialCitationsState = {
  defaultById: {},
  currentById: {},
  allIds: []
}

export const citations = (state = initialCitationsState, action = null) => {
    
    switch (action.type) {
    
      case actionTypes.ADD_CITATION_ITEM: {
        
        // Get the params
        const { id, item } = action

        // Update the items 
        let { defaultById: defaultItems, currentById: currentItems, allIds: ids } = state
        
        // If it is already a citation then do nothing - error catching
        if(ids.includes(id)) { 
          return state
        }
        
        defaultItems[id] = item
        currentItems[id] = item
        ids.unshift(id)

        return {
          defaultById: defaultItems,
          currentById: currentItems,
          allIds: ids
        }
      }

      
      case actionTypes.DELETE_CITATION_ITEM: {
        
        // Get the params
        const { id, item } = action

        // Update the items 
        let { defaultById: defaultItems, currentById: currentItems, allIds: ids } = state

        // If it is isn't a citation then do nothing - error catching
        if(!ids.includes(id)) { 
          return state
        }

        // Remove from all ids
        for( var i = 0; i < ids.length; i++){ 
          if (ids[i] === id) { ids.splice(i, 1);}
        }

        // Delete the citation
        delete defaultItems[id]
        delete currentItems[id]

        return {
          defaultById: defaultItems,
          currentById: currentItems,
          allIds: ids
        }
      }

      
      case actionTypes.CLEAR_CITATIONS: {
        
      }

      default:
        return state;
    }
    
  };