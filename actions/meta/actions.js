import * as actionTypes from './actionTypes'

export const amendSetting = (key, value) => ({
    key,
    value,
	type: actionTypes.AMEND_SETTING,
})