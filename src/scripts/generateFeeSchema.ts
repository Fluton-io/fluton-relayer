import networks from "../config/networks";
import fs from "fs";

const generateFeeSchema = () => {
  const schema = networks.map((sourceNetwork, i1) => {
    return {
      [sourceNetwork.chainId]: {
        ...networks.map((targetNetwork, i2) => {
          if (i1 === i2) return;
          return {
            [targetNetwork.chainId]: {
              "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8": {
                fee: 0.01,
                feeType: "flat",
              },
            },
          };
        }),
      },
    };
  });

  // save schema to a file
  fs.writeFileSync("./src/config/feeSchema.json", JSON.stringify(schema, null, 2));
};

generateFeeSchema();
