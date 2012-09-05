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

var convertElementToObject = function(xmlElement, convertTypes) {
	var convertTypes = convertTypes === false ? false : true;
	var childElements = xmlElement.find("./*");

	// if there are no children, parse the content
	if (childElements.length === 0) {
		var value =  xmlElement.text();
		if (convertTypes) {
			var numberValue = Number(value);
			var lowerValue = value.toLowerCase();
			if (!isNaN(numberValue)) {
				value = numberValue;
			}
			else if (lowerValue === "true") {
				value = true;
			}
			else if (lowerValue === "false") {
				value = false;
			}
		}
		return value;
	}
	// otherwise create an object/array from the child elements
	else {
		// if there's 1 child, it's an array, otherwise we have to detect repeated element names
		var elementIsList = childElements.length === 1;
		var resultObject = elementIsList ? [] : {};

		childElements.forEach(function(childElement) {
			var childName = childElement.name();

			if (!elementIsList) {
				// if we're trying to overwrite the same name, we're actually a list
				if (resultObject.hasOwnProperty(childName)) {
					elementIsList = true;
					var newResultObject = [];
					for (var key in resultObject) {
						newResultObject.push(resultObject[key]);
					}
					resultObject = newResultObject;
				}
			}

			var childObject = convertElementToObject(childElement, convertTypes);
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
