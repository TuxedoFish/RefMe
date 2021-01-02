// DD/MM HH:mm
export function formatDateForHistory(date) {
    const formatted_date = appendLeadingZeroes(date.getDate()) + "/" + appendLeadingZeroes((date.getMonth() + 1))
      + " " + appendLeadingZeroes(date.getHours()) + ":" + appendLeadingZeroes(date.getMinutes())
    return formatted_date
}

// DD MMM YYYY
export function formatDateForReference(date) {
  const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let formatted_date = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
  return formatted_date
}

// DD MMM. YYYY
export function formatDateForHarvardReference(date) {
  const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let formatted_date = date.getDate() + " " + months[date.getMonth()] + ". " + date.getFullYear()
  return formatted_date
}

// 2019, April 10 (example)
export function formatDateForMLAReference(date) {
  const months = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let formatted_date = date.getFullYear() + " " + months[date.getMonth()] + ". " + date.getDate()
  return formatted_date
}

// April 2019 (example)
export function formatDateForRSCReference(date) {
  const months = ["January", "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let formatted_date = months[date.getMonth()] + " " + date.getFullYear()
  return formatted_date
}

export function getDateFromISOString(ISOString) {
  return new Date(Date.parse(ISOString))
}

export function getDateFromX5gonString(x5gonString) {
  const start = 2
  const year = x5gonString.substring(start, start+4)
  const month = x5gonString.substring(start+4, start+6)
  const day = x5gonString.substring(start+6, start+8)
  return new Date(year, month, day)
}

function appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
}