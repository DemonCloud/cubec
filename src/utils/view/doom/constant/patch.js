import { _lock } from "../../../usestruct";

export const PATCHES_NAME_CALLER_LIST = _lock([
  'null',             // 0
  'replace',          // 1
  'append',           // 2
  'remove',           // 3
  'modifyText',       // 4
  'withText',         // 5
  'removeText',       // 6
  'addAttribute',     // 7
  'modifyAttribute',  // 8
  'removeAttribute',  // 9
  'updateSlot',       // 10
  'updatePlugin'      // 11
]);

export const PATCHES_NAME_OPERATE = _lock({
  NULL : 'null',                        // 0
  REPLACE: 'replace',                   // 1
  APPEND: 'append',                     // 2
  REMOVE: 'remove',                     // 3
  MODIFY_TEXT: 'modifyText',            // 4
  WITH_TEXT: 'withText',                // 5
  REMOVE_TEXT: 'removeText',            // 6
  ADD_ATTRIBUTE: 'addAttribute',        // 7
  MODIFY_ATTRIBUTE: 'modifyAttribute',  // 8
  REMOVE_ATTRIBUTE: 'removeAttribute',  // 9
  UPDATE_SLOT: 'updateSlot',            // 10
  UPDATE_PLUGIN: 'updatePlugin'         // 11
});