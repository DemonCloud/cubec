const ERRORS = {
  MODEL_UNEXPECT:
    'unexpect c.model with only data that accepts a standard JSON type object.',
  MODEL_DEFAULT_PARSE: '[cubec model] the fetch data with default parse error, please check server response data format with model-{ catch } event!',
  VIEW_MISSING_ROOT: 'unexpect c.view must defined real root element node',
  VIEW_MOUNT: 'view mount position is not a pure HTMLElement or Node',
  VIEW_RENDER: 'view render static throw error with using illegality arguments',
  VIEW_CUSTOM_RENDER: 'view {custom} render static throw error with using illegality arguments',
  ATOM_UNDEFINED_MODELNAME: 'unexpect model name that atom can find it',
  ATOM_MISSING_MODELINSTANCE: 'can not find target modal with atom.swap',
};

export default ERRORS;
