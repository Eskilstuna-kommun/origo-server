const transformCoordinates = require('./transformcoordinates');

function jsonPointToInsertGML(data, layername) {
  const incomingCoords = data.location.value.geometry.coordinates;
  
  const coords = transformCoordinates("4326", "3010", incomingCoords);
  console.log(`Koordinater: ${coords}`);
  const gml = `<wfs:Transaction service="WFS" version="1.0.0"
                  xmlns:wfs="http://www.opengis.net/wfs"
                  xmlns:usa="http://usa.opengeo.org"
                  xmlns:gml="http://www.opengis.net/gml"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://usa.opengeo.org https://karta.eskilstuna.se/geoserver/realtid/wfs/DescribeFeatureType?typename=realtid:realtidspunkt">
                  <wfs:Insert>
                    <${layername}>
                      <geom>
                        <gml:Point srsDimension="1" srsName="http://www.opengis.net/gml/srs/epsg.xml#3010">
                            <gml:coordinates decimal="." cs="," ts=" ">${coords[0]},${coords[1]}</gml:coordinates>
                        </gml:Point>
                      </geom>
                      ${convertAttributesToInsertGML(data)}
                    </${layername}>
                  </wfs:Insert>
                </wfs:Transaction>`;

  return gml;
}

function convertAttributesToInsertGML(attributes) {
  let attributeGML = "";
  Object.keys(attributes).forEach(attributeKey => {
    if ((attributeKey != "location") && (attributeKey != "id") && (attributeKey != "type")) {
      attributeGML = `${attributeGML}
                      <${attributeKey.toLowerCase()}>${attributes[attributeKey].value}</${attributeKey.toLowerCase()}>`
    }
  })
  return attributeGML;
}

function convertAttributesToUpdateGML(attributes) {
  let attributeGML;
  Object.keys(attributes).forEach(attributeKey => {
    if ((attributeKey != "location") && (attributeKey != "id")) {
      attributeGML = `${attributeGML}
      <wfs:Property>
        <wfs:Name>${attributeKey}</wfs:Name>
        <wfs:Value>${attributes[attributeKey].value}</wfs:Value>
      </wfs:Property>`
    }
  })
  return attributeGML;
}

function jsonPointToUpdateGML(id, data, layername) {

  const incomingCoords = data.location.value.geometry.coordinates;
  const coords = transformCoordinates("4326", "3010", incomingCoords);

  let gml = `<wfs:Transaction service="WFS" version="1.1.0"
  xmlns:wfs="http://www.opengis.net/wfs"
  xmlns:gml="http://www.opengis.net/gml"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:ogc="http://www.opengis.net/ogc"
  xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://usa.opengeo.org https://karta.eskilstuna.se/geoserver/realtid/wfs/DescribeFeatureType?typename=realtid:sos_olycka">
    <wfs:Update typeName="realtid:${layername}">
      <wfs:Property>
        <wfs:Name>geom</wfs:Name>
        <wfs:Value>
          <gml:Point srsName="urn:x-ogc:def:crs:EPSG:3010">
            <gml:pos>${coords[1]} ${coords[0]}</gml:pos>
          </gml:Point>
        </wfs:Value>
        </wfs:Property>
        ${convertAttributesToUpdateGML(data)}
        <ogc:Filter>
          <ogc:FeatureId fid="${layername}.${id}"/>
        </ogc:Filter>
    </wfs:Update>
</wfs:Transaction>`;

  return gml;
}



function geoJsonToGML(geoJson) {}

module.exports = { jsonPointToInsertGML, geoJsonToGML, jsonPointToUpdateGML };
