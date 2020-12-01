import * as actionTypes from '../actions/actionTypes';

export const initialReferencesState = {
  ids: [],
  docs: {},
  missing: {},
  user: {
    isPro: true,
  }
}

export default (state = initialReferencesState, action = null) => {
    switch (action.type) {
      case actionTypes.ADD_REFERENCE: {
        const { ref } = action
        console.log("referenceReducer.addReference: " + ref)

        return {
          ...state,
          ids: [...state.ids, ref + ""],
        }
      }

      case actionTypes.REMOVE_REFERENCE: {
        const { ref } = action
        console.log("referenceReducer.removeReference: " + ref)

        const location = state.ids.indexOf(ref + "")
        console.log("location: " + location)

        let newIDs = state.ids
        newIDs.splice(location, 1)

        console.log(newIDs)

        return {
          ...state,
          ids: newIDs,
        }
      }

      case actionTypes.UPDATE_DOCUMENT: {
        const { id, doc } = action
        console.log("referenceReducer.updateDocument: ")

        let newDocs = state.docs
        newDocs[id] = doc
        
        return {
          ...state,
          docs: newDocs
        }
      }

      case actionTypes.UPLOAD_MISSING_DOCUMENT: {
        const { id, doc } = action
        console.log("referenceReducer.uploadMissingDocument")

        newMissing = state.missing
        newMissing[id] = doc
        return {
          ...state,
          missing: newMissing
        }
      }

      case actionTypes.REVERT_STATE: {
        console.log("referenceReducer.resetState: should only be used in debugging")
        return initialReferencesState
      }

      case actionTypes.ENABLE_PRO_FEATURES: {
        console.log("referenceReducer.enableProFeatures: user has upgraded to pro")
        return {
          ...state,
          user: {
            ...state.user,
            isPro: true,
          }
        }
      }

      default:
        return state;
    }
  };