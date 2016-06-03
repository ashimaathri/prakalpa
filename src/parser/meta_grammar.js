/* This meta-grammar is hand-written and will be used to
 * generate the DFAs of the actual Python grammar
 */
define([
  './non_terminals',
  '../tokens'
], function (NonTerminals, Tokens) {
  return ({
    'MSTART': {
      states: [
       {
         arcs: [
           { label: NonTerminals.RULE, arrow: 0 },
           { label: Tokens.NEWLINE, arrow: 0 },
           { label: Tokens.ENDMARKER, arrow: 1 }
         ],
         isAccepting: false
       },
       {
         arcs: [],
         isAccepting: true
       }
      ],
      firstSet: [Tokens.NEWLINE, Tokens.NAME]
    },
    'RULE': {
      states: [
        {
          arcs: [
            { label: Tokens.NAME, arrow: 1 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: Tokens.COLON, arrow: 2 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: NonTerminals.RHS, arrow: 3 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: Tokens.NEWLINE, arrow: 4 }
          ],
          isAccepting: false
        },
        {
          arcs: [],
          isAccepting: true
        }
      ],
      firstSet: [Tokens.NAME]
    },
    'RHS': {
      states: [
        {
          arcs: [
            { label: NonTerminals.ALT, arrow: 1}
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: Tokens.VBAR, arrow: 0},
          ],
          isAccepting: true
        }
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    },
    'ALT': {
      states: [
        {
          arcs: [
            { label: NonTerminals.ITEM, arrow: 1 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: NonTerminals.ITEM, arrow: 1 },
          ],
          isAccepting: true
        }
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    },
    'ITEM': {
      states: [
        {
          arcs: [
            { label: Tokens.LSQB, arrow: 1 },
            { label: NonTerminals.ATOM, arrow: 2 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: NonTerminals.RHS, arrow: 3}
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: Tokens.STAR, arrow: 4 },
            { label: Tokens.PLUS, arrow: 4 }
          ],
          isAccepting: true
        },
        {
          arcs: [
            { label: Tokens.RSQB, arrow: 4 }
          ],
          isAccepting: false
        },
        {
          arcs: [],
          isAccepting: true
        }
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    },
    'ATOM': {
      states: [
        {
          arcs: [
            { label: Tokens.NAME, arrow: 1 },
            { label: Tokens.STRING, arrow: 1 },
            { label: Tokens.LPAR, arrow: 2 }
          ],
          isAccepting: false
        },
        {
          arcs: [],
          isAccepting: true
        },
        {
          arcs: [
            { label: NonTerminals.RHS, arrow: 3 }
          ],
          isAccepting: false
        },
        {
          arcs: [
            { label: Tokens.RPAR, arrow: 1 }
          ],
          isAccepting: false
        }
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR]
    },
  });
});
