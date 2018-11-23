(ns prakalpa.test-runner
  (:require [prakalpa.tokenizer.char-util-test]
            [prakalpa.tokenizer.indentation-test]
            [prakalpa.core-test]
            [cljs.test :refer-macros [run-tests]]))

(run-tests
  'prakalpa.tokenizer.char-util-test
  'prakalpa.tokenizer.indentation-test
  'prakalpa.core-test)
