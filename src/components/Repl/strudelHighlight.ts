import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { Extension } from '@codemirror/state';

/**
 * CodeMirror syntax highlighting theme matching the Phosphor Dark palette.
 */
const strudelHighlightStyle = HighlightStyle.define([
  // Keywords: cyan
  { tag: tags.keyword, color: '#00d4ff' },
  { tag: tags.controlKeyword, color: '#00d4ff' },
  { tag: tags.operatorKeyword, color: '#00d4ff' },

  // Strings: magenta
  { tag: tags.string, color: '#ff00ff' },
  { tag: tags.special(tags.string), color: '#ff00ff' },

  // Numbers: amber
  { tag: tags.number, color: '#ffcc00' },
  { tag: tags.bool, color: '#ffcc00' },

  // Comments: dim
  { tag: tags.comment, color: '#555577', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#555577', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#555577', fontStyle: 'italic' },

  // Functions: green
  { tag: tags.function(tags.variableName), color: '#00ff41' },
  { tag: tags.function(tags.propertyName), color: '#00ff41' },

  // Variables and properties
  { tag: tags.variableName, color: '#e0e0e0' },
  { tag: tags.propertyName, color: '#e0e0e0' },

  // Operators
  { tag: tags.operator, color: '#00d4ff' },
  { tag: tags.punctuation, color: '#888899' },

  // Definitions
  { tag: tags.definition(tags.variableName), color: '#00ff41' },
  { tag: tags.typeName, color: '#00d4ff' },
]);

export const strudelHighlight: Extension = syntaxHighlighting(strudelHighlightStyle);
