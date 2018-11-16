(ns prakalpa.tokenizer.core)

(defn get-indent
  [line]
  (count (take-while #(= " " %) line)))

; process enclosure-level in calling function
; indentation-stack should be initialized to have one entry = 0 (indicating no indentation)
; indent/dedent inside enclosure \( or \[ is ignored; \{ is not allowed in python afaik.
(defn track-indents-and-dedents
  [line indentation-stack pending-count]
  (if (clojure.string/blank? line)
    {:pending-count pending-count
     :indentation-stack indentation-stack}
    (let [indent (get-indent line)
          max-indent-level 100
          most-recent-indent (first indentation-stack)]
      (cond
        (> indent most-recent-indent) (if (>= (inc indent) max-indent-level)
                                        "TOODEEP Error"
                                        {:pending-count (inc pending-count)
                                         :indentation-stack (conj indentation-stack indent)})
        (< indent most-recent-indent) (let [[dedents dedented-stack] (split-with #(< indent %) indentation-stack)
                                            updated-pending-count (- pending-count (count dedents))]
                                        (if (not= indent (first dedented-stack))
                                          "DEDENT Error"
                                          {:pending-count updated-pending-count
                                           :indentation-stack dedented-stack}))))))
