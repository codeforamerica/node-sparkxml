# Node-SparkXML

Node-SparkXML is a a simple Node.js-based XML parser.
It parses according to the "Spark" convention, which is a slight modification of the "Parker" convention.

> The Spark convention is a slight modification of the Parker convention. It treats nested child elements as demarcating the beginning of an array if there is only one kind of child (a repeating element)… Parker almost does this, but if there is only one child in the container, it doesn't think it should be an array. The Spark convention ensures that child is always an array even if there's only one of them.

More info can be found at:
http://wiki.open311.org/JSON_and_XML_Conversion#The_Spark_Convention
http://wiki.open311.org/Parker_vs_Spark

_This library was mainly developed for tools around Open311, which uses the Spark convention, but it could be useful in plenty of other cases._

## Copyright

Copyright (c) 2012-2013 Code for America. See [LICENSE][] for details.

Thanks to Oiva Eskola <https://github.com/oiva> for additional contributions.

[license]: https://github.com/codeforamerica/node-sparkxml/blob/master/LICENSE
