(ns prakalpa.tokenizer.indentation-test
  (:require 
    [prakalpa.tokenizer.indentation :as indentation]
    [cljs.test :refer-macros [are is deftest]]
    [clojure.test.check.clojure-test :refer-macros [defspec]]
    [clojure.test.check.generators :as gen]
    [clojure.test.check.properties :as prop :include-macros true]))

(deftest track
  (deftest indent
    (is (=
         {:indentation-stack '(3 2 0) :pending 2}
         (indentation/track "   def abc():" '(2 0) 1))
      "Increments pending by 1 and pushes new indent to stack")
    (is (=
         "TOODEEP Error"
         (let [deeply-indented (apply str (concat (take 99 (repeat " ")) "def abc():"))]
           (indentation/track deeply-indented '(2 0) 1)))
        "Throws error if size of indentation exceeds max size"))
  (deftest dedent
    (is (=
         {:indentation-stack '(2 1 0) :pending 2}
         (indentation/track "  def abc():" '(7 6 5 4 3 2 1 0) 7))
        "Decrements pending by number of dedents and pops the dedents from the stack")
    (is (=
         "DEDENT Error"
         (indentation/track "  def abc():" '(4 1 0) 2))
        "Throws error if size of current indent doesn't match most recent indent after stack pops"))
  (deftest no-indent-or-dedent
    (is (=
         {:indentation-stack '(7 6 5 4 3 2 1 0) :pending 7}
         (indentation/track "       def abc():" '(7 6 5 4 3 2 1 0) 7))
        "Does not modify pending or stack")))
