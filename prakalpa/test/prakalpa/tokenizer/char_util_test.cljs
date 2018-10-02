(ns prakalpa.tokenizer.char-util-test
  (:require 
    clojure.set
    [prakalpa.tokenizer.char-util :as char-util]
    [clojure.spec.alpha :as spec]
    [cljs.test :refer-macros [are is deftest]]
    [clojure.test.check.clojure-test :refer-macros [defspec]]
    [clojure.test.check :as tc]
    [clojure.test.check.generators :as gen]
    [clojure.test.check.properties :as prop :include-macros true]))

(def digits (set '("0" "1" "2" "3" "4" "5" "6" "7" "8" "9")))
(def digit-char-gen (spec/gen digits))
(def non-digit-char-gen (gen/such-that #(not (digits %)) gen/char))
(def uppercase-hex-digits (set '("A" "B" "C" "D" "E" "F")))
(def uppercase-hex-digit-char-gen (spec/gen uppercase-hex-digits))
(def non-uppercase-hex-digit-char-gen (gen/such-that #(not (uppercase-hex-digits %)) gen/char))
(def lowercase-hex-digits (set (map clojure.string/lower-case uppercase-hex-digits)))
(def lowercase-hex-digit-char-gen (spec/gen lowercase-hex-digits))
(def non-lowercase-hex-digit-char-gen (gen/such-that #(not (lowercase-hex-digits %)) gen/char))
(def hex-digits (clojure.set/union uppercase-hex-digits lowercase-hex-digits digits))
(def hex-digit-char-gen (spec/gen hex-digits))
(def non-hex-digit-char-gen (gen/such-that #(not (hex-digits %)) gen/char))
(def uppercase-letters (set (map String.fromCharCode (range (.charCodeAt "A") (inc (.charCodeAt "Z"))))))
(def uppercase-letter-char-gen (spec/gen uppercase-letters))
(def non-uppercase-letter-char-gen (gen/such-that #(not (uppercase-letters %)) gen/char))
(def lowercase-letters (set (map String.fromCharCode (range (.charCodeAt "a") (inc (.charCodeAt "z"))))))
(def lowercase-letter-char-gen (spec/gen lowercase-letters))
(def non-lowercase-letter-char-gen (gen/such-that #(not (lowercase-letters %)) gen/char))
(def unicode-char-gen (gen/such-that #(< 127 (.charCodeAt %)) gen/char))
(def non-unicode-char-gen (gen/such-that #(> 127 (.charCodeAt %)) gen/char))
(def non-underscore-char-gen (gen/such-that #(not= "_" %) gen/char))

(deftest isDigit?-true-for-digit-chars
  (are [digit] (true? (char-util/isDigit? digit))
    "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"))

(defspec isDigit?-false-for-non-digit-chars 50
  (prop/for-all [non-digit non-digit-char-gen]
                (false? (char-util/isDigit? non-digit))))

(deftest isUppercaseHexDigit?-true-for-uppercase-hex-chars
  (are [uppercase-hex-digit] (true? (char-util/isUppercaseHexDigit? uppercase-hex-digit))
    "A" "B" "C" "D" "E" "F"))

(defspec isUppercaseHexDigit?-false-for-non-uppercase-hex-chars 50
  (prop/for-all [non-uppercase-hex-digit non-uppercase-hex-digit-char-gen]
                (false? (char-util/isUppercaseHexDigit? non-uppercase-hex-digit))))

(deftest isLowercaseHexDigit?-true-for-lowercase-hex-chars
  (are [lowercase-hex-digit] (true? (char-util/isLowercaseHexDigit? lowercase-hex-digit))
    "a" "b" "c" "d" "e" "f"))

(defspec isLowercaseHexDigit?-false-for-non-lowercase-hex-chars 50
  (prop/for-all [non-lowercase-hex-digit non-lowercase-hex-digit-char-gen]
                (false? (char-util/isLowercaseHexDigit? non-lowercase-hex-digit))))

(deftest isHexDigit?-true-for-hex-chars
  (are [hex-digit] (true? (char-util/isHexDigit? hex-digit))
    "a" "b" "c" "d" "e" "f" "A" "B" "C" "D" "E" "F" "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"))

(defspec isHexDigit?-false-for-non-hex-chars 50
  (prop/for-all [non-hex-digit non-hex-digit-char-gen]
                (false? (char-util/isHexDigit? non-hex-digit))))

(deftest isUppercaseLetter?-true-for-uppercase-letter
  (are [uppercase-letter] (true? (char-util/isUppercaseLetter? uppercase-letter))
    "A" "B" "C" "D" "E" "F" "G" "H" "I" "J" "K" "L" "M" "N" "O" "P" "Q" "R" "S" "T" "U" "V" "W" "X" "Y" "Z"))

(defspec isUppercaseLetter?-false-for-non-uppercase-letter-chars 50
  (prop/for-all [non-uppercase-letter non-uppercase-letter-char-gen]
                (false? (char-util/isUppercaseLetter? non-uppercase-letter))))

(deftest isLowercaseLetter?-true-for-lowercase-letter
  (are [lowercase-letter] (true? (char-util/isLowercaseLetter? lowercase-letter))
    "a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o" "p" "q" "r" "s" "t" "u" "v" "w" "x" "y" "z"))

(defspec isLowercaseLetter?-false-for-non-lowercase-letter-chars 50
  (prop/for-all [non-lowercase-letter non-lowercase-letter-char-gen]
                (false? (char-util/isLowercaseLetter? non-lowercase-letter))))

(defspec isUnicode?-true-for-unicode-chars 50
  (prop/for-all [unicode unicode-char-gen]
                (true? (char-util/isUnicode? unicode))))

(defspec isUnicode?-false-for-non-unicode-chars 50
  (prop/for-all [non-unicode non-unicode-char-gen]
                (false? (char-util/isUnicode? non-unicode))))

(deftest isUnderscore?-true-for-underscore
  (is (char-util/isUnderscore? "_")))

(defspec isUnderscore?-false-for-non-underscore-chars 50
  (prop/for-all [non-underscore non-underscore-char-gen]
                (false? (char-util/isUnderscore? non-underscore))))

(defspec isValidIdentifierStart?-true-for-unicode 50
  (prop/for-all [unicode unicode-char-gen]
                (true? (char-util/isValidIdentifierStart? unicode))))

(defspec isValidIdentifierStart?-true-for-letters 50
  (prop/for-all [letter gen/char-alpha]
                (true? (char-util/isValidIdentifierStart? letter))))

(deftest isValidIdentifierStart?-true-for-underscore
  (is (char-util/isValidIdentifierStart? "_")))

(deftest isValidIdentifierStart?-false-for-digits
  (are [digit] (false? (char-util/isValidIdentifierStart? digit))
    "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"))

(deftest isValidIdentifierStart?-false-for-special-ascii
  (are [special-ascii] (false? (char-util/isValidIdentifierStart? special-ascii))
    "" "]" "'" "\r" ")" "=" "`" "\\" "!" "*" "%" "|" "~" "/" "-" "(" "?" "\b" "\f" "\t" "&" " " ":" "<" "." "{" ";" "," "}" "[" "\"" "#" "^" "+" "\n" "$" "@" ">"))

(defspec isValidIdentifierChar?-true-for-unicode 50
  (prop/for-all [unicode unicode-char-gen]
                (true? (char-util/isValidIdentifierChar? unicode))))

(defspec isValidIdentifierChar?-true-for-letters 50
  (prop/for-all [letter gen/char-alpha]
                (true? (char-util/isValidIdentifierChar? letter))))

(deftest isValidIdentifierChar?-true-for-underscore
  (is (char-util/isValidIdentifierChar? "_")))

(deftest isValidIdentifierChar?-true-for-digits
  (are [digit] (true? (char-util/isValidIdentifierChar? digit))
    "0" "1" "2" "3" "4" "5" "6" "7" "8" "9"))

(deftest isValidIdentifierChar?-false-for-special-ascii
  (are [special-ascii] (false? (char-util/isValidIdentifierChar? special-ascii))
    "" "]" "'" "\r" ")" "=" "`" "\\" "!" "*" "%" "|" "~" "/" "-" "(" "?" "\b" "\f" "\t" "&" " " ":" "<" "." "{" ";" "," "}" "[" "\"" "#" "^" "+" "\n" "$" "@" ">"))
