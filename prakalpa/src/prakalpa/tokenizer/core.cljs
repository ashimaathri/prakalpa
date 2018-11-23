(ns prakalpa.tokenizer.core)

(defn is-blank?
  "Returns true if line contains only spaces, and possibly a comment
  See more at https://docs.python.org/2.0/ref/blank-lines.html."
  [line]
  (let [first-non-space-char (first (drop-while #(= " " %) line))]
    (or (= first-non-space-char "#") (= first-non-space-char "\n"))))
