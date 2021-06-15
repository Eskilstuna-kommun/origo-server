const express = require('express');
const { getMaxListeners } = require('npm');
const notificationsRouter = express.Router();
const proj4 = require('proj4');
const fetch = require('node-fetch');


proj4.defs('EPSG:3010', '+proj=tmerc +lat_0=0 +lon_0=16.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
const geoserverWfsUrl = 'https://great_fish';
const geoserverUser = 'great'
const geoserverPass = 'fish'

function sensordataToGML(sensorData) {
  incomingCoords = sensorData.location.features[0].geometry.coordinates;
  const coords = proj4('EPSG:4326','EPSG:3010',incomingCoords);
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
            <gml:coordinates decimal="." cs="," ts=" ">${coords[1]},${coords[0]}</gml:coordinates>
        </gml:Point>
      </geom>
      <styrka>${sensorData.strength.value}</styrka>
      <timestamp>${sensorData.timestamp.value}</timestamp>
    </realtidspunkt>
  </wfs:Insert>
</wfs:Transaction>`

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
 return fetch(geoserverWfsUrl, options)
}

module.exports = function(io) {
  notificationsRouter.post('/', function(req, res) {
    io.emit('DRAW-GEOMETRY', req.body.data)
    console.log(req.body);
    res.status(201).json(req.body);
  });

  // Route notifications/wfs
  notificationsRouter.post('/wfs', function(req, res) {
    const layerName = 'testNotificationLayer';
    const gml = sensordataToGML(req.body.data[0]);

    // Save via wfs-transact
    insertGml(gml)
      .then(geoserverResponse => geoserverResponse.text()) 
      .then((geoserverResponseText) => {
        console.log(geoserverResponseText);
    // After save triger a refresh event to clients
        io.emit('REDRAW-LAYER', { layerName })
        res.status(201).json(req.body);
      })
      .catch((error) =>{
        res.sendStatus(500);
      })
    
    
  });
  return notificationsRouter;
}