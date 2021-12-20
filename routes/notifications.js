const { response } = require("express");
const express = require("express");
const conf = require("../conf/config");
const formatConverters = require("../lib/utils/formatconverters");
const wfs = require("../lib/utils/wfs");
const validateJson = require("../lib/utils/validatejson");

const notificationsRouter = express.Router();

/**
 * middleware to validate req body
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function validateRequest (req, res, next) {
  const inputData = req.body;
  const {id} = req.params

  if (id) {
    inputData.id = +id;
  }
  const validationResult = validateJson.validateToSchema(
    inputData,
    req.notificationConfig.schemaName
  );
  if (validationResult.errors.length === 0) {
    next(); // Goto next controller
  } else {
    res.status(400).json(validationResult.errors);
  }
}

/**
 * middleware to check if route exists
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function checkRoute (req, res, next) {
  const {layerName} = req.params

  if (layerName && conf.notifications[layerName]) {
    req.notificationConfig = conf.notifications[layerName];
    next();
  } else {
    res.status(404).json([{ message: "invalid route" }]);
  }
}


module.exports = function (io) {
  notificationsRouter.put("/:layerName/:id", checkRoute, validateRequest, function (req, res) {
    const {
      geoserverWfsUrl,
      geoserverUser,
      geoserverPass,
      origoLayerName,
      origoLayerSourceName,
    } = req.notificationConfig;
    const inputData = req.body;

    const gml = formatConverters.sosdataToGML(req.params.id, inputData, origoLayerName);

    // Save via wfs-transact
    wfs
      .insertGml(gml, geoserverWfsUrl, geoserverUser, geoserverPass)
      .then(() => {
        // After save triger a refresh event to clients
        io.emit("redraw-layer", {
          sourceName: origoLayerSourceName,
          name: origoLayerName,
        });
        res.sendStatus(201); 
      })
      .catch((error) => {
        console.log(error)
        res.sendStatus(500);
      });
   
  })
  notificationsRouter.post("/:layerName", checkRoute, validateRequest, function (req, res) {
    const {
      geoserverWfsUrl,
      geoserverUser,
      geoserverPass,
      origoLayerName,
      origoLayerSourceName,
    } = req.notificationConfig;
    const inputData = req.body;


    const gml = formatConverters.jsonPointToInsertGML(req.body.data[0], origoLayerName);
    console.log(gml);
    // Save via wfs-transact
    wfs
      .insertGml(gml, geoserverWfsUrl, geoserverUser, geoserverPass)
      .then(() => {
        // After save triger a refresh event to clients
        io.emit("redraw-layer", {
          sourceName: origoLayerSourceName,
          name: origoLayerName,
        });
        res.sendStatus(201);
      })
      .catch((error) => {
        res.sendStatus(500);
      });
  });

  notificationsRouter.post("/old", function (req, res) {
    io.emit("draw-geometry", {
      layerTitle: "test-title",
      geoJson: req.body.data[0].location.value,
    });
    res.sendStatus(201);
  });
  return notificationsRouter;
};
