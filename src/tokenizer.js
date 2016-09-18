/*
 * This is a port of cpython's tokenizer, Parser/tokenizer.c,
 * in particular, the tok_get function.
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'prakalpa/constants/tokens',
  'prakalpa/constants/errors',
  'prakalpa/exceptions'
], function (declare, lang, Tokens, Errors, Exceptions) {
  var MAXINDENT;

  MAXINDENT = 100;

  return declare([], {
    /**
     * sourceText: Source that needs to be tokenized
     */
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.atBeginningOfLine = true;
      this.level = 0; // Parenthesis nesting level
      this.indstack = [0];
      this.indent = 0;
      this.pending = 0;
      this.charIndex = -1;
      this.startOfToken = {};
      this.contLine = false;
      this.lineNum = 1;
      this.colNum = -1;
      this.lines = this.sourceText.split('\n');
    },

    /* Entrypoint into the tokenizer. Returns the next token in the stream*/
    getNext: function () {
      return this._nextline();
    },

    /**
      * Returns the value of the token starting at position `start` and ending
      * just before position `end` both columnwise and linewise
      * start: {column, lineNum}
      * end: {column, lineNum}
      */
    _getString: function (start, end) {
      var startLine, endLine, startColumn, endColumn, string, i;

      startColumn = start.column;
      endColumn = end.column;
      startLine = start.lineNum - 1;
      endLine = end.lineNum - 1;

      if(startLine === endLine) {
        string = this.lines[startLine].substring(startColumn, endColumn);
      } else {
        string = this.lines[startLine].substring(startColumn);
        for(i = startLine + 1; i < endLine - 1; i++) {
          string += this.lines[i] + '\n';
        }
        string += this.lines[i].substring(0, endColumn);
      }
      return string;
    },

    /* Get the next character in the stream and keep track of line number and
     * column number
     */
    _getNextChar: function () {
      if(this.sourceText[this.charIndex] === '\n') {
        this.lineNum++;
        this.colNum = -1;
      }
      this.charIndex++;
      this.colNum++;
      if(this.charIndex >= this.sourceText.length) { return; }
      return this.sourceText[this.charIndex];
    },

    /* Go back one character in the stream while accounting for newlines*/
    _backupOneChar: function () {
      if(this.charIndex === -1) { return; }
      this.charIndex--;
      this.colNum--;
      if(this.sourceText[this.charIndex] === '\n') {
        this.lineNum--;
      }
    },

    _nextline: function () {
      this.startOfToken = { column: 0, lineNum: this.lineNum };
      this.blankline = false;

      if(this.atBeginningOfLine) {
        this.atBeginningOfLine = false;
        this._countIndentsAndDedents();
      }

      this.startOfToken = { column: this.colNum + 1, lineNum: this.lineNum };

      if(this.pending !== 0) {
        if(this.pending < 0) {
          this.pending++;
          return { token: Tokens.DEDENT, lineNum: this.lineNum };
        } else {
          this.pending--;
          return { token: Tokens.INDENT, lineNum: this.lineNum }; 
        }
      }

      // TODO Add support for async

      return this._again();
    },

    _verifyIdentifier: function () {
      // TODO Add support for Unicode
      return false;
    },

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
          token: Tokens.ERRORTOKEN,
          lineNum: this.lineNum
        });
      }

      //TODO Add support for async

      endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
      return {
        token: Tokens.NAME,
        start: this.startOfToken,
        end: endOfToken,
        string: this._getString(this.startOfToken, endOfToken)
      };
    },

    _again: function () {
      var c, endOfToken;

      //TODO Add support for tabs and form feeds
      do { c = this._getNextChar(); } while (c === ' ');

      this.startOfToken = { column: this.colNum, lineNum: this.lineNum };

      if(c === '#') {
        while (c && c !== '\n') { c = this._getNextChar(); }
      }

      if(!c) {
        return { token: Tokens.ENDMARKER, lineNum: this.lineNum };
      }

      if(this._isPotentialIdentifierStart(c)) {
        return this._processNames(c);
      }

      if(c === '\n') {
        this.atBeginningOfLine = true;
        if(this.blankline || this.level > 0) { return this._nextline(); }
        this.contLine = false;
        endOfToken = { column: this.colNum, lineNum: this.lineNum };
        return {
          token: Tokens.NEWLINE,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }

      return this._startWithPeriod(c);
    },

    _startWithPeriod: function (c) {
      var endOfToken;

      if(c === '.') {
        c = this._getNextChar();
        if(this._isDigit(c)) {
          return this._fraction();
        } else if(c === '.') {
          c = this._getNextChar();
          if(c === '.') {
            endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
            return {
              token: Tokens.ELLIPSIS,
              start: this.startOfToken,
              end: endOfToken,
              string: this._getString(this.startOfToken, endOfToken)
            };
          } else {
            this._backupOneChar();
          }
          this._backupOneChar();
        } else {
          this._backupOneChar();
        }
        endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
        return {
          token: Tokens.DOT,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }

      return this._isNumber(c);
    },

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
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
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
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
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
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
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
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
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
        endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
        return {
          token: Tokens.NUMBER,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }
      return this._letterQuote(c);
    },

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
      endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
      return {
        token: Tokens.NUMBER,
        start: this.startOfToken,
        end: endOfToken,
        string: this._getString(this.startOfToken, endOfToken)
      };
    },

    _exponent: function () {
      var c, endOfToken;

      c = this._getNextChar();
      if(c === '+' || c === '-') {
        c = this._getNextChar();
        if(!this._isDigit(c)) {
          this._backupOneChar();
          throw new Exceptions.TokenizeError({
            message: Errors.TOKEN,
            token: Tokens.ERRORTOKEN,
            lineNum: this.lineNum
          });
        }
      } else if(!this._isDigit(c)) {
        this._backupOneChar();
        this._backupOneChar();
        endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
        return {
          token: Tokens.NUMBER,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }
      do {
        c = this._getNextChar();
      } while(this._isDigit(c));

      if(c === 'j' || c === 'J') {
        return this._imaginary();
      }

      this._backupOneChar();
      endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
      return {
        token: Tokens.NUMBER,
        start: this.startOfToken,
        end: endOfToken,
        string: this._getString(this.startOfToken, endOfToken)
      };
    },

    _imaginary: function () {
      var endOfToken;

      endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };

      return {
        token: Tokens.NUMBER,
        start: this.startOfToken,
        end: endOfToken,
        string: this._getString(this.startOfToken, endOfToken)
      };
    },

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
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
              });
            } else {
              throw new Exceptions.TokenizeError({
                message: Errors.EOLS,
                token: Tokens.ERRORTOKEN,
                lineNum: this.lineNum
              });
            }
          }
          if(quoteSize === 1 && c === '\n') {
            throw new Exceptions.TokenizeError({
              message: Errors.EOLS,
              token: Tokens.ERRORTOKEN,
              lineNum: this.lineNum
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

        endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
        return {
          token: Tokens.STRING,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }

      return this._lineContinuation(c);
    },

    _lineContinuation: function (c) {
      if(c === '\\') {
        c = this._getNextChar();
        if(c !== '\n') {
          throw new Exceptions.TokenizeError({
            message: Errors.LINECONT,
            token: Tokens.ERRORTOKEN,
            lineNum: this.lineNum
          });
        }
        this.contLine = true;
        return this._again();
      }

      return this._twoCharacter(c);
    },

    _twoCharacter: function (c) {
      var c2, c3, token, token3, endOfToken;

      c2 = this._getNextChar();
      token = this.twoCharToken(c, c2);
      if(token !== Tokens.OP) {
        c3 = this._getNextChar();
        token3 = this.threeCharToken(c, c2, c3);
        if(token3 !== Tokens.OP) {
          token = token3;
        } else {
          this._backupOneChar();
        }
        endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };
        return {
          token: token,
          start: this.startOfToken,
          end: endOfToken,
          string: this._getString(this.startOfToken, endOfToken)
        };
      }
      this._backupOneChar();

      return this._parenthesesCheck(c);
    },

    _parenthesesCheck: function (c) {
      switch(c) {
        case '(':
        case '[':
        case '{':
          this.level++;
          break;
        case ')':
        case ']':
        case '}':
          this.level--;
          break;
      }

      return this._oneCharacter(c);
    },

    _oneCharacter: function (c) {
      var endOfToken;

      endOfToken = { column: this.colNum + 1, lineNum: this.lineNum };

      return {
        token: this.oneCharToken(c),
        start: this.startOfToken,
        end: endOfToken,
        string: this._getString(this.startOfToken, endOfToken)
      };
    },

    _isPotentialIdentifierStart: function (c) {
      var code;

      if(typeof(c) === 'undefined') { return false; }
      code = c.charCodeAt(0);

      return ((code > 64 && code < 91)  || // Uppercase
              (code > 96 && code < 123) || // Lowercase
              (code >= 128)             || // More than ASCII
              (c === '_'));
    },

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
        this.blankline = true;
      }

      // I think altcol, altindstack etc. are to check if tabs and spaces
      // are being used inconsistently in indentation.
      // As we don't support tabs anyway, I'm skipping that part of the code
      if(!this.blankline && this.level === 0) {
        if(col > this.indstack[this.indent]) {
          if(this.indent + 1 >= MAXINDENT) {
            throw new Exceptions.TokenizeError({
              message: Errors.TOODEEP,
              token: Tokens.ERRORTOKEN,
              lineNum: this.lineNum
            });
          }
          this.pending++;
          this.indstack[++this.indent] = col;
        } else if (col < this.indstack[this.indent]) {
          while(this.indent > 0 && col < this.indstack[this.indent]) {
            this.pending--;
            this.indent--;
          }
          if(col !== this.indstack[this.indent]) {
            throw new Exceptions.TokenizeError({
              message: Errors.DEDENT,
              token: Tokens.ERRORTOKEN,
              lineNum: this.lineNum
            });
          }
        }
      }
    },

    _isDigit: function (c) {
      var charCode;

      if(typeof(c) === 'undefined') { return false; }
      charCode = c.charCodeAt(0);
      return (charCode > 47 && charCode < 58);
    },

    _isXDigit: function (c) {
      var charCode;

      if(typeof(c) === 'undefined') { return false; }
      charCode = c.charCodeAt(0);
      return (this._isDigit(c) || 
             (charCode >= 65 && charCode <= 70) || // A to F
             (charCode >= 97 && charCode <= 102)); // a to f
    },

    oneCharToken: function (c) {
      switch (c) {
        case '(':           return Tokens.LPAR;
        case ')':           return Tokens.RPAR;
        case '[':           return Tokens.LSQB;
        case ']':           return Tokens.RSQB;
        case ':':           return Tokens.COLON;
        case ',':           return Tokens.COMMA;
        case ';':           return Tokens.SEMI;
        case '+':           return Tokens.PLUS;
        case '-':           return Tokens.MINUS;
        case '*':           return Tokens.STAR;
        case '/':           return Tokens.SLASH;
        case '|':           return Tokens.VBAR;
        case '&':           return Tokens.AMPER;
        case '<':           return Tokens.LESS;
        case '>':           return Tokens.GREATER;
        case '=':           return Tokens.EQUAL;
        case '.':           return Tokens.DOT;
        case '%':           return Tokens.PERCENT;
        case '{':           return Tokens.LBRACE;
        case '}':           return Tokens.RBRACE;
        case '^':           return Tokens.CIRCUMFLEX;
        case '~':           return Tokens.TILDE;
        case '@':           return Tokens.AT;
        default:            return Tokens.OP;
      }
    },

    twoCharToken: function (c1, c2) {
      switch (c1) {
        case '=':
          switch (c2) {
            case '=': return Tokens.EQEQUAL;
          }
          break;
        case '!':
          switch (c2) {
            case '=': return Tokens.NOTEQUAL;
          }
          break;
        case '<':
          switch (c2) {
            case '>': return Tokens.NOTEQUAL;
            case '=': return Tokens.LESSEQUAL;
            case '<': return Tokens.LEFTSHIFT;
          }
          break;
        case '>':
          switch (c2) {
            case '=': return Tokens.GREATEREQUAL;
            case '>': return Tokens.RIGHTSHIFT;
          }
          break;
        case '+':
          switch (c2) {
            case '=': return Tokens.PLUSEQUAL;
          }
          break;
        case '-':
          switch (c2) {
            case '=': return Tokens.MINEQUAL;
            case '>': return Tokens.RARROW;
          }
          break;
        case '*':
          switch (c2) {
            case '*': return Tokens.DOUBLESTAR;
            case '=': return Tokens.STAREQUAL;
          }
          break;
        case '/':
          switch (c2) {
            case '/': return Tokens.DOUBLESLASH;
            case '=': return Tokens.SLASHEQUAL;
          }
          break;
        case '|':
          switch (c2) {
            case '=': return Tokens.VBAREQUAL;
          }
          break;
        case '%':
          switch (c2) {
            case '=': return Tokens.PERCENTEQUAL;
          }
          break;
        case '&':
          switch (c2) {
            case '=': return Tokens.AMPEREQUAL;
          }
          break;
        case '^':
          switch (c2) {
            case '=': return Tokens.CIRCUMFLEXEQUAL;
          }
          break;
        case '@':
          switch (c2) {
            case '=': return Tokens.ATEQUAL;
          }
          break;
      }
      return Tokens.OP;
    },

    threeCharToken: function (c1, c2, c3) {
      switch (c1) {
        case '<':
          switch (c2) {
            case '<':
              switch (c3) {
                case '=':
                  return Tokens.LEFTSHIFTEQUAL;
              }
              break;
          }
          break;
        case '>':
          switch (c2) {
            case '>':
              switch (c3) {
                case '=':
                  return Tokens.RIGHTSHIFTEQUAL;
              }
              break;
          }
          break;
        case '*':
          switch (c2) {
            case '*':
              switch (c3) {
                case '=':
                  return Tokens.DOUBLESTAREQUAL;
              }
              break;
          }
          break;
        case '/':
          switch (c2) {
            case '/':
              switch (c3) {
                case '=':
                  return Tokens.DOUBLESLASHEQUAL;
              }
              break;
          }
          break;
        case '.':
          switch (c2) {
            case '.':
              switch (c3) {
                case '.':
                  return Tokens.ELLIPSIS;
              }
              break;
          }
          break;
      }
      return Tokens.OP;
    }
  });
});
