import { _trim, empty } from "../../../usestruct";
import { DOCUMENT_TAGS_SHORTCUT, DOCUMENT_TAGS_CUBEC_ROOTNAME } from '../constant/tags';
import createTreeNode from './createTreeNode';

const REGEXP_PARSER_TEMPLATE_HTML = /<\/([^><]+?)>|<([^><]+?)\/>|<([^><]+?)>|([^><]+)|$/g;
const REGEXP_PARSER_TEMPLATE_EXCAPED_TAB = /^[\r\n\f\t\s]+|[\r\n\f\t\s]+$/g;

// html render template string to Tree with algorithm
const parser = function(renderString, view, args) {
  // console.log(view);
  // create virtual cubec ROOT Element
  const cubecRoot = {
    tagName: DOCUMENT_TAGS_CUBEC_ROOTNAME,
    isRoot: true,
    child: [],
  };

  let id = 1;
  let p = cubecRoot,
      c = cubecRoot.child,
      n;

  // create skip algorithm
  let skip = false;
  let skipSign = empty;
  let skipHTML = empty;

  // start parser
  renderString.replace(
    // parser REGEXP
    REGEXP_PARSER_TEMPLATE_HTML,
    // parser function
    function(match, close, stag, tag, text) {
      if (!match || !match.replace(REGEXP_PARSER_TEMPLATE_EXCAPED_TAB, empty))
        return match;

      // match plugin skip
      if(skip){
        // not match plugin
        if(!close || _trim(close) !== skipSign){
          skipHTML += match;
          return match;
        }

        // skip end
        skip = false;
        skipSign = empty;

        p.children = _trim(skipHTML);
        p.text = void 0;
        skipHTML = empty;
      }

      // close tag
      if (close) {
        p = p.parent;
        c = p.child;

        // special tag
      } else if (stag) {
        n = createTreeNode(stag, p, view, id++, args);
        n.i = c.length;
        c.push(n);

        // normal tag
      } else if (tag) {
        n = createTreeNode(tag, p, view, id++, args);

        // Plug do skip
        if(n.isPlug){
          skip = true;
          skipSign = n.tagName;
        }

        n.i = c.length;
        c.push(n);

        if (!(n.tagName in DOCUMENT_TAGS_SHORTCUT)) {
          p = n;
          c = n.child;
        }

      } else if (text) {

        if (_trim(text)) p.text = text;

      }

      return match;
    }
  );

  return cubecRoot;
};

export default parser;

