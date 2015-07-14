define([], function () {
  return {
    OK:		      'No error',
    EOF:		    'End Of File',
    INTR:		    'Interrupted',
    TOKEN:		  'Bad token',
    SYNTAX:	    'Syntax error',
    NOMEM:		  'Ran out of memory',
    DONE:		    'Parsing complete',
    ERROR:		  'Execution error',
    TABSPACE:	  'Inconsistent mixing of tabs and spaces',
    OVERFLOW:   'Node had too many children',
    TOODEEP:	  'Too many indentation levels',
    DEDENT:	    'No matching outer block for dedent',
    DECODE:	    'Error in decoding into Unicode',
    EOFS:		    'EOF in triple-quoted string',
    EOLS:		    'EOL in single-quoted string',
    LINECONT:	  'Unexpected characters after a line continuation',
    IDENTIFIER: 'Invalid characters in identifier',
    BADSINGLE:  'Ill-formed single statement input',
  };
});
