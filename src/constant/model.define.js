const MODEL = {
  DEFAULT_OPTION: {
    data: {},
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

    '_ast',
    '_mid',
    '_asl',
    '_asv',
    '_asc',
    '_v',
    '_l',
    '_c',
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
};

export default MODEL;
