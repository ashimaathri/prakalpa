(ns prakalpa.tokenizer.char-util)

(defn isDigit?
  "Checks if `character` is a decimal digit [0-9] or not."
  [character]
  (if (char? character)
    (let [charCode (.charCodeAt character)]
      (and
        (>= charCode (.charCodeAt \0))
        (<= charCode (.charCodeAt \9))
        true))
    false))

(defn isUppercaseHexDigit?
  "Checks if `character` is an uppercase hexadecimal digit [A-F] or not."
  [character]
  (if (char? character)
    (let [charCode (.charCodeAt character)]
      (and
        (>= charCode (.charCodeAt \A))
        (<= charCode (.charCodeAt \F))
        true))
    false))

(defn isLowercaseHexDigit?
  "Checks if `character` is a lowercase hexadecimal digit [a-f] or not."
  [character]
  (if (char? character)
    (let [charCode (.charCodeAt character)]
      (and
        (>= charCode (.charCodeAt \a))
        (<= charCode (.charCodeAt \f))
        true))
    false))

(defn isHexDigit?
  "Checks if `character` is a hexadecimal digit or not."
  [character]
  (or
    (isDigit? character)
    (isUppercaseHexDigit? character)
    (isLowercaseHexDigit? character)))

(defn isUppercaseLetter?
  "Checks if `character` is an uppercase letter [A-Z]"
  [character]
  (if (char? character)
    (let [charCode (.charCodeAt character)]
      (and
        (>= charCode (.charCodeAt \A))
        (<= charCode (.charCodeAt \Z))
        true))
    false))

(defn isLowercaseLetter?
  "Checks if `character` is a lowercase letter [a-z]"
  [character]
  (if (char? character)
    (let [charCode (.charCodeAt character)]
      (and
        (>= charCode (.charCodeAt \a))
        (<= charCode (.charCodeAt \z))
        true))
    false))

(defn isUnicode?
  "Checks if `character` is unicode"
  [character]
  (and
    (char? character)
    (> (.charCodeAt character) 127)))

(defn isUnderscore?
  "Checks if `character` is an underscore"
  [character]
  (and
    (char? character)
    (= character "_")))

(defn isValidIdentifierStart?
  "Checks if the `character` is a valid start character of a python identifier."
  [character]
  (or
    (isUnicode? character)
    (isUnderscore? character)
    (isUppercaseLetter? character)
    (isLowercaseLetter? character)))

(defn isValidIdentifierChar?
  "Checks if the `character` is a valid character of a python identifier."
  [character]
  (or
    (isDigit? character)
    (isValidIdentifierStart? character)))
