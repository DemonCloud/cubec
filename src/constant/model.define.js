const MODEL = {
  DEFAULT_OPTION: {
    data: {},
    verify: {},
    emulateJSON: true
  },
  IGNORE_KEYWORDS: [
    'name',
    'data',
    'store',
    'change',
    'events',
    'verify',
    'filter',
    'lock',
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
};

export default MODEL;
