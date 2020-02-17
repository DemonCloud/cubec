const ERRORS = {
  MODEL_UNEXPECT:
    '[cubec model] unexpect cubec.model with only data that accepts a standard JSON type object.',
  MODEL_DEFAULT_PARSE:
    '[cubec model] the fetch data with default parse error, please check server response data format with model-{ catch } event!',
  MODEL_LINK_REQUEST_LOCKED:
    '[cubec model.[link]] [API: request] model has locked, the request was interrupted',
  MODEL_LINK_REQUEST_WITHOUT_URL:
    '[cubec model.[link]] [API: request] request options without [url] param, the request was interrupted',
  MODEL_LINK_REQUEST_RUNTIME_CATCH:
    '[cubec model.[link]] [API: request[runtime]] catch request link interrupted',
  MODEL_LINK_REQUEST_SOLVE_CATCH:
    '[cubec model.[link]] [API: request[solve]] catch request link interrupted',
  MODEL_LINK_REQUEST_HTTP_CATCH:
    '[cubec model.[link]] [API: request] catch request link [http] unexpected error',
  MODEL_LINK_UPDATE_LOCKED:
    '[cubec model.[link]] [API: update] model has locked, the update was interrupted',
  MODEL_LINK_UPDATE_WITHOUT_URL:
    '[cubec model.[link]] [API: update] update options without [url] param or not define [url] property on model initialize, the update was interrupted',
  MODEL_LINK_UPDATE_RUNTIME_CATCH:
    '[cubec model.[link]] [API: update[runtime]] catch update link interrupted',
  MODEL_LINK_UPDATE_SOLVE_CATCH:
    '[cubec model.[link]] [API: update[solve]] catch update link interrupted',
  MODEL_LINK_UPDATE_SOLVE_FORMAT_CATCH:
    '[cubec model.[link]] [API: update[solve]] catch update link interrupted, [solve] data is not plainObject format',
  MODEL_LINK_UPDATE_HTTP_CATCH:
    '[cubec model.[link]] [API: update] catch update link [http] unexpected error',


  VIEW_MISSING_ROOT:
    '[cubec view] unexpect cubec.view must defined real root element node',
  VIEW_MOUNT:
    '[cubec view] view mount position is not a pure HTMLElement or Node',
  VIEW_RENDER:
    '[cubec view] render throw error with using illegality arguments',
  VIEW_CUSTOM_RENDER:
    '[cubec view] [custom]* render throw error with using illegality arguments',
  VIEW_SWITCHTEMPLATE:
    '[cubec view] switch template fail with error arguments',


  ATOM_UNDEFINED_MODELNAME:
    '[cubec atom] unexpect model name that atom can find it',
  ATOM_MISSING_MODELINSTANCE:
    '[cubec atom] can not find target modal with atom.swap method',
  VERIFY_ISCHECKER_UNEXCEPT:
    '[cubec verify] verify.is... checker [ArrayOf,ObjectOf, MultipleOf] generator is not function, please checkout the arguments',
};

export default ERRORS;
