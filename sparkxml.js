var libxmljs = require("libxmljs");

/**
 * Parse an XML string and convert it to an object according to the "Spark" convention.
 * @param {String} xmlString The XML to parse
 * @param {Boolean} [parseTypes=true] Whether to automatically parse data types (e.g. <value>5.1</value> is parsed as a number instead of a string.)
 * @type {Object|Array}
 */
exports.parseXml = function(xmlString, parseTypes) {
	var document = libxmljs.parseXml(xmlString);
	return convertElementToObject(document.root(), parseTypes);
};

/**
 * Converts an element (and its children) into an object by using the Spark convention.
 * This is the main body of all this library.
 * @param {XMLElement} The XML element to convert
 * @param {Boolean} [parseTypes=true] Whether to automatically parse data types (e.g. <value>5.1</value> is parsed as a number instead of a string.)
 *
 * @private
 */ 
var convertElementToObject = function(xmlElement, parseTypes) {
	var parseTypes = parseTypes === false ? false : true;
	var childElements = xmlElement.find("./*");

	// if there are no children, parse the content
	if (childElements.length === 0) {
		var value = xmlElement.text();
		return parseTypes ? parseValue(value) : value;
	}
	// otherwise create an object/array from the child elements
	else {
		// if there's 1 child, it's an array, otherwise we have to detect repeated element names
		var elementIsList = childElements.length === 1;
		var resultObject = elementIsList ? [] : {};

		childElements.forEach(function(childElement) {
			var childName = childElement.name();

			// if we're trying to overwrite the same name, switch to using an array
			if (!elementIsList && resultObject.hasOwnProperty(childName)) {
				elementIsList = true;
				var newResultObject = [];
				for (var key in resultObject) {
					newResultObject.push(resultObject[key]);
				}
				resultObject = newResultObject;
			}

			var childObject = convertElementToObject(childElement, parseTypes);
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
var parseValue = function(value) {
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
