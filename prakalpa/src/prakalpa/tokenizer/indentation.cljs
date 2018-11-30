(ns prakalpa.tokenizer.indentation
  (:require
    [prakalpa.exceptions :as exceptions]
    [prakalpa.constants.error-messages :as error-messages]))

(defn compute-indentation
  "Returns the total number of spaces preceding the first non-blank character
  as the line's indentation. Leading whitespace (spaces only for prakalpa) at
  the beginning of a logical line is used to compute the indentation level of
  the line. Indentation cannot be split over multiple physical lines using
  backslashes; the whitespace up to the first backslash determines the
  indentation. See more at https://docs.python.org/2.0/ref/indentation.html."
  [line]
  (count (take-while #(= " " %) line)))
  
(defn process-indent
  "Increments `indent-level` count by 1 and pushes current indent onto
  `indentation-stack`.
  Throws exception if `indent` has exceeded the maximum allowed indentation.
  Returns hashmap with updated `indent-level` and `indentation-stack`."
  [indent indentation-stack indent-level]
  (let [max-indent-level 100]
    (if (>= (inc indent) max-indent-level)
      (throw (exceptions/ParseError. error-messages/toodeep))
      {:indent-level (inc indent-level)
       :indentation-stack (conj indentation-stack indent)})))

(defn process-dedent
  "Decrements `indent-level` count by number of dedents and pops matching
  indents from `indentation-stack`.
  Throws exception if most recent indentation level does not match current
  indent.
  Returns hashmap with updated `indent-level` and `indentation-stack`."
  [indent indentation-stack indent-level]
  (let [[dedents dedented-stack] (split-with #(< indent %) indentation-stack)] 
    (if (not= indent (first dedented-stack))
      (throw (exceptions/ParseError. error-messages/dedent))
      {:indent-level (- indent-level (count dedents))
       :indentation-stack dedented-stack})))


; process enclosure-level in calling function Ensure that the first line has no
; indentation (0 white-space characters); if it does, report an error.
; indentation-stack should be initialized to have one entry = 0 (indicating no
; indentation) indent/dedent inside enclosure \( or \[ is ignored; \{ is not
; allowed in python afaik.
; enclosing function should check if line is blank or not
(defn track
  "Used to keep track of indentation in the python script. Algorithm based on
  [Tokens and Python's Lexical Structure](
  https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf).  Returns hashmap
  with updated `indent-level` count and `indentation-stack`."
  [line indentation-stack indent-level]
  (let [current-indent (compute-indentation line)
        most-recent-indent (first indentation-stack)]
    (cond
      (> current-indent most-recent-indent) (process-indent current-indent
                                                            indentation-stack
                                                            indent-level)
      (< current-indent most-recent-indent) (process-dedent current-indent
                                                            indentation-stack
                                                            indent-level)
      :else {:indent-level indent-level :indentation-stack indentation-stack})))
