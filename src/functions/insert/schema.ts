export default {
  type: "object",
  properties: {
    documentHash: { type: "string" },
    reasonCode: { type: "number" },
  },
  required: ["documentHash", "reasonCode"],
} as const;
