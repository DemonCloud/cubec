import { registerLink } from '../linkSystem';
import {
  _idt,
  _isFn,
  _cool,
} from '../../usestruct';

const linkProto = "parse";
const linkType = {
  runtime: "runtime",
  before: "before",
  solve: "solve",
  catch: "catch"
};
const asyncLinkType = {
  update: true,
  request: true
};

const runtimeRequestMultip = "multip";

// update parse
// m.link(m.update).parse(parser);
const parseLink = function(parser){
  const linkAdapter = this._a;
  const useParser = _isFn(parser) ? parser : _cool;

  return asyncLinkType[linkAdapter] ? function(datas, types){
    return useParser[types === runtimeRequestMultip ? "apply" : "call"](null, datas);
  } : useParser;
};

registerLink("set"     , linkProto , linkType.before  , parseLink);
registerLink("update"  , linkProto , linkType.runtime , parseLink);
registerLink("request" , linkProto , linkType.runtime , parseLink);
registerLink("remove"  , linkProto , linkType.solve   , parseLink);
registerLink("get"     , linkProto , linkType.solve   , parseLink);
registerLink("back"    , linkProto , linkType.solve   , parseLink);
