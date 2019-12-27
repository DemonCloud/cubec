const returnTrue = function(){ return true; };

const ROUTER = {
  DEFAULT_OPTION: {
    routes: {},
    actions: {},
    events: {
      beforeActions: returnTrue
    }
  },

  IGNORE_KEYWORDS: [
    'targets',
    'routes',
    'actions',
    'events',

    '_rid',
    '_assert',
    '_status',
    '_idmap',
    '_clear',
    '_s',
    '_c',
  ],
};

export default ROUTER;
