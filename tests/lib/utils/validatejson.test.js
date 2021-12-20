const assert = require("assert");
const validateJSON = require("../../../lib/utils/validatejson");

const invalidLorawanJson = { name: "test" };
const createValidLorawanJson = () => {
  return {
    data: [
      {
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
      }
    }]
  };
};
describe("ValidateJSON", function () {
  describe("validateToSchema()", function () {
    it("should return errors when it recieves invalid JSON object", function () {
      const result = validateJSON.validateToSchema(
        invalidLorawanJson,
        "lorawanSchema"
      );
      assert(result.errors.length >= 1);
    });
    it("should return no errors when it recieves a valid JSON object", function () {
      const result = validateJSON.validateToSchema(
        createValidLorawanJson(),
        "lorawanSchema"
      );
      assert(result.errors.length === 0);
    });
    it("should return an error when only one coordinate is provided", function () {
      const invalidGeometryJson = createValidLorawanJson();
      invalidGeometryJson.data[0].location.value.geometry.coordinates = [
        16.49997409901628,
      ];
      const result = validateJSON.validateToSchema(
        invalidGeometryJson,
        "lorawanSchema"
      );
      assert(result.errors.length === 1);
    });
    it("should return an error when the long coordinate is out of bounds", function () {
      const invalidLong = 14.49997409901628;
      const invalidGeometryJson = createValidLorawanJson();
      invalidGeometryJson.data[0].location.value.geometry.coordinates = [
        invalidLong,
        59.375313214375225,
      ];
      const result = validateJSON.validateToSchema(
        invalidGeometryJson,
        "lorawanSchema"
      );
      assert(result.errors.length === 1);
    });
    it("should return an error when the lat coordinate is out of bounds", function () {
      const invalidLat = 60.375313214375225;
      const invalidGeometryJson = createValidLorawanJson();
      invalidGeometryJson.data[0].location.value.geometry.coordinates = [
        16.49997409901628,
        invalidLat,
      ];
      const result = validateJSON.validateToSchema(
        invalidGeometryJson,
        "lorawanSchema"
      );
      assert(result.errors.length === 1);
    });
    it("should return an error when schema name is invalid", function () {
      const result = validateJSON.validateToSchema(
        createValidLorawanJson(),
        "invalidSchemaName"
      );
      assert(result.errors.length === 1);
    });
  });
});
