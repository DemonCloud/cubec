const ERRORS = {
  MODEL_UNEXPECT:
    '[cubec model] unexpect cubec.model with only data that accepts a standard JSON type object.',
  MODEL_DEFAULT_PARSE:
    '[cubec model] the fetch data with default parse error, please check server response data format with model-{ catch } event!',
  VIEW_MISSING_ROOT:
    '[cubec view] unexpect cubec.view must defined real root element node',
  VIEW_MOUNT:
    '[cubec view] view mount position is not a pure HTMLElement or Node',
  VIEW_RENDER:
    '[cubec view] view render static throw error with using illegality arguments',
  VIEW_CUSTOM_RENDER:
    '[cubec view] view {custom} render static throw error with using illegality arguments',
  ATOM_UNDEFINED_MODELNAME:
    '[cubec atom] unexpect model name that atom can find it',
  ATOM_MISSING_MODELINSTANCE:
    '[cubec atom] can not find target modal with atom.swap method',
  VERIFY_ISCHECKER_UNEXCEPT:
    '[cubec verify] verify.is... checker [ArrayOf,ObjectOf, MultipleOf] generator is not function, please checkout the arguments',
};

export default ERRORS;
