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

const runtimeRequestMultip = "multip";
// update parse
// m.link(m.update).parse(parser);
const updateParse = function(parser){
  const useParser = _isFn(parser) ? parser : _cool;

  return function(datas, types){
    const parseData = useParser[types === runtimeRequestMultip ? "apply" : "call"](null, datas);
    return parseData;
  };
};

const universalParse = function(parser){
  return _isFn(parser) ? parser : _cool;
};

registerLink("set"     , linkProto , linkType.before  , universalParse);
registerLink("update"  , linkProto , linkType.runtime , updateParse      , _idt);
registerLink("request" , linkProto , linkType.runtime , updateParse      , _idt);
registerLink("remove"  , linkProto , linkType.solve   , universalParse);
registerLink("get"     , linkProto , linkType.solve   , universalParse);
registerLink("back"    , linkProto , linkType.solve   , universalParse);
