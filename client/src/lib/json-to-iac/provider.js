const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const { varDotRegion } = require("../constants");
const { snakeCase } = require("lazy-z");

/**
 * format ibm cloud provider data
 * @param {*} config config json
 * @returns {string} terraform provider string
 */
function ibmCloudProvider(config) {
  let data = {
    provider: {
      ibm: [
        {
          ibmcloud_api_key: "${var.ibmcloud_api_key}",
          region: varDotRegion,
          ibmcloud_timeout: 60,
        },
      ],
    },
  };

  if (config._options?.classic) {
    data.provider.ibm.push({
      alias: "classic",
      ibmcloud_timeout: 60,
      region: varDotRegion,
      iaas_classic_username: "${var.iaas_classic_username}",
      iaas_classic_api_key: "${var.iaas_classic_api_key}",
    });
  }

  if (config._options.enable_power_vs) {
    config._options.power_vs_zones.forEach((zone) => {
      data.provider.ibm.push({
        alias: snakeCase("power_vs_" + zone),
        ibmcloud_api_key: "${var.ibmcloud_api_key}",
        region: "${var.region}",
        zone: zone,
        ibmcloud_timeout: 60,
      });
    });
  }

  return tfBlock(
    "IBM Cloud Provider",
    "\n" + jsonToTf(JSON.stringify(data)) + "\n"
  );
}

module.exports = {
  ibmCloudProvider,
};
