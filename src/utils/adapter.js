// FUCK IE9
// JUST FUCK Internet Explorer, FUCK!!!
const UA = window.navigator.userAgent.toLowerCase();

export const isIE = (UA.indexOf('msie') != -1) ? parseInt(UA.split('msie')[1]) : false;
