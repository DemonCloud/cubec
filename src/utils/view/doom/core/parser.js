import { _trim } from "../../../usestruct";
import { DOCUMENT_TAGS_SHORTCUT, DOCUMENT_TAGS_CUBEC_ROOTNAME } from '../constant/tags';
import pluginList from "../constant/pluginList";
import createTreeNode from './createTreeNode';

const REGEXP_PARSER_TEMPLATE_HTML =  new RegExp('</([^><]+?)>|<([^><]+?)/>|<([^><]+?)>|([^><]+)|$', 'g');
const REGEXP_PARSER_TEMPLATE_EXCAPED_TAB = /^[\r\n\f\t\s]+|[\r\n\f\t\s]+$/gi;

// html render template string to Tree with algorithm
const parser = function(renderString, view, args) {
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
  let skipSign = '';
  let skipHTML = '';

  // start parser
  renderString.replace(
    REGEXP_PARSER_TEMPLATE_HTML,
    // parser function
    function(match, close, stag, tag, text) {
      if (!match || !match.replace(REGEXP_PARSER_TEMPLATE_EXCAPED_TAB, '')) return match;

      // match plugin skip
      if(skip){
        const closeTagName = (close||"").split(" ")[0];
        // not match plugin
        if(closeTagName !== skipSign){
          skipHTML += match;
          return match;
        }

        // skip end
        skip = false;
        skipSign = '';
        p.children = _trim(skipHTML);
        p.text = void 0;
        skipHTML = '';
      }

      // close tag
      if (close) {
        p = p.parent;
        c = p.child;
        // special tag
      } else if (stag) {
        n = createTreeNode(stag, view, id++, args);
        n.i = c.length;
        c.push(n);
        n.parent = p;
        // normal tag
      } else if (tag) {
        n = createTreeNode(tag, view, id++, args);

        const tagName = tag.split(" ")[0];

        if(pluginList[tagName]){
          skip = true;
          skipSign = tagName;
        }

        n.i = c.length;
        c.push(n);
        n.parent = p;

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
