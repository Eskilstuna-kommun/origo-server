const fetch = require("node-fetch");

function insertGml(gml, geoserverWfsUrl, geoserverUser, geoserverPass) {
  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(geoserverUser + ":" + geoserverPass).toString("base64"),
      "Content-Type": "application/xml",
    },
    body: gml,
  };
  return fetch(geoserverWfsUrl, options);
}
module.exports = { insertGml };
