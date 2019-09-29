const MODEL = {
  DEFAULT_OPTION: {
    data: {},
  },
  IGNORE_KEYWORDS: [
    'name',
    'data',
    'store',
    'history',
    'change',
    'events',
    'verify',
    'filter',
    'lock',

    '_ast',
    '_mid',
    '_asl',
    '_asv',
    '_asc',
    '_ash',
    '_v',
    '_l',
    '_c',
    '_h',
    '_s'
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
    header: {'X-HTTP-Request-From': 'cubec.model'}
  },
  UPDATE_OPTIONS: {
    type: "get",
    async: true,
    cache: false,
    emulateJSON: false,
    param: {},
    header: {'X-HTTP-Request-From': 'cubec.model'}
  },
  LINKPERSET: [],
  ALLOWLINKAPIS: [
    "get",
    "set",
    "remove",
    "back",
    "update",
    "request",
  ],
  ALLOWLINKTYPES: [
    "before", "solve", "catch"
  ],
  ALLOWLINKTYPESWITHRUNTIME: [
    "before", "solve", "catch", "runtime"
  ],
  ASYNCLINKAPIS: {
    update: true,
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
