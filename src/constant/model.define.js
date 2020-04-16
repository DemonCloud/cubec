const MODEL = {
  DEFAULT_OPTION: {
    data: {},
  },

  IGNORE_KEYWORDS: [
    // sign
    'name',
    'data',

    // core
    'constructor',
    'events',
    'change',
    'plugin',
    'isLocked',

    // api
    'set',
    'get',
    'lock',
    'unlock',
    'on',
    'off',
    'emit',
    'remove',
    'request',

    // private
    '_mid',
    '_ast',
    '_asl',
    '_asc',
    '_ascl',
    '_l',
    '_c',
  ],

  EMULATEHTTP: {
    get: 'GET',
    send: 'GET',
    post: 'POST',
    sync: 'POST',
    put: 'POST',
    delete: 'POST',
    patch: 'POST',
    fetch: 'GET',
  },

  REQUEST_OPTIONS: {
    type: "get",
    async: true,
    cache: false,
    emulateJSON: false,
    param: {},
    header: { 'X-HTTP-Request-From':  'cubec.model' }
  },

  LINKTYPES: {
    runtime: "runtime",
    before: "before",
    solve: "solve",
    catch: "catch"
  },

  // core api
  ALLOWLINKAPIS: [
    "get",
    "set",
    "remove",
    "request",
  ],

  ALLOWLINKTYPES: [
    "before",
    "solve",
    "catch",
    "runtime"
  ],

  ASYNCLINKAPIS: {
    request: true,
  },

  LINKTYPESPROXYMAPPING: {
    before: "_b",
    runtime: "_r",
    solve: "_s",
    catch: "_c",
  }

};

export default MODEL;
