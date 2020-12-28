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
        
      }

      
      case actionTypes.DELETE_CITATION_ITEM: {
        
      }

      
      case actionTypes.CLEAR_CITATIONS: {
        
      }

      default:
        return state;
    }
    
  };