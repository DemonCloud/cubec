// adapter for IE
// FUCK IE9
// JUST FUCK Internet Explorer, FUCK!!!
// detector IE version IE9 - IE11, Also it can include Edge
function IEVersion() {
  const ua = window.navigator.userAgent;

  const msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  const trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    const rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  // skip Edge
  // const edge = ua.indexOf('Edge/');
  // if (edge > 0) {
  //   // Edge => return version number
  //   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  // }

  // other browser
  return 0;
}

export const isIE = IEVersion();
