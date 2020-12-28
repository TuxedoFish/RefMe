import * as actionTypes from './actionTypes'

export const pushToHistory = (id, item) => ({
	id,
	item,
	type: actionTypes.PUSH_TO_HISTORY,
})

export const deleteHistoryItem = (id) => ({
	id,
	type: actionTypes.DELETE_HISTORY_ITEM,
})

export const clearHistory = () => ({
	type: actionTypes.CLEAR_HISTORY,
})