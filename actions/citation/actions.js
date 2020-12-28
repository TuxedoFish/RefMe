import * as actionTypes from './actionTypes'

export const addCitationItem = (id, item) => ({
	id, 
	item,
	type: actionTypes.PUSH_TO_HISTORY,
})

export const deleteCitationItem = (id) => ({
	id,
	type: actionTypes.DELETE_HISTORY_ITEM,
})

export const clearCitations = () => ({
	type: actionTypes.CLEAR_CITATIONS,
})