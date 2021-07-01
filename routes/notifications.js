const { response } = require("express");
const express = require("express");
const conf = require("../conf/config");
const formatConverters = require("../lib/utils/formatconverters");
const wfs = require("../lib/utils/wfs");
const validateJson = require("../lib/utils/validatejson");

const notificationsRouter = express.Router();

function validateRequest(req, res, next) {
  const inputData = req.body;
  conf.notifications.lorawan;
  // Check that we have a subscriptionId and that that Id exists in the config
  if (inputData.subscriptionId && conf.notifications[inputData.subscriptionId]) {
    req.notificationConfig = conf.notifications[inputData.subscriptionId];
    const validationResult = validateJson.validateToSchema(
      inputData.data[0],
      req.notificationConfig.schemaName
    );
    if (validationResult.errors.length === 0) {
      next(); // Goto next controller
    } else {
      res.status(400).json(validationResult.errors);
    }
  } else {
    res.status(400).json([{ message: "invalid subscriptionId" }]);
  }
}

module.exports = function (io) {
  notificationsRouter.post("/", validateRequest, function (req, res) {
    const {
      geoserverWfsUrl,
      geoserverUser,
      geoserverPass,
      origoLayerName,
      origoLayerSourceName,
    } = req.notificationConfig;
    const inputData = req.body;

    const gml = formatConverters.sensordataToGML(req.body.data[0]);

    // Save via wfs-transact
    wfs
      .insertGml(gml, geoserverWfsUrl, geoserverUser, geoserverPass)
      .then((geoserverResponse) => geoserverResponse.text())
      .then((geoserverResponseText) => {
        // After save triger a refresh event to clients
        io.emit("redraw-layer", {
          sourceName: origoLayerSourceName,
          name: origoLayerName,
        });
        io.emit("draw-geometry", {
          layerTitle: "Sista position",
          geoJson: req.body.data[0].location.value,
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
