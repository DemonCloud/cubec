import { _eachArray, _lock } from "../../../usestruct";

const DOCUMENT_TAGS_SHORTCUT_ARRAY = [
  "input",
  "br",
  'hr',
  'img',
  'meta',
  'area',
  'bease',
  'col',
  'isindex',
  'command',
  'embed',
  'keygen',
  'link',
  'param',
  'source',
  'track',
  'wbr',

  // SVG Element Must use as XML
];

const DOCUMENT_TAGS_CUBEC_ROOTNAME = "cubec-root";

const DOCUMENT_TAGS_SHORTCUT = {};

// create shortcut tag as HTML Web Standard
// input: true
_eachArray(DOCUMENT_TAGS_SHORTCUT_ARRAY, function(tagName){
  DOCUMENT_TAGS_SHORTCUT[tagName] = true;
});

_lock(DOCUMENT_TAGS_SHORTCUT);

export {
  DOCUMENT_TAGS_SHORTCUT,
  DOCUMENT_TAGS_CUBEC_ROOTNAME
}