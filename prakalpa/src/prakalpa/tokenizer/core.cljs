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
  "Initializes state of tokenizer"
  [source-text]
  {:line-num 1
   :column-num -1
   :char-index -1
   :nexting-level 0
   :indentation-stack '(0)
   :indent-level 0
   :source-text source-text
   :at-beginning-of-line? true
   :lines (clojure.string/split-lines source-text)
   :num-chars (count source-text)})

(defn step
  "Updates the current position (line-num, column-num and char-index in
  source-text) of `tokenizer` as a result of moving one character forward."
  [{:keys [line-num column-num char-index num-chars source-text] :as tokenizer}]
  (if (= char-index num-chars) tokenizer
    (let [next-char-index (inc char-index)
          next-char (nth source-text next-char-index)]
      (if (= "\n" next-char)
        (assoc tokenizer :line-num (inc line-num) :column-num -1 :char-index next-char-index)
        (assoc tokenizer :column-num (inc column-num) :char-index next-char-index)))))

(defn process-indentation
  ""
  [tokenizer]
  (let [{:keys [lines
                line-num
                indentation-stack
                indent-level
                at-beginning-of-line?]} tokenizer
        line (nth lines line-num)]
    (if at-beginning-of-line?
      (let [{:keys [indentation-stack indent-level column-num]}
            (indentation/track line indentation-stack indent-level)
            current-indentation (first indentation-stack)]
        (assoc tokenizer
               (take current-indentation (iterate step tokenizer))
               :at-beginning-of-line? false
               :column-num column-num
               :indentation-stack indentation-stack
               :indent-level indent-level))
      tokenizer)))

(defn process-blanklines
  ""
  )

(defn get-next
  "Gets the next token in the program"
  [tokenizer]
    (process-indentation tokenizer))
