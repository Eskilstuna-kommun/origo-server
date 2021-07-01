const transformCoordinates = require('./transformcoordinates');

function sensordataToGML(sensorData) {
  const incomingCoords = sensorData.location.value.geometry.coordinates;
  const coords = transformCoordinates("EPSG:4326", "EPSG:3010", incomingCoords);
  const gml = `<wfs:Transaction service="WFS" version="1.0.0"
                  xmlns:wfs="http://www.opengis.net/wfs"
                  xmlns:usa="http://usa.opengeo.org"
                  xmlns:gml="http://www.opengis.net/gml"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://usa.opengeo.org https://karta.eskilstuna.se/geoserver/realtid/wfs/DescribeFeatureType?typename=realtid:realtidspunkt">
                  <wfs:Insert>
                    <realtidspunkt>
                      <geom>
                        <gml:Point srsDimension="1" srsName="http://www.opengis.net/gml/srs/epsg.xml#3010">
                            <gml:coordinates decimal="." cs="," ts=" ">${coords[0]},${coords[1]}</gml:coordinates>
                        </gml:Point>
                      </geom>
                      <styrka>${sensorData.strength.value}</styrka>
                      <timestamp>${sensorData.timestamp.value}</timestamp>
                    </realtidspunkt>
                  </wfs:Insert>
                </wfs:Transaction>`;

  return gml;
}

function geoJsonToGML(geoJson) {}

module.exports = { sensordataToGML, geoJsonToGML };
