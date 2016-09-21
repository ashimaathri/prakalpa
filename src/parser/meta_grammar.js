/* This meta-grammar is hand-written and will be used to
 * generate the DFAs of the actual Python grammar
 */
define([
  'prakalpa/constants/non_terminals',
  'prakalpa/constants/tokens',
  'prakalpa/parser/dfa_state',
  'prakalpa/parser/dfa'
], function (NonTerminals, Tokens, DFAState, DFA) {
  /**
    * DFAs of a Meta Grammar that defines a language that accepts the Python's grammar
    * The meta grammar is hand-written and will be used to generate the DFAs of the actual Python grammar
    * It consists of 6 DFAs - `MSTART`, `RULE`, `RHS`, `ALT`, `ITEM`, `ATOM`
    * See the [references section](https://github.com/ashimaathri/prakalpa/tree/master/references/Python_metagrammar.pdf) on github for the state diagrams
    * @module prakalpa.parser.MetaGrammar
    */
  return ({
    'MSTART': DFA({
      type: 'MSTART',
      states: [
       DFAState({
         arcs: [
           { label: NonTerminals.RULE, arrow: 0 },
           { label: Tokens.NEWLINE, arrow: 0 },
           { label: Tokens.ENDMARKER, arrow: 1 }
         ]
       }),
       DFAState({
         arcs: [],
         isAccepting: true
       })
      ],
      firstSet: [Tokens.NEWLINE, Tokens.NAME]
    }),
    'RULE': DFA({
      type: 'RULE',
      states: [
        DFAState({
          arcs: [
            { label: Tokens.NAME, arrow: 1 }
          ]
        }),
        DFAState({
          arcs: [
            { label: Tokens.COLON, arrow: 2 }
          ]
        }),
        DFAState({
          arcs: [
            { label: NonTerminals.RHS, arrow: 3 }
          ]
        }),
        DFAState({
          arcs: [
            { label: Tokens.NEWLINE, arrow: 4 }
          ]
        }),
        DFAState({
          arcs: [],
          isAccepting: true
        })
      ],
      firstSet: [Tokens.NAME]
    }),
    'RHS': DFA({
      type: 'RHS',
      states: [
        DFAState({
          arcs: [
            { label: NonTerminals.ALT, arrow: 1}
          ]
        }),
        DFAState({
          arcs: [
            { label: Tokens.VBAR, arrow: 0},
          ],
          isAccepting: true
        })
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    }),
    'ALT': DFA({
      type: 'ALT',
      states: [
        DFAState({
          arcs: [
            { label: NonTerminals.ITEM, arrow: 1 }
          ]
        }),
        DFAState({
          arcs: [
            { label: NonTerminals.ITEM, arrow: 1 },
          ],
          isAccepting: true
        })
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    }),
    'ITEM': DFA({
      type: 'ITEM',
      states: [
        DFAState({
          arcs: [
            { label: Tokens.LSQB, arrow: 1 },
            { label: NonTerminals.ATOM, arrow: 2 }
          ]
        }),
        DFAState({
          arcs: [
            { label: NonTerminals.RHS, arrow: 3}
          ]
        }),
        DFAState({
          arcs: [
            { label: Tokens.STAR, arrow: 4 },
            { label: Tokens.PLUS, arrow: 4 }
          ],
          isAccepting: true
        }),
        DFAState({
          arcs: [
            { label: Tokens.RSQB, arrow: 4 }
          ]
        }),
        DFAState({
          arcs: [],
          isAccepting: true
        })
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR, Tokens.LSQB]
    }),
    'ATOM': DFA({
      type: 'ATOM',
      states: [
        DFAState({
          arcs: [
            { label: Tokens.NAME, arrow: 1 },
            { label: Tokens.STRING, arrow: 1 },
            { label: Tokens.LPAR, arrow: 2 }
          ]
        }),
        DFAState({
          arcs: [],
          isAccepting: true
        }),
        DFAState({
          arcs: [
            { label: NonTerminals.RHS, arrow: 3 }
          ]
        }),
        DFAState({
          arcs: [
            { label: Tokens.RPAR, arrow: 1 }
          ]
        })
      ],
      firstSet: [Tokens.NAME, Tokens.STRING, Tokens.LPAR]
    }),
  });
});
