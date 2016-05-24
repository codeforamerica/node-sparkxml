/**
 * Copyright (C) 2012-2015, Code for America
 * This is open source software, released under a standard 3-clause
 * BSD-style license; see the file LICENSE for details.
 */

var libxmljs = require("libxmljs");

/**
 * DEPRECATED: use parse() instead.
 * Parse an XML string and convert it to an object according to the "Spark" convention.
 * @param {String} xmlString The XML to parse
 * @param {Boolean} [parseTypes=true] Whether to automatically parse data types (e.g. <value>5.1</value> is parsed as a number instead of a string.)
 * @type {Object|Array}
 */
exports.parseXml = function(xmlString, options) {
	return exports.parse(xmlString, options)
};

/**
 * Parse an XML string and convert it to an object according to the "Spark" convention.
 * @param {String} xmlString The XML to parse
 * @param {Boolean} [parseTypes=true] Whether to automatically parse data types (e.g. <value>5.1</value> is parsed as a number instead of a string.)
 * @type {Object|Array}
 */
exports.parse = function(xmlString, options) {
	if (typeof(options) === "boolean") {
		options = {parseTypes: options};
	}
	else {
		options = options || {parseTypes: true};
	}

	var document = libxmljs.parseXml(xmlString);
	return convertElementToObject(document.root(), options);
};

/**
 * Converts an element (and its children) into an object by using the Spark convention.
 * This is the main body of all this library.
 * @param {XMLElement} The XML element to convert
 * @param {Boolean} [parseTypes=true] Whether to automatically parse data types (e.g. <value>5.1</value> is parsed as a number instead of a string.)
 *
 * @private
 */
var convertElementToObject = function(xmlElement, options, path) {
	path = path || [];
	options = options || {}
	var parseTypes = options && 'parseTypes' in options ? options.parseTypes : true;
	var childElements = xmlElement.find("./*");
	// var typeHint = hintForPath(options.typeHints, path);
	var typeHint = hintForElement(options.typeHints, xmlElement);

	// if there are no children, parse the content
	if (childElements.length === 0) {
		// text() will give us a string even if the element has no text content, so check how many child nodes it has first
		var value = (xmlElement.childNodes().length === 0) ? null : xmlElement.text();
		return (parseTypes && value != null && value !== "") ? parseValue(value, typeHint) : value;
	}
	// otherwise create an object/array from the child elements
	else {
		// if there's 1 child, it's an array, otherwise we have to detect repeated element names
		var elementIsList = typeHint !== "object" && (childElements.length === 1 || typeHint === "array");
		var resultObject = elementIsList ? [] : {};

		childElements.forEach(function(childElement, index) {
			var prefix = childElement.namespace()
				? (childElement.namespace().prefix() + ":")
				: "";
			var childName = prefix + childElement.name();

			// if we're trying to overwrite the same name, switch to using an array
			if (!elementIsList && typeHint !== "object" && resultObject.hasOwnProperty(childName)) {
				elementIsList = true;
				var newResultObject = [];
				for (var key in resultObject) {
					newResultObject.push(resultObject[key]);
				}
				resultObject = newResultObject;
			}

			var pathElement = elementIsList ? index.toString(10) : childElement.name()
			var childObject = convertElementToObject(childElement, options, path.concat(pathElement));
			if (elementIsList) {
				resultObject.push(childObject);
			}
			else {
				resultObject[childName] = childObject;
			}
		});

		return resultObject;
	}
};

/**
 * Attempts to parse a string as some other type.
 * Right now, this parses numbers and booleans (case insensitive).
 * @param {String} value The text to parse
 * @type {String|Boolean|Number}
 *
 * @private
 */
var parseValue = function(value, hint) {
	if (hint) {
		var hintParser = this[hint[0].toUpperCase() + hint.slice(1)];
		if (hintParser) {
			return hintParser(value);
		}
	}

	var numberValue = Number(value);
	if (!isNaN(numberValue)) {
		return numberValue;
	}

	var lowerValue = value.toLowerCase();
	if (lowerValue === "true") {
		return true;
	}
	else if (lowerValue === "false") {
		return false;
	}

	return value;
};

/**
 * Find the best type hint for a given path. The paths for hints should be JS object paths; * will match any _individual_ path item.
 * @param {Object} hints The type hints in the form {"path.to.item": "type"}
 * @param {Array} path The path to find a hint for as an array
 * @type {String}
 *
 * @private
 */
var hintForPath = function(hints, path) {
	console.log("Matching " + path.join(".") + " against ", hints);
	var specificity = Infinity;
	var match = null;
	for (var hint in hints) {
		if (hint === path.join(".")) {
			console.log("Hint for '" + path.join(".") + "': " + hints[hint]);
			return hints[hint];
		}
		else {
			var hintParts = hint.split(".");
			var len = hintParts.length;
			if (len !== path.length) {
				continue;
			}

			var hintSpecificity = 0;
			for (var i = 0; i < len; i++) {
				var hintPart = hintParts[i];
				if (hintPart === "*") {
					hintSpecificity += 1;
				}
				else if (path[i] !== hintPart) {
					break;
				}
				if (i + 1 === len && hintSpecificity < specificity) {
					specificity = hintSpecificity;
					match = hints[hint];
				}
			}
		}
	}
	console.log("Hint for '" + path.join(".") + "': " + match);
	return match;
};

/**
 * Find the best type hint for a given XML element.
 * The paths for hints should be xpath expressions.
 * @param {Object} hints The type hints in the form {"/path/to/item": "type"}
 * @param {XMLElement} xmlElement The XML element to find a hint for
 * @type {String}
 *
 * @private
 */
var hintForElement = function(hints, xmlElement) {
	for (var hint in hints) {
		if (xmlElement.doc().find(hint).indexOf(xmlElement) !== -1) {
			return hints[hint];
		}
	}
};
