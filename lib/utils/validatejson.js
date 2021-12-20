const Validator = require("jsonschema").Validator;
const v = new Validator();
const schemas = {
  lorawanSchema: {
    id: "/lorawan",
    type: "object",
    properties: {
      subscriptionId: {
        type: "string",
      },
      data: {
        type: "array",
        items: { "$ref": "#/$defs/lorawanPointSchema" }
      }
    },
    required: ["data"],
    $defs: {
      lorawanPointSchema: {
        id: "/lorawanPoint",
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          type: {
            type: "string",
          },
          rssi: {
            type: "object",
            properties: {
              value: {
                type: "number",
              },
              type: {
                type: "string",
              },
              metadata: {
                type: "object",
              },
            },
            required: ["value"],
          },
          numberOfSatellites: {
            type: "object",
            properties: {
              value: {
                type: "number",
              },
              type: {
                type: "string",
              },
              metadata: {
                type: "object",
              },
            },
            required: ["value"],
          },
          batteryVoltage: {
            type: "object",
            properties: {
              value: {
                type: "number",
              },
              type: {
                type: "string",
              },
              metadata: {
                type: "object",
              },
            },
            required: ["value"],
          },
          temperature: {
            type: "object",
            properties: {
              value: {
                type: "number",
              },
              type: {
                type: "string",
              },
              metadata: {
                type: "object",
              },
            },
            required: ["value"],
          },
          location: {
            type: "object",
            properties: {
              type: {
                type: "string",
              },
              value: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                  },
                  properties: {
                    type: "object",
                  },
                  geometry: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                      },
                      coordinates: {
                        type: "array",
                        minItems: 2,
                        maxItems: 3,
                        items: [
                          { type: "number", minimum: 15, maximum: 17 },
                          { type: "number", minimum: 59, maximum: 60 },
                        ],
                      },
                    },
                    required: ["type", "coordinates"],
                  },
                },
                required: ["geometry"],
              },
            },
          },
          timestamp: {
            type: "object",
            properties: {
              value: {
                type: "string",
              },
              type: {
                type: "string",
              },
              required: ["value"],
            },
          },
        },
        required: ["id", "rssi", "numberOfSatellites", "batteryVoltage", "temperature", "location", "timestamp"],
      }
    }
  },
  sos_fordon: {
    id: "/sos_fordon",
    type: "object",
    properties: {
      id: {
        type: "integer",
      },
      fordonstyp: {
        type: "object",
        properties: {
        value: {
          type: "string",
          enum: ["brandbil","ambulans"]
        }    
        },
        required: ["value"]
      },
      location: {
        type: "object",
        properties: {
          type: {
            type: "string",
          },
          value: {
            type: "object",
            properties: {
              type: {
                type: "string",
              },
              properties: {
                type: "object",
              },
              geometry: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                  },
                  coordinates: {
                    type: "array",
                    minItems: 2,
                    maxItems: 3,
                    items: [
                      { type: "number", minimum: 15, maximum: 17 },
                      { type: "number", minimum: 59, maximum: 60 },
                    ],
                  },
                },
                required: ["type", "coordinates"],
              },
            },
            required: ["geometry"],
          },
        },
      },
    },
    required: ["id", "fordonstyp", "location"],
  },
  sos_olycka: {
    id: "/sos_olycka",
    type: "object",
    properties: {
      id: {
        type: "integer",
      },
      typ: {
        type: "object",
        properties: {
        value: {
          type: "string",
          enum: ["bilolycka","brandolycka"]
          }    
        },
        required: ["value"]
      },
      beskrivning: {
        type: "object",
        properties: {
        value: {
          type: "string"
          }    
        },  
        required: ["value"]
      },
      location: {
        type: "object",
        properties: {
          type: {
            type: "string",
          },
          value: {
            type: "object",
            properties: {
              type: {
                type: "string",
              },
              properties: {
                type: "object",
              },
              geometry: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                  },
                  coordinates: {
                    type: "array",
                    minItems: 2,
                    maxItems: 3,
                    items: [
                      { type: "number", minimum: 15, maximum: 17 },
                      { type: "number", minimum: 59, maximum: 60 },
                    ],
                  },
                },
                required: ["type", "coordinates"],
              },
            },
            required: ["geometry"],
          },
        },
      },
    },
    required: ["id", "typ", "location"],
  }
};
function validateToSchema(inputData, schemaName) {
  if (schemaName && schemas[schemaName]) {
    return v.validate(inputData, schemas[schemaName]);
  } else {
    return { errors: [{ message: "Schema name is invalid" }] };
  }
}
module.exports = { validateToSchema };
