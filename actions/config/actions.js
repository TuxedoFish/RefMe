import * as actionTypes from './actionTypes'

export const updateConfig = (config) => ({
    config,
	type: actionTypes.UPDATE_CONFIG,
})