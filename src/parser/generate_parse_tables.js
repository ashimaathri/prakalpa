// TODO
// Calculate the first set
// Replace label number with token or non terminal name
define([
  'dojo/_base/declare',
  './non_terminals'
], function (declare, NonTerminals) {
  return declare([], {
    constructor: function (opts) {
      lang.mixin(this, opts);
      this.dfas = [
        {
          nonTerminal: NonTerminals.MSTART,
          states: [
           [
             { label: 2, arrow: 0 },
             { label: 3, arrow: 0 },
             { label: 4, arrow: 1 },
           ],
           [
             { label: 0, arrow: 1 }
           ]
          ],
          first_set: []
        },
        {
          nonTerminal: NonTerminals.RULE,
          states: [
            [
              { label: 5, arrow: 1 }
            ],
            [
              { label: 6, arrow: 2 }
            ],
            [
              { label: 7, arrow: 3 }
            ],
            [
              { label: 3, arrow: 4 }
            ],
            [
              { label: 0, arrow: 4 }
            ]
          ],
          first_set: []
        },
        {
          nonTerminal: NonTerminals.RHS,
          states: [
            [
              { label: 8, arrow: 1}
            ],
            [
              { label: 9, arrow: 0},
              { label: 0, arrow: 1}
            ]
          ],
          first_set: []
        },
        {
          nonTerminal: NonTerminals.ALT,
          states: [
            [
              { label: 10, arrow: 1 }
            ],
            [
              { label: 10, arrow: 1 },
              { label: 0, arrow: 1 }
            ]
          ],
          first_set: []
        },
        {
          nonTerminal: NonTerminals.ITEM,
          states: [
            [
              { label: 11, arrow: 1 },
              { label: 13, arrow: 2 }
            ],
            [
              { label: 7, arrow: 3}
            ],
            [
              { label: 14, arrow: 4 }
              { label: 15, arrow: 4 }
              { label: 0, arrow: 2 }
            ],
            [
              { label: 12, arrow: 4 }
            ],
            [
              { label: 0, arrow: 4 }
            ]
          ],
          first_set: []
        },
        {
          nonTerminal: NonTerminals.ATOM,
          states: [
            [
              { label: 5, arrow: 1 }
              { label: 16, arrow: 1 }
              { label: 17, arrow: 2 }
            ],
            [
              { label: 0, arrow: 1 }
            ],
            [
              { label: 7, arrow: 3 }
            ],
            [
              { label: 18, arrow: 1 }
            ],
          ],
          first_set: []
        },
      ];
    }
  });
});
