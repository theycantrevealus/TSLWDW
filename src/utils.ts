export function getRunTime () {
  let today = new Date();
  return today.getHours() + ':' + today.getMinutes();
}
export function getFromTime () {
  let today = new Date();
  return today.getHours() + ':00';
}
export function getCurrentTimestamp () {
  let today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();
  let dda = '';
  let mma = '';
  let todaya = '';

  if (dd < 10) {
    dda = '0' + dd;
  } else {
    dda = dd + '';
  }

  if (mm < 10) {
    mma = '0' + mm;
  } else {
    mma = mm + '';
  }

  todaya = yyyy + '/' + mma + '/' + dda + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

  return todaya;
}
