(ns prakalpa.tokenizer.core
  (:require
  [prakalpa.constants.tokens :as tokens]
  [prakalpa.tokenizer.indentation :as indentation]))

(defn is-blank?
  "Returns true if line contains only spaces, and possibly a comment
  See more at https://docs.python.org/2.0/ref/blank-lines.html."
  [line]
  (let [first-non-space-char (first (drop-while #(= " " %) line))]
    (or (= first-non-space-char "#") (= first-non-space-char "\n"))))

(defn token-for-one-character
  "Returns token corresponding to character `c`"
  [c]
  (get {":" tokens/colon
        ";" tokens/semi
        "%" tokens/percent
        "&" tokens/amper
        "(" tokens/lpar
        ")" tokens/rpar
        "*" tokens/star
        "+" tokens/plus
        "," tokens/comma
        "-" tokens/minus
        "." tokens/dot
        "/" tokens/slash
        "<" tokens/less
        "=" tokens/equal
        ">" tokens/greater
        "@" tokens/at
        "[" tokens/lsqb
        "]" tokens/rsqb
        "^" tokens/circumflex
        "{" tokens/lbrace
        "|" tokens/vbar
        "}" tokens/rbrace
        "~" tokens/tilde} c tokens/op))

(defn token-for-two-characters
  "Returns token corresponding to two character string s"
  [s]
  (get {"==" tokens/eqequal
        "!=" tokens/notequal
        "<>" tokens/notequal
        "<=" tokens/lessequal
        "<<" tokens/leftshift
        ">=" tokens/greaterequal
        ">>" tokens/rightshift
        "+=" tokens/plusequal
        "-=" tokens/minequal
        "->" tokens/rarrow
        "**" tokens/doublestar
        "*=" tokens/starequal
        "//" tokens/doubleslash
        "/=" tokens/slashequal
        "|=" tokens/vbarequal
        "%=" tokens/percentequal
        "&=" tokens/amperequal
        "^=" tokens/circumflexequal
        "@=" tokens/atequal} s))

(defn token-for-three-characters
  "Returns token corresponding to three character string s"
  [s]
  (get {"<<=" tokens/leftshiftequal
        ">>=" tokens/rightshiftequal
        "**=" tokens/doublestarequal
        "//=" tokens/doubleslashequal} s))

(defn update-nesting-level
  "Updates the `nesting-level` based on whether the current character `c` opens
  or closes an enclosure"
  [c nesting-level]
  (cond
    (some #(= c %) ["(" "[" "{"]) (inc nesting-level)
    (some #(= c %) [")" "]" "}"]) (dec nesting-level)
    :else nesting-level))

(defn initialize
  "Initializes state of tokenizer. `line-num` and `column-num` are 1-indexed.
  So at the beginning we're at the first line, no column (0). `char-index` is
  the actual index into the `source-text`. `nesting-level` is the level of
  enclosure within (, [, { and indent-level is the current level of indentation."
  [source-text]
  {:line-num 1
   :column-num 0
   :char-index -1
   :nexting-level 0
   :indentation-stack '(0)
   :indent-level 0
   :source-text source-text
   :at-beginning-of-line? true
   :lines (clojure.string/split-lines source-text)
   :num-chars (count source-text)})

(defn get-current-char
  "Get's the character that the `tokenizer` is at currently"
  [{:keys [source-text char-index]}]
  (nth source-text char-index))

(defn get-current-line
  ""
  [{:keys [lines line-num]}]
  (nth lines line-num))

(defn reached-end?
  "Checks if we've reached the end of the source text to be tokenized"
  [{:keys [char-index num-chars]}]
  (= char-index num-chars))

(defn at-start?
  "Checks if we're at the start of the source text to be tokenized"
  [{:keys [char-index]}]
  (= char-index -1))

(defn is-newline?
  "Checks if next-char is a newline"
  [character]
  (= "\n" character))

(defn next-line
  "Returns tokenizer moved to first character of next line in the source text"
  [{:keys [line-num char-index] :as tokenizer}]
  (assoc tokenizer :line-num (inc line-num) :column-num 0 :char-index (inc char-index)))

(defn next-column
  "Returns tokenizer moved to next column of the current line in the source text"
  [{:keys [column-num char-index] :as tokenizer}]
  (assoc tokenizer :column-num (inc column-num) :char-index (inc char-index)))

(defn prev-column
  "Returns tokenizer moved to prev column of the current line in the source text"
  [{:keys [column-num char-index] :as tokenizer}]
  (assoc tokenizer :column-num (dec column-num) :char-index (dec char-index)))

(defn prev-line
  "Returns tokenizer moved to last character of prev line in the source text"
  [{:keys [line-num lines char-index source-text] :as tokenizer}]
  (let [prev-line-num (dec line-num)
        prev-line-length (count (nth lines (dec prev-line-num)))]
    (assoc tokenizer
           :line-num prev-line-num
           :char-index (dec char-index)
           :column-num prev-line-length)))

(defn stepforward
  "Updates the current position (line-num, column-num and char-index in
  source-text) of `tokenizer` as a result of moving one character forward."
  [{:keys [char-index source-text] :as tokenizer}]
  (if (reached-end? tokenizer)
    tokenizer
    (let [next-char (nth source-text (inc char-index))]
      (if (is-newline? next-char)
        (next-line tokenizer)
        (next-column tokenizer)))))

(defn moveforward
  ""
  [tokenizer num-steps]
  (last (take num-steps (iterate stepforward tokenizer))))

(defn stepback
  "Updates the current position (line-num, column-num and char-index in
  source-text) of `tokenizer` as a result of moving one character backward"
  [tokenizer]
  (if (at-start? tokenizer)
    tokenizer
    (if (is-newline? (get-current-char tokenizer))
      (prev-line tokenizer)
      (prev-column tokenizer))))

(defn emit-indent
  "What is pending? pending is same as indent-level. See more"
  [tokenizer]
  (let [tokenizer (process-indent tokenizer)
        {:keys [pending-indents] } tokenizer
        start (select-keys tokenizer [line-num column-num])]
    (cond (< pending-indents 0) ({:tokenizer (assoc tokenizer :pending-indents (inc
                                                                           pending-indents))
                               :token {:type tokens/dedent :start start}})
          (> pending-indents 0) ({:tokenizer (assoc tokenizer :pending-indents (dec
                                                                           pending-indents))
                               :token {:type tokens/dedent :start start}})
    )
  )

(defn process-indent
  ""
  [tokenizer]
  (as-> tokenizer t
      (assoc t :at-beginning-of-line? false)
      (merge t (indentation/track (get-current-line t) t))
      (moveforward t (first (:indentation-stack t)))))

(defn process-blanklines
  ""
  []
  )

(defn get-next
  "Gets the next token in the program"
  [{:keys [at-beginning-of-line?] :as tokenizer}]

  (if at-beginning-of-line? (emit-indent tokenizer)
    ))
