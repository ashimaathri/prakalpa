(ns prakalpa.tokenizer.indentation)

(defn compute-indentation
  "Returns the total number of spaces preceding the first non-blank character
  as the line's indentation. Leading whitespace (spaces only for prakalpa) at
  the beginning of a logical line is used to compute the indentation level of
  the line. Indentation cannot be split over multiple physical lines using
  backslashes; the whitespace up to the first backslash determines the
  indentation. See more at https://docs.python.org/2.0/ref/indentation.html."
  [line]
  (count (take-while #(= " " %) line)))

(defn is-blank?
  "Returns true if line contains only spaces, and possibly a comment
  See more at https://docs.python.org/2.0/ref/blank-lines.html."
  [line]
  (let [first-non-space-char (first (drop-while #(= " " %) line))]
    (or (= first-non-space-char "#") (= first-non-space-char "\n"))))
  
(defn process-indent
  "Increments `pending` count by 1 and pushes current indent onto
  `indentation-stack`.
  Throws exception if `indent` has exceeded the maximum allowed indentation.
  Returns hashmap with updated `pending` and `indentation-stack`."
  [indent indentation-stack pending]
  (let [max-indent-level 100]
    (if (>= (inc indent) max-indent-level)
      "TOODEEP Error"
      {:pending (inc pending)
       :indentation-stack (conj indentation-stack indent)})))

(defn process-dedent
  "Decrements `pending` count by number of dedents and pops matching indents
  from `indentation-stack`.
  Throws exception if most recent indentation level does not match current
  indent.
  Returns hashmap with updated `pending` and `indentation-stack`."
  [indent indentation-stack pending]
  (let [[dedents dedented-stack] (split-with #(< indent %) indentation-stack)] 
    (if (not= indent (first dedented-stack))
      "DEDENT Error"
      {:pending (- pending (count dedents))
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
  https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf).
  Returns hashmap with updated `pending` count and `indentation-stack`."
  [line indentation-stack pending]
  (let [current-indent (compute-indentation line)
        most-recent-indent (first indentation-stack)]
    (cond
      (> current-indent most-recent-indent) (process-indent current-indent
                                                            indentation-stack
                                                            pending)
      (< current-indent most-recent-indent) (process-dedent current-indent
                                                            indentation-stack
                                                            pending)
      :else {:pending pending :indentation-stack indentation-stack})))
