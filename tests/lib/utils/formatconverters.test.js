const assert = require("assert");
const formatConverters = require("../../../lib/utils/formatconverters");

const createValidLorawanJson = () => {
  return {
    id: "SignalStrengthSensor1",
    type: "SignalSensor",
    rssi: {
      value: 23,
      type: "Number",
      metadata: {},
    },
    numberOfSatellites: {
      value: 4,
      type: "Number",
      metadata: {},
    },
    batteryVoltage: {
      value: 3.3,
      type: "Number",
      metadata: {},
    },
    temperature: {
      value: 7.5,
      type: "Number",
      metadata: {},
    },
    location: {
      type: "geo:json",
      value: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [16.49997409901628, 59.375313214375225],
        },
      },
    },
    timestamp: {
      value: "2021-06-03T07:21:24.238Z",
      type: "DateTime",
    },
  };
};

describe("formatConverters", function () {
  describe("jsonPointToInsertGML()", function () {
    it("should return a valid GML file when provided with a valid JSON", function () {
        // Given 
        const validJson = createValidLorawanJson();
        // When 
    
      const result = formatConverters.jsonPointToInsertGML(validJson, "realtidspunkt");
      // Then
      const expected = `<wfs:Transaction service="WFS" version="1.0.0"
                  xmlns:wfs="http://www.opengis.net/wfs"
                  xmlns:usa="http://usa.opengeo.org"
                  xmlns:gml="http://www.opengis.net/gml"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://usa.opengeo.org https://karta.eskilstuna.se/geoserver/realtid/wfs/DescribeFeatureType?typename=realtid:realtidspunkt">
                  <wfs:Insert>
                    <realtidspunkt>
                      <geom>
                        <gml:Point srsDimension="1" srsName="http://www.opengis.net/gml/srs/epsg.xml#3010">
                            <gml:coordinates decimal="." cs="," ts=" ">149998.52756560023,6584478.365310702</gml:coordinates>
                        </gml:Point>
                      </geom>
                      
                      <rssi>23</rssi>
                      <numberofsatellites>4</numberofsatellites>
                      <batteryvoltage>3.3</batteryvoltage>
                      <temperature>7.5</temperature>
                      <timestamp>2021-06-03T07:21:24.238Z</timestamp>
                    </realtidspunkt>
                  </wfs:Insert>
                </wfs:Transaction>`
      assert.strictEqual(result, expected);
    });
  });
});
