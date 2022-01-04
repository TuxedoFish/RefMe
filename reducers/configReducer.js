import * as actionTypes from '../actions/config/actionTypes';

// This should be kept updated as the app updates but will automatically sync with S3
export const initialConfigState = {
  raw: {
    ARTICLES_API: {
      root: "https://34v4w4wx4l.execute-api.eu-west-2.amazonaws.com/default",
      get: "https://34v4w4wx4l.execute-api.eu-west-2.amazonaws.com/default/getArticles/"
    }
  }
}

export const config = (state = initialConfigState, action = null) => {
  switch (action.type) {
    case actionTypes.UPDATE_CONFIG: {
      const { config } = action

      const newState = {
        ...state,
        raw: {
          ...state.raw,
          ...config
        }
      }

      return newState
    }

    default:
      return state;
  }

};