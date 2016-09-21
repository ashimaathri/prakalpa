/*
 * This is a port of cpython's tokenizer, Parser/tokenizer.c,
 * in particular, the tok_get function.
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'prakalpa/constants/tokens',
  'prakalpa/constants/errors',
  'prakalpa/exceptions',
  'prakalpa/token',
  'prakalpa/utils'
], function (declare, lang, Tokens, Errors, Exceptions, Token, Utils) {
  var MAXINDENT;

  MAXINDENT = 100;

  /**
    * The tokenizer splits a string into Python tokens
    * @class prakalpa.Tokenizer
    * @param opts 
    * @param {String} opts.sourceText - Source that needs to be tokenized
    */
  return declare([], /** @lends prakalpa.Tokenizer.prototype */{
    constructor: function (opts) {
      lang.mixin(this, opts);
      this._atBeginningOfLine = true;
      this._level = 0; // Parenthesis/Square Bracket/Braces nesting level
      this._indstack = [0];
      this._indent = 0;
      this._pending = 0;
      this._charIndex = -1;
      this._startOfToken = {};
      this._contLine = false;
      this._lineNum = 1;
      this._colNum = -1;
      this._lines = this.sourceText.split('\n');
      this._blankline = false;
    },

    /**
      * Entrypoint into the tokenizer. Returns the next token in the stream
      * @public
      * @returns {prakalpa.Token} token - Next token 
      * @throws {prakalpa.Exceptions.TokenizeError} Will throw an error if a syntax errors is encountered
      */
    getNext: function () {
      return this._nextline();
    },

    /**
      * Returns the value of the token starting at position `start` and ending
      * just before position `end` both columnwise and linewise
      * @private
      * @param {Object} start - The position at which the token starts
      * @param {Number} start.column - The column number in a line at which the token starts 
      * @param {Number} start.lineNum - The line number in the source at which the token starts 
      * @param {Object} end - The position just before which the token ends
      * @param {Number} end.column - The column number in a line before which the token ends 
      * @param {Number} end.lineNum - The line number in the source before which the token ends
      * @returns {String} tokenString - String value of token starting at start and ending just before end
      */
    _getString: function (start, end) {
      var startLine, endLine, startColumn, endColumn, string, i;

      startColumn = start.column;
      endColumn = end.column;
      startLine = start.lineNum - 1;
      endLine = end.lineNum - 1;

      if(startLine === endLine) {
        string = this._lines[startLine].substring(startColumn, endColumn);
      } else {
        string = this._lines[startLine].substring(startColumn);
        for(i = startLine + 1; i < endLine - 1; i++) {
          string += this._lines[i] + '\n';
        }
        string += this._lines[i].substring(0, endColumn);
      }
      return string;
    },

    /**
      * Get the next character in the stream and keep track of line number and
      * column number
      * @private
      * @returns {String} nextChar - Next character in the source text
      */
    _getNextChar: function () {
      if(this.sourceText[this._charIndex] === '\n') {
        this._lineNum++;
        this._colNum = -1;
      }
      this._charIndex++;
      this._colNum++;
      if(this._charIndex >= this.sourceText.length) { return; }
      return this.sourceText[this._charIndex];
    },

    /**
      * Go back one character in the stream while accounting for newlines
      * @private
      */
    _backupOneChar: function () {
      if(this._charIndex === -1) { return; }
      this._charIndex--;
      this._colNum--;
      if(this.sourceText[this._charIndex] === '\n') {
        this._lineNum--;
      }
    },

    /**
      * Processes one line and keeps track of indents and dedents.
      * Corresponds to the `nextline` goto label in cpython's `tok_get` function.
      * @private
      */
    _nextline: function () {
      this._startOfToken = { column: 0, lineNum: this._lineNum };
      this._blankline = false;

      if(this._atBeginningOfLine) {
        this._atBeginningOfLine = false;
        this._countIndentsAndDedents();
      }

      this._startOfToken = { column: this._colNum + 1, lineNum: this._lineNum };

      if(this._pending !== 0) {
        if(this._pending < 0) {
          this._pending++;
          return Token({
            type: Tokens.DEDENT,
            start: this._startOfToken
          });
        } else {
          this._pending--;
          return Token({
            type: Tokens.INDENT,
            start: this._startOfToken
          }); 
        }
      }

      // TODO Add support for async

      return this._again();
    },

    /**
      * Checks if an identifier is a proper unicode string PEP 3131 (TODO)
      * @private
      */
    _verifyIdentifier: function () {
      return false;
    },

    /**
      * Checks for an identifier which is the most frequent token
      * @private
	    * @param {String} c - The next character in the source
      */
    _processNames: function (c) {
      var nonascii, saw_b, saw_r, saw_u, endOfToken;

      nonascii = false;
      saw_b = saw_r = saw_u = false;

      while(true) {
        if(!(saw_b || saw_u) && (c === 'b' || c === 'B')) {
          saw_b = true;
        } else if(!(saw_b || saw_u || saw_r) && (c === 'u' || c === 'U')) {
          saw_u = true;
        } else if(!(saw_r || saw_u) && (c === 'r' || c === 'R')) {
          saw_r = true;
        } else {
          break;
        }
        c = this._getNextChar();

        if(c === '"' || c === "'") {
          return this._letterQuote(c);
        }
      }

      while (this._isPotentialIdentifierChar(c)) {
        if(c.charCodeAt(0) >= 128) {
          nonascii = true;
        }
        c = this._getNextChar();
      }

      this._backupOneChar();

      if(nonascii && !this._verifyIdentifier()) {
        throw new Exceptions.TokenizeError({
          message: Errors.TOKEN,
          type: Tokens.ERRORTOKEN,
          lineNum: this._lineNum
        });
      }

      //TODO Add support for async

      endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
      return Token({
        type: Tokens.NAME,
        start: this._startOfToken,
        end: endOfToken,
        string: this._getString(this._startOfToken, endOfToken)
      });
    },

    /** Equivalent to the `again` label in cpython's `tok_get`
      * Processes newlines and the endmarker.
      * @private
      */
    _again: function () {
      var c, endOfToken;

      //TODO Add support for tabs and form feeds
      do { c = this._getNextChar(); } while (c === ' ');

      this._startOfToken = { column: this._colNum, lineNum: this._lineNum };

      if(c === '#') {
        while (c && c !== '\n') { c = this._getNextChar(); }
      }

      if(!c) {
        return Token({
          type: Tokens.ENDMARKER,
          start: this._startOfToken
        });
      }

      if(this._isPotentialIdentifierStart(c)) {
        return this._processNames(c);
      }

      if(c === '\n') {
        this._atBeginningOfLine = true;
        if(this._blankline || this._level > 0) { return this._nextline(); }
        this._contLine = false;
        endOfToken = { column: this._colNum, lineNum: this._lineNum };
        return Token({
          type: Tokens.NEWLINE,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }

      return this._startWithPeriod(c);
    },

    /**
      * If the token begins with a period, processes that token, else
      * calls the next processor in line
      * @private
      */
    _startWithPeriod: function (c) {
      var endOfToken;

      if(c === '.') {
        c = this._getNextChar();
        if(this._isDigit(c)) {
          return this._fraction();
        } else if(c === '.') {
          c = this._getNextChar();
          if(c === '.') {
            endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
            return Token({
              type: Tokens.ELLIPSIS,
              start: this._startOfToken,
              end: endOfToken,
              string: this._getString(this._startOfToken, endOfToken)
            });
          } else {
            this._backupOneChar();
          }
          this._backupOneChar();
        } else {
          this._backupOneChar();
        }
        endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
        return Token({
          type: Tokens.DOT,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }

      return this._isNumber(c);
    },

    /**
      * If the token is a number, processes that token, else
      * calls the next processor in line
      * @private
      */
    _isNumber: function (c) {
      var nonZero, charCode, endOfToken;

      if(this._isDigit(c)) {
        if(c === '0') {
          c = this._getNextChar();
          if(c === '.') {
            return this._fraction();
          }
          if(c === 'j' || c === 'J') {
            return this._imaginary();
          }
          if(c === 'x' || c === 'X') {
            c = this._getNextChar();
            if(!this._isXDigit(c)) {
              this._backupOneChar();
              throw new Exceptions.TokenizeError({
                message: Errors.TOKEN,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            }
            do {
              c = this._getNextChar();
            } while(this._isXDigit(c));
          } else if(c === 'o' || c === 'O') {
            c = this._getNextChar();
            charCode = c.charCodeAt(0);
            if(charCode < 48 || charCode >= 56) { // Only '0' to '7' are allowed
              this._backupOneChar();
              throw new Exceptions.TokenizeError({
                message: Errors.TOKEN,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            }
            do {
              c = this._getNextChar();
            } while (c && 48 <= c.charCodeAt(0) && c.charCodeAt(0) < 56);
          } else if(c === 'b' || c === 'B') {
            c = this._getNextChar();
            if(c !== '0' && c !== '1') {
              this._backupOneChar();
              throw new Exceptions.TokenizeError({
                message: Errors.TOKEN,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            }
            do {
              c = this._getNextChar();
            } while (c === '0' || c === '1');
          } else {
            nonZero = false;
            while(c === '0') {
              c = this._getNextChar();
            }
            while(this._isDigit(c)) {
              nonZero = true;
              c = this._getNextChar();
            }
            if(c === '.') {
              return this._fraction();
            } else if(c === 'e' || c === 'E') {
              return this._exponent();
            } else if(c === 'j' || c === 'J') {
              return this._imaginary();
            } else if (nonZero) {
              this._backupOneChar();
              throw new Exceptions.TokenizeError({
                message: Errors.TOKEN,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            }
          }
        } else {
          do {
            c = this._getNextChar();
          } while (this._isDigit(c));

          if(c === '.') {
            return this._fraction();
          }

          if(c === 'e' || c === 'E') {
            return this._exponent();
          }

          if(c === 'j' || c === 'J') {
            return this._imaginary();
          }
        }
        this._backupOneChar();
        endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
        return Token({
          type: Tokens.NUMBER,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }
      return this._letterQuote(c);
    },

    /**
      * Processes a fraction token. Equivalent to the `fraction` label in cpython's `tok_get`
      * @private
      */
    _fraction: function (c) {
      var endOfToken;

      do {
        c = this._getNextChar();
      } while (this._isDigit(c));

      if(c === 'e' || c === 'E') {
        return this._exponent();
      }

      if(c === 'j' || c === 'J') {
        return this._imaginary();
      }

      this._backupOneChar();
      endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
      return Token({
        type: Tokens.NUMBER,
        start: this._startOfToken,
        end: endOfToken,
        string: this._getString(this._startOfToken, endOfToken)
      });
    },

    /**
      * Processes an exponent token. Equivalent to the `exponent` label in cpython's `tok_get`
      * @private
      */
    _exponent: function () {
      var c, endOfToken;

      c = this._getNextChar();
      if(c === '+' || c === '-') {
        c = this._getNextChar();
        if(!this._isDigit(c)) {
          this._backupOneChar();
          throw new Exceptions.TokenizeError({
            message: Errors.TOKEN,
            type: Tokens.ERRORTOKEN,
            lineNum: this._lineNum
          });
        }
      } else if(!this._isDigit(c)) {
        this._backupOneChar();
        this._backupOneChar();
        endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
        return Token({
          type: Tokens.NUMBER,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }
      do {
        c = this._getNextChar();
      } while(this._isDigit(c));

      if(c === 'j' || c === 'J') {
        return this._imaginary();
      }

      this._backupOneChar();
      endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
      return Token({
        type: Tokens.NUMBER,
        start: this._startOfToken,
        end: endOfToken,
        string: this._getString(this._startOfToken, endOfToken)
      });
    },

    /**
      * Processes an imaginary token. Equivalent to the `imaginary` label in cpython's `tok_get`
      * @private
      */
    _imaginary: function () {
      var endOfToken;

      endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };

      return Token({
        type: Tokens.NUMBER,
        start: this._startOfToken,
        end: endOfToken,
        string: this._getString(this._startOfToken, endOfToken)
      });
    },

    /**
      * If token is a string token, processes that token, else
      * continues to the next processor in line.
      * Equivalent to the `letter_quote` label in cpython's `tok_get`
      * @private
      */
    _letterQuote: function (c) {
      var quote, quoteSize, endQuoteSize, endOfToken;

      if(c === '"' || c === "'") {
        quote = c;
        quoteSize = 1;
        endQuoteSize = 0;

        c = this._getNextChar();
        if(c === quote) {
          c = this._getNextChar();
          if(c === quote) {
            quoteSize = 3;
          } else {
            endQuoteSize = 1;
          }
        }

        if(c !== quote) {
          this._backupOneChar();
        }

        while(endQuoteSize !== quoteSize) {
          c = this._getNextChar();
          if(!c) {
            if(quoteSize === 3) {
              throw new Exceptions.TokenizeError({
                message: Errors.EOFS,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            } else {
              throw new Exceptions.TokenizeError({
                message: Errors.EOLS,
                type: Tokens.ERRORTOKEN,
                lineNum: this._lineNum
              });
            }
          }
          if(quoteSize === 1 && c === '\n') {
            throw new Exceptions.TokenizeError({
              message: Errors.EOLS,
              type: Tokens.ERRORTOKEN,
              lineNum: this._lineNum
            });
          }
          if(c === quote) {
            endQuoteSize += 1;
          } else {
            endQuoteSize = 0;
            if(c === '\\') {
              c = this._getNextChar();
            }
          }
        }

        endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
        return Token({
          type: Tokens.STRING,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }

      return this._lineContinuation(c);
    },

    /**
      * If there's a line continuation in the source, processes that
      * and continues to the next processor in line.
      * @private
      */
    _lineContinuation: function (c) {
      if(c === '\\') {
        c = this._getNextChar();
        if(c !== '\n') {
          throw new Exceptions.TokenizeError({
            message: Errors.LINECONT,
            type: Tokens.ERRORTOKEN,
            lineNum: this._lineNum
          });
        }
        this._contLine = true;
        return this._again();
      }

      return this._twoCharacter(c);
    },

    /**
      * Processes a two character token else continues to the next processor in line
      * @private
      */
    _twoCharacter: function (c) {
      var c2, c3, token, token3, endOfToken;

      c2 = this._getNextChar();
      token = Utils.twoCharToken(c, c2);
      if(token !== Tokens.OP) {
        c3 = this._getNextChar();
        token3 = Utils.threeCharToken(c, c2, c3);
        if(token3 !== Tokens.OP) {
          token = token3;
        } else {
          this._backupOneChar();
        }
        endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };
        return Token({
          type: token,
          start: this._startOfToken,
          end: endOfToken,
          string: this._getString(this._startOfToken, endOfToken)
        });
      }
      this._backupOneChar();

      return this._parenthesesCheck(c);
    },

    /**
      * Matches braces, parenthesis and square brackets
      * @private
      */
    _parenthesesCheck: function (c) {
      switch(c) {
        case '(':
        case '[':
        case '{':
          this._level++;
          break;
        case ')':
        case ']':
        case '}':
          this._level--;
          break;
      }

      return this._oneCharacter(c);
    },

    /**
      * Processes a one character token else continues to the next processor in line
      * @private
      */
    _oneCharacter: function (c) {
      var endOfToken;

      endOfToken = { column: this._colNum + 1, lineNum: this._lineNum };

      return Token({
        type: Utils.oneCharToken(c),
        start: this._startOfToken,
        end: endOfToken,
        string: this._getString(this._startOfToken, endOfToken)
      });
    },

    /**
      * Checks if the token begins with a valid identifier start character 
      * @private
      */
    _isPotentialIdentifierStart: function (c) {
      var code;

      if(typeof(c) === 'undefined') { return false; }
      code = c.charCodeAt(0);

      return ((code > 64 && code < 91)  || // Uppercase
              (code > 96 && code < 123) || // Lowercase
              (code >= 128)             || // More than ASCII
              (c === '_'));
    },

    /**
      * Checks if the char is a valid identifier character 
      * @private
      */
    _isPotentialIdentifierChar: function (c) {
      var code;

      if(typeof(c) === 'undefined') { return false; }
      code = c.charCodeAt(0);

      return ((code > 64 && code < 91)  || // Uppercase
              (code > 96 && code < 123) || // Lowercase
              (code > 47 && code < 58)  || // Digit
              (code >= 128)             || // More than ASCII
              (c === '_'));
    },

    /**
      * Matches indents and dedents
      * Algorithm description taken from [Tokens and Python's Lexical Structure](https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf) 
			* 1. Ensure that the first line has no indentation (0 white-space characters); if it does, report an error.
      *    If it doesn't, initialize the list with the value 0.
			* 2. For each logical line (after line–joining)
			* 	1. If the current line’s indentation is > the indentation at the list’s end
			* 		1. Add the current line’s indentation to the end of the list.
			* 		2. Produce an INDENT token.
			* 	2. If the current line’s indentation is < the indentation at the list’s end
			* 		1. For each value at the end of the list that is unequal to the current line’s
      *        indentation (if it is not in the list, report a lexical error).
			* 			1. Remove the value from the end of the list.
			* 			2. Produce a DEDENT token.
			* 	3. Tokenize the current line.
			* 3. For every indentation on the list except 0, produce a DEDENT token.
      * @private
      */
    _countIndentsAndDedents: function () {
      var col, c;

      col = 0;

      // Supporting only whitespace for now.
      // TODO Add support for tabs and form-feed
      c = this._getNextChar();
      while(c === ' ') {
        col++;
        c = this._getNextChar();
      }

      this._backupOneChar();

      // TODO Add support for interactive mode
      if(c === '\#' || c === '\n') {
        this._blankline = true;
      }

      // I think altcol, altindstack etc. are to check if tabs and spaces
      // are being used inconsistently in indentation.
      // As we don't support tabs anyway, I'm skipping that part of the code
      if(!this._blankline && this._level === 0) {
        if(col > this._indstack[this._indent]) {
          if(this._indent + 1 >= MAXINDENT) {
            throw new Exceptions.TokenizeError({
              message: Errors.TOODEEP,
              type: Tokens.ERRORTOKEN,
              lineNum: this._lineNum
            });
          }
          this._pending++;
          this._indstack[++this._indent] = col;
        } else if (col < this._indstack[this._indent]) {
          while(this._indent > 0 && col < this._indstack[this._indent]) {
            this._pending--;
            this._indent--;
          }
          if(col !== this._indstack[this._indent]) {
            throw new Exceptions.TokenizeError({
              message: Errors.DEDENT,
              type: Tokens.ERRORTOKEN,
              lineNum: this._lineNum
            });
          }
        }
      }
    },

		/**
	    * Checks if character is a decimal digit or not
      * @private
      */
    _isDigit: function (c) {
      var charCode;

      if(typeof(c) === 'undefined') { return false; }
      charCode = c.charCodeAt(0);
      return (charCode > 47 && charCode < 58);
    },

		/**
	    * Checks if character is a hexadecimal digit or not
      * @private
      */
    _isXDigit: function (c) {
      var charCode;

      if(typeof(c) === 'undefined') { return false; }
      charCode = c.charCodeAt(0);
      return (this._isDigit(c) || 
             (charCode >= 65 && charCode <= 70) || // A to F
             (charCode >= 97 && charCode <= 102)); // a to f
    }
  });
});
