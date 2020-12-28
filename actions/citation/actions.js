import * as actionTypes from './actionTypes'

export const addCitationItem = (id, item) => ({
	id, 
	item,
	type: actionTypes.ADD_CITATION_ITEM,
})

export const deleteCitationItem = (id) => ({
	id,
	type: actionTypes.DELETE_CITATION_ITEM,
})

export const clearCitations = () => ({
	type: actionTypes.CLEAR_CITATIONS,
})