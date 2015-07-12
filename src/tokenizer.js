define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  './tokens',
  './errors'
], function (declare, lang, Tokens, Errors) {
  var MAXINDENT;

  MAXINDENT = 100;

  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.atBeginningOfLine = true;
      this.level = 0;
      this.indstack = [0];
      this.indent = 0;
      this.deftypestack = [0];
      this.defstack = [0];
      this.def = 0;
      this.pending = 0;
      this.charIndex = -1;
      this.startOfToken = 0;
      this.contLine = false;
    },

    getNextChar: function () {
      this.charIndex++;
      if(this.charIndex >= this.sourceText.length) { return; }
      return this.sourceText[this.charIndex];
    },

    backupOneChar: function () {
      if(this.charIndex === -1) { return; }
      this.charIndex--;
    },

    getNext: function () {
      return this.nextline();
    },

    nextline: function () {
      var error;

      this.startOfToken = 0;

      if(this.atBeginningOfLine) {
        this.atBeginningOfLine = false;
        error = this.countIndentsAndDedents();
        if(error) { return error; }
      }

      this.startOfToken = this.charIndex + 1;

      if(this.pending !== 0) {
        if(this.pending < 0) {
          this.pending++;
          while(this.def && this.defstack[this.def] >= this.indent) {
            this.def--;
          }
          return { token: Tokens.DEDENT };
        } else {
          this.pending--;
          return { token: Tokens.INDENT }; 
        }
      }
      return this.again();
    },

    verifyIdentifier: function () {
      //WHAT IS THIS? FIXME
      return true;
    },

    processNames: function (c) {
      var nonascii, saw_b, saw_r, saw_u, len, tokenStr;

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

        c = this.getNextChar();

        if(c === '"' || c === "'") {
          return letterQuote(c);
        }
      }

      while (isPotentialIdentifierChar(c)) {
        if(c.charCodeAt(0) >= 128) {
          nonascii = true;
        }
        c = this.getNextChar();
      }

      this.backupOneChar();

      if(nonascii && !this.verifyIdentifier()) {
        return { token: Tokens.ERRORTOKEN };
      }

      len = this.charIndex + 1 - this.startOfToken;

      tokenStr = this.sourceText.substring(this.startOfToken, this.charIndex + 1);

      if(len === 3 && tokenStr === 'def') {
        if(this.def && this.deftypestack[this.def] === 3) {
          this.deftypestack[this.def] = 2;
        } else if(this.defstack[this.def] < this.indent) {
          if(this.def + 1 >= MAXINDENT) {
            return { error: Errors.TOODEEP, token: Tokens.ERRORTOKEN };
          }
          this.def++;
          this.defstack[this.def] = this.indent;
          this.deftypestack[this.def] = 1;
        }
      }

      //TODO Add support for async

      return { 
        token: Tokens.NAME,
        start: this.startOfToken,
        end: this.charIndex + 1 
      };
    },

    again: function () {
      var c, ret;

      //TODO Add support for tabs and form feeds
      do { c = this.getNextChar(); } while (c === ' ');

      this.startOfToken = this.charIndex;

      if(c === '#') {
        while (c && c !== '\n') { c = this.getNextChar(); }
      }

      if(!c) {
        return { token: Tokens.ENDMARKER };
      }

      if(isPotentialIdentifierStart(c)) {
        return this.processNames(c);
      }

      if(c === '\n') {
        this.atBeginningOfLine = true;
        if(this.blankline || this.level > 0) { return nextline(); }
        this.contLine = false;
        return {
          token: Tokens.NEWLINE,
          start: this.startOfToken,
          end: this.charIndex + 1
        };
      }

      return this.startWithPeriod(c);
    },

    startWithPeriod: function (c) {
      if(c === '.') {
        c = this.getNextChar();
        if(this.isDigit(c)) {
          return fraction(c);
        } else if(c === '.') {
          c = this.getNextChar();
          if(c === '.') {
            return {
              token: Token.ELLIPSIS,
              start: this.startOfToken,
              end: this.charIndex + 1
            };
          } else {
            this.backupOneChar();
          }
          this.backupOneChar();
        } else {
          this.backupOneChar();
        }
        return {
          token: Token.DOT,
          start: this.startOfToken,
          end: this.charIndex + 1
        };
      }

      return this.isNumber(c);
    },

    isNumber: function (c) {
      var charCode, nonZero;

      if(this.isDigit(c)) {
        if(c === '0') {
          c = this.getNextChar();
          if(c === '.') {
            return this.fraction(c);
          }
          if(c === 'j' || c === 'J') {
            return this.imaginary(c);
          }
          if(c === 'x' || c === 'X') {
            c = this.getNextChar();
            if(!isXDigit(c)) {
              this.backupOneChar();
              return {
                error: Error.TOKEN,
                token: Token.ERRORTOKEN
              };
            }
            do {
              c = this.getNextChar();
            } while(this.isXDigit(c));
          } else if(c === 'o' || c === 'O') {
            c = this.getNextChar();
            charCode = c.charCodeAt(0);
            if(charCode < 48 || charCode >= 56) { // Only '0' to '7' are allowed
              this.backupOneChar();
              return {
                error: Error.TOKEN,
                token: Token.ERRORTOKEN
              };
            }
            do {
              c = this.getNextChar();
              charCode = c.charCodeAt(0);
            } while (48 <= charCode && charCode < 56);
          } else if(c == 'b' || c =='B') {
            c = this.getNextChar();
            if(c !== '0' && c !== '1') {
              this.backupOneChar();
              return {
                error: Error.TOKEN,
                token: Token.ERRORTOKEN
              };
            }
            do {
              c = this.getNextChar();
            } while (c === '0' || c === '1');
          } else {
            nonZero = false;
            while(c === '0') {
              c = this.getNextChar();
            }
            while(this.isDigit(c)) {
              nonZero = true;
              c = this.getNextChar();
            }
            if(c === '.') {
              return fraction(c);
            } else if(c === 'e' || c === 'E') {
              return exponent();
            } else if(c === 'j' || c === 'J') {
              return imaginary(c);
            } else if (nonZero) {
              this.backupOneChar();
              return {
                error: Error.TOKEN,
                token: Token.ERRORTOKEN
              };
            }
          }
        } else {
          do {
            c = this.getNextChar();
          } while (this.isDigit(c));

          if(c === '.') {
            return this.fraction(c);
          }
        }
      }
      return this.letterQuote(c);
    },

    fraction: function (c) {
      do {
        c = this.getNextChar();
      } while (this.isDigit(c));

      if(c === 'e' || c === 'E') {
        return exponent();
      }

      if(c === 'j' || c === 'J') {
        return imaginary(c);
      }

      this.backupOneChar();
      return {
        token: NUMBER,
        start: this.startOfToken,
        end: this.charIndex + 1
      };
    },

    exponent: function () {
      c = this.getNextChar();
      if(c === '+' || c === '-') {
        c = this.getNextChar();
        if(!this.isDigit(c)) {
          this.backupOneChar();
          return {
            error: Error.TOKEN,
            token: Token.ERRORTOKEN
          };
        }
      } else if(!this.isDigit(c)) {
        this.backupOneChar();
        this.backupOneChar();
        return {
          token: Token.NUMBER,
          start: this.startOfToken,
          end: this.charIndex + 1
        };
      }
      do {
        c = this.getNextChar();
      } while(this.isDigit(c));

      if(c === 'j' || c === 'J') {
        return this.imaginary(c);
      }

      this.backupOneChar();
      return {
        token: NUMBER,
        start: this.startOfToken,
        end: this.charIndex + 1
      };
    },

    imaginary: function (c) {
      return {
        token: NUMBER,
        start: this.startOfToken,
        end: this.charIndex + 1
      };
    },

    letterQuote: function (c) {
      var quote, quoteSize, endQuoteSize;

      if(c === '"' || c === "'") {
        quote = c;
        quoteSize = 1;
        endQuoteSize = 0;

        c = this.getNextChar();
        if(c === quote) {
          c = this.getNextChar();
          if(c === quote) {
            quoteSize = 3;
          } else {
            endQuoteSize = 1;
          }
        }

        if(c !== quote) {
          this.backupOneChar();
        }

        while(endQuoteSize !== quoteSize) {
          c = this.getNextChar();
          if(!c) {
            if(quoteSize === 3) {
              return { error: Error.EOFS, token: Token.ERRORTOKEN };
            } else {
              return { error: Error.EOLS, token: Token.ERRORTOKEN };
            }
          }
          if(quoteSize === 1 && c === '\n') {
            return { error: Error.EOLS, token: Token.ERRORTOKEN };
          }
          if(c === quote) {
            endQuoteSize += 1;
          } else {
            endQuoteSize = 0;
            if(c === '\\') {
              c = this.getNextChar();
            }
          }
        }

        return {
          token: Token.STRING,
          start: this.startOfToken,
          end: this.charIndex + 1
        };
      }

      return this.lineContinuation(c);
    },

    lineContinuation: function (c) {
      if(c === '\\') {
        c = this.getNextChar();
        if(c !== '\n') {
          return { error: Error.LINECONT, token: Token.ERRORTOKEN };
        }
        this.contLine = true;
        return this.again();
      }

      return this.twoCharacter(c);
    },

    twoCharacter: function (c) {
      var c2, c3, token, token3;

      c2 = this.getNextChar();
      token = this.twoCharToken(c, c2);
      if(token !== Token.OP) {
        c3 = this.getNextChar();
        token3 = this.threeCharToken(c, c2, c3);
        if(token3 !== Token.OP) {
          token = token3;
        } else {
          this.backupOneChar();
        }
        return {
          token: token,
          start: this.startOfToken,
          end: this.charIndex + 1
        };
      }
      this.backupOneChar();

      return this.parenthesesCheck(c);
    },

    parenthesesCheck: function (c) {
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

      return this.oneCharacter(c);
    },

    oneCharacter: function (c) {
      return {
        token: this.oneCharToken(c),
        start: this.startOfToken,
        end: this.charIndex + 1
      };
    },

    isPotentialIdentifierStart: function (c) {
      var code;

      code = c.charCodeAt(0);

      return ((code > 64 && code < 91)  || // Uppercase
              (code > 96 && code < 123) || // Lowercase
              (code >= 128)             || // More than ASCII
              (c === '_'));
    },

    isPotentialIdentifierChar: function (c) {
      var code;

      code = c.charCodeAt(0);

      return ((code > 64 && code < 91)  || // Uppercase
              (code > 96 && code < 123) || // Lowercase
              (code > 47 && code < 58)  || // Digit
              (code >= 128)             || // More than ASCII
              (c === '_'));
    },

    countIndentsAndDedents: function () {
      var col;

      col = 0;
      c = this.getNextChar();

      // Supporting only whitespace for now.
      // TODO Add support for tabs and form-feed
      while(c === ' ') {
        col++;
        c = this.getNextChar();
      }

      this.backupOneChar();

      // TODO Add support for interactive mode
      if(c === '\#' || c === '\n') {
        this.blankline = true;
      }

      if(!this.blankline && this.level === 0) {
        if(col > this.indstack[this.indent]) {
          if(this.indent + 1 >= MAXINDENT) {
            return { error: Errors.TOODEEP, token: Tokens.ERRORTOKEN };
          }
          this.pending++;
          this.indstack[++this.indent] = col;
        } else if (col < this.indstack[this.indent]) {
          while(this.indent > 0 && col < this.indstack[this.indent]) {
            this.pending--;
            this.indent--;
          }
          if(col !== this.indstack[this.indent]) {
            return { error: Errors.DEDENT, token: Tokens.ERRORTOKEN };
          }
        }
      }
    },

    isDigit: function (c) {
      return !isNaN(c);
    },

    isXDigit: function (c) {
      var charCode;

      charCode = c.charCodeAt(0);
      return (isDigit(c) || 
             (charCode >= 65 && charCode <= 70) || //A to F
             (charCode >= 97 && charCode <= 102)); //a to f
    },

    oneCharToken: function (c) {
      switch (c) {
        case '(':           return Token.LPAR;
        case ')':           return Token.RPAR;
        case '[':           return Token.LSQB;
        case ']':           return Token.RSQB;
        case ':':           return Token.COLON;
        case ',':           return Token.COMMA;
        case ';':           return Token.SEMI;
        case '+':           return Token.PLUS;
        case '-':           return Token.MINUS;
        case '*':           return Token.STAR;
        case '/':           return Token.SLASH;
        case '|':           return Token.VBAR;
        case '&':           return Token.AMPER;
        case '<':           return Token.LESS;
        case '>':           return Token.GREATER;
        case '=':           return Token.EQUAL;
        case '.':           return Token.DOT;
        case '%':           return Token.PERCENT;
        case '{':           return Token.LBRACE;
        case '}':           return Token.RBRACE;
        case '^':           return Token.CIRCUMFLEX;
        case '~':           return Token.TILDE;
        case '@':           return Token.AT;
        default:            return Token.OP;
      }
    },

    twoCharToken: function (c1, c2) {
      switch (c1) {
        case '=':
          switch (c2) {
            case '=':               return Token.EQEQUAL;
          }
          break;
        case '!':
          switch (c2) {
            case '=':               return Token.NOTEQUAL;
          }
          break;
        case '<':
          switch (c2) {
            case '>':               return Token.NOTEQUAL;
            case '=':               return Token.LESSEQUAL;
            case '<':               return Token.LEFTSHIFT;
          }
          break;
        case '>':
          switch (c2) {
            case '=':               return Token.GREATEREQUAL;
            case '>':               return Token.RIGHTSHIFT;
          }
          break;
        case '+':
          switch (c2) {
            case '=':               return Token.PLUSEQUAL;
          }
          break;
        case '-':
          switch (c2) {
            case '=':               return Token.MINEQUAL;
            case '>':               return Token.RARROW;
          }
          break;
        case '*':
          switch (c2) {
            case '*':               return Token.DOUBLESTAR;
            case '=':               return Token.STAREQUAL;
          }
          break;
        case '/':
          switch (c2) {
            case '/':               return Token.DOUBLESLASH;
            case '=':               return Token.SLASHEQUAL;
          }
          break;
        case '|':
          switch (c2) {
            case '=':               return Token.VBAREQUAL;
          }
          break;
        case '%':
          switch (c2) {
            case '=':               return Token.PERCENTEQUAL;
          }
          break;
        case '&':
          switch (c2) {
            case '=':               return Token.AMPEREQUAL;
          }
          break;
        case '^':
          switch (c2) {
            case '=':               return Token.CIRCUMFLEXEQUAL;
          }
          break;
        case '@':
          switch (c2) {
            case '=':               return Token.ATEQUAL;
          }
          break;
      }
      return Token.OP;
    },

    threeCharToken: function (c1, c2, c3) {
      switch (c1) {
        case '<':
          switch (c2) {
            case '<':
              switch (c3) {
                case '=':
                  return Token.LEFTSHIFTEQUAL;
              }
              break;
          }
          break;
        case '>':
          switch (c2) {
            case '>':
              switch (c3) {
                case '=':
                  return Token.RIGHTSHIFTEQUAL;
              }
              break;
          }
          break;
        case '*':
          switch (c2) {
            case '*':
              switch (c3) {
                case '=':
                  return Token.DOUBLESTAREQUAL;
              }
              break;
          }
          break;
        case '/':
          switch (c2) {
            case '/':
              switch (c3) {
                case '=':
                  return Token.DOUBLESLASHEQUAL;
              }
              break;
          }
          break;
        case '.':
          switch (c2) {
            case '.':
              switch (c3) {
                case '.':
                  return Token.ELLIPSIS;
              }
              break;
          }
          break;
      }
      return Token.OP;
    }
  });
});
