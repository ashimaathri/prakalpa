(ns prakalpa.exceptions)

(defn extend-error
  "Makes `ErrorType` extend the js/Error class"
  [ErrorType]
  (set! (.. ErrorType -prototype) (js/Error.))
  (set! (.. ErrorType -prototype -name) ErrorType))

(deftype ParseError [message & {:keys [:column :line-num]}] Object)

(make-error ParseError)
