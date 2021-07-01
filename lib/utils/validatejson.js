const Validator = require("jsonschema").Validator;
const v = new Validator();
const schemas = {
  lorawanSchema: {
    id: "/lorawan",
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      type: {
        type: "string",
      },
      strength: {
        type: "object",
        properties: {
          value: {
            type: "integer",
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
    required: ["id", "strength", "location", "timestamp"],
  },
};
function validateToSchema(inputData, schemaName) {
  if (schemaName && schemas[schemaName]) {
    return v.validate(inputData, schemas[schemaName]);
  } else {
    return { errors: [{ message: "Schema name is invalid" }] };
  }
}
module.exports = { validateToSchema };
