var sparkxml = require("./sparkxml.js");
var expect = require("chai").expect;

describe("SparkXML", function() {

  it("should work with official sample data", function() {
    // based on content from http://wiki.open311.org/JSON_and_XML_Conversion/
    var xml = '<?xml-stylesheet type="text/xsl" href="xml2json.xslt"?>\n' +
      '<reports ns="http://www.w3.org/2005/Atom" xmlns:georss="http://www.georss.org/georss">' +
        '<entry>' +
          '<id>tag:open311.sfgov.org,2010-04-15:/dev/V1/reports/637619.xml</id>' +
          '<title>A large tree branch is blocking the road</title>' +
          '<updated>2010-04-13T18:30:02-05:00</updated>' +
          '<link rel="self" href="http://open311.sfgov.org/dev/V1/reports/637619.xml"/>' +
          '<author><name>John Doe</name></author>' +
          '<georss-point>40.7111 -73.9565</georss-point>' +
          '<category label="Damaged tree" term="tree-damage" scheme="https://open311.sfgov.org/dev/V1/categories/006.xml">006</category>' +
          '<content type="xml" ns="http://open311.org/spec/georeport-v1">' +
            '<report_id>637619</report_id>' +
            '<address>1600 Market St, San Francisco, CA 94103</address>' +
            '<description>A large tree branch is blocking the road</description>' +
            '<status>created</status>' +
            '<status_notes />' +
            '<policy>The City will inspect and require the responsible party to correct within 24 hours and/or issue a Correction Notice or Notice of Violation of the Public Works Code</policy>' +
          '</content>' +
        '</entry>' +
      '</reports>';

    expect(sparkxml.parse(xml)).to.deep.equal([
      {
        "id":"tag:open311.sfgov.org,2010-04-15:/dev/V1/reports/637619.xml",
        "title":"A large tree branch is blocking the road",
        "updated":"2010-04-13T18:30:02-05:00",
        "link":null,
        "author":[
          "John Doe"
        ],
        "georss-point":"40.7111 -73.9565",
        "category":6,
        "content":{
          "report_id":637619,
          "address":"1600 Market St, San Francisco, CA 94103",
          "description":"A large tree branch is blocking the road",
          "status":"created",
          "status_notes":null,
          "policy":"The City will inspect and require the responsible party to correct within 24 hours and/or issue a Correction Notice or Notice of Violation of the Public Works Code"
        }
      }
    ]);
  });

  it.skip("should include namespaces in the object key", function() {
    var xml = '<things xmlns:georss="http://www.georss.org/georss">' +
        '<id>1</id>' +
        '<georss:point>40.7111 -73.9565</georss:point>' +
      '</things>';
    expect(sparkxml.parse(xml)).to.deep.equal({
      "id": 1,
      "georss:point": "40.7111 -73.9565"
    });
  });

});
