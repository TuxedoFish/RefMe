export function convertISOString(ISOString) {
    const date = new Date(Date.parse(ISOString))
    const formatted_date = appendLeadingZeroes(date.getDate()) + "/" + appendLeadingZeroes((date.getMonth() + 1))
      + " " + appendLeadingZeroes(date.getHours()) + ":" + appendLeadingZeroes(date.getMinutes())
    return formatted_date
}

export function getYearFromISOString(ISOString) {
  const date = new Date(Date.parse(ISOString))
  const formatted_date = appendLeadingZeroes(date.getDate()) + "/" + appendLeadingZeroes((date.getMonth() + 1))
    + " " + appendLeadingZeroes(date.getHours()) + ":" + appendLeadingZeroes(date.getMinutes())
  return formatted_date
}

export function getDateFromISOString(ISOString) {
  const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(Date.parse(ISOString))
  let formatted_date = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
  return formatted_date
}

function appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
}