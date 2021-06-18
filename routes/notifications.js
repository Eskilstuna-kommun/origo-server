const express = require('express');
const { getMaxListeners } = require('npm');
const notificationsRouter = express.Router();
const proj4 = require('proj4');
const fetch = require('node-fetch');


proj4.defs('EPSG:3010', '+proj=tmerc +lat_0=0 +lon_0=16.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
const geoserverWfsUrl = 'serviceUrl';
const geoserverUser = 'username';
const geoserverPass = 'password';


function sensordataToGML(sensorData) {
  const incomingCoords = sensorData.location.value.geometry.coordinates;
  const coords = proj4('EPSG:4326', 'EPSG:3010', incomingCoords);
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

function insertGml(gml) {
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(geoserverUser + ':' + geoserverPass).toString('base64'),
      'Content-Type': 'application/xml'
    },
    body: gml,
  }
  return fetch(geoserverWfsUrl, options);
}

module.exports = function (io) {

  notificationsRouter.post('/', function (req, res) {
    const sourceName = 'realtid';
    const name = 'realtidspunkt';
    const gml = sensordataToGML(req.body.data[0]);

    // Save via wfs-transact
    insertGml(gml)
      .then(geoserverResponse => geoserverResponse.text())
      .then((geoserverResponseText) => {
        // After save triger a refresh event to clients
        io.emit('redraw-layer', { sourceName, name })
        io.emit('draw-geometry', { layerTitle: 'Sista position', geoJson: req.body.data[0].location.value })
        res.sendStatus(201);
      })
      .catch((error) => {
        res.sendStatus(500);
      });
  });

  notificationsRouter.post('/old', function (req, res) {
    io.emit('draw-geometry', { layerName: 'test-name', layerTitle: 'test-title', geoJson: req.body.data[0].location.value })
    res.sendStatus(201);
  });
  return notificationsRouter;
}