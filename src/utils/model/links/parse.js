import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';
import {
  _idt,
  _isFn,
  _cool,
} from '../../usestruct';

const linkProto = "parse";
const runtimeRequestMultip = "multip";
// update parse
// m.link(m.update).parse(matcher);
const parseLink = function(parser){
  const linkAdapter = this._a;
  const useParser = _isFn(parser) ? parser : _cool;

  return MODEL.ASYNCLINKAPIS[linkAdapter] ? function(datas, types){
    return useParser[types === runtimeRequestMultip ? "apply" : "call"](null, datas);
  } : useParser;
};

registerLink("set"     , linkProto , MODEL.LINKTYPES.before  , parseLink);
registerLink("request" , linkProto , MODEL.LINKTYPES.runtime , parseLink);
registerLink("remove"  , linkProto , MODEL.LINKTYPES.solve   , parseLink);
registerLink("get"     , linkProto , MODEL.LINKTYPES.solve   , parseLink);