define([
  'dojo/_base/declare',
  'prakalpa/constants/tokens',
], function (declare, Tokens) {
  /**
    * @module prakalpa.utils
    */
  return {
    /**
      * Checks if token is a non-terminal. This method has been added for readability purposes.
      * @param {String} token - type of token
      * @param {Object.<String, prakalpa.parser.DFA>} dfas - Map of DFA type to DFA
      * @returns {Boolean}
      */
    isNonTerminal: function (token, dfas) {
      return token in dfas;
    },

    /**
      * Checks if token is a terminal
      * @param {String} token - type of token
      * @returns {Boolean}
      */
    isTerminal: function (token) {
      return token in Tokens;
    },

    /**
      * Returns token corresponding to one character string
      * @param {string} c - One character string
      * @returns {prakalpa.constants.Tokens} Token type
      */
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

    /**
      * Returns token corresponding to two character string
      * @param {string} c1 - First character
      * @param {string} c2 - Second character
      * @returns {prakalpa.constants.Tokens}
      */
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

    /**
      * Returns token corresponding to three character string
      * @param {string} c1 - First character
      * @param {string} c2 - Second character
      * @param {string} c3 - Third character
      * @returns {prakalpa.constants.Tokens}
      */
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
  };
});
