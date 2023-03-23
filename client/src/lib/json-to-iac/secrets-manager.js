const { snakeCase, splat, getObjectFromArray } = require("lazy-z");
const {
  rgIdRef,
  getKmsInstanceData,
  kebabName,
  jsonToIac,
  encryptionKeyRef,
  tfBlock
} = require("./utils");

/**
 * format auth for secrets manager to kms. secrets manager authorization needs to be
 * created prior to instance to allow for the secrets manager service to be encrypted
 * with keys from kms
 * @param {string} kmsName
 * @param {Object} config configuration
 * @returns {string} terraform code
 */
function formatSecretsManagerToKmsAuth(kmsName, config) {
  let kmsInstance = getKmsInstanceData(kmsName, config);
  return jsonToIac(
    "ibm_iam_authorization_policy",
    `secrets manager to ${kmsName} kms policy`,
    {
      source_service_name: "^secrets-manager",
      roles: '["Reader"]',
      description: "^Allow Secets Manager instance to read from KMS instance",
      target_service_name: "^" + kmsInstance.type,
      target_resource_instance_id: kmsInstance.guid
    }
  );
}

/**
 * create secrets manager instance terraform
 * @param {Object} secretsManager
 * @param {string} secretsManager.name
 * @param {string} secretsManager.kms
 * @param {string} secretsManager.encryption_key
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.prefix
 * @param {string} config._options.region
 * @returns {string} terraform string
 */
function formatSecretsManagerInstance(secretsManager, config) {
  let kmsInstance = secretsManager.kms
    ? getObjectFromArray(config.key_management, "name", secretsManager.kms)
    : null;
  let instance = {
    name: kebabName(config, [secretsManager.name]),
    location: "$region",
    plan: "^standard",
    service: "^secrets-manager",
    resource_group_id: rgIdRef(secretsManager.resource_group, config),
    "^parameters": {
      kms_key: !kmsInstance
        ? "ERROR: Unfound Reference"
        : encryptionKeyRef(
            secretsManager.kms,
            secretsManager.encryption_key,
            "crn"
          )
    },
    timeouts: {
      create: "1h",
      delete: "1h"
    }
  };
  if (kmsInstance && kmsInstance.has_secrets_manager_auth !== true) {
    instance.depends_on = [
      `ibm_iam_authorization_policy.secrets_manager_to_${snakeCase(
        secretsManager.kms
      )}_kms_policy`
    ];
  }
  return jsonToIac(
    "ibm_resource_instance",
    secretsManager.name + "-secrets-manager",
    instance,
    config
  );
}

/**
 * create secrets manager terraform
 * @param {Object} config
 * @param {Array<Object>} config.secrets_manager
 * @param {Array<Object>} config.key_management
 * @param {boolean} config.key_management.has_secrets_manager_auth
 * @returns {string} terraform string
 */
function secretsManagerTf(config) {
  let tf = ``;
  let allKmsServices = splat(config.secrets_manager, "kms");
  let kmstf = "";
  let totalKmsInstances = 0;
  allKmsServices.forEach(service => {
    if (service) {
      if (
        // if service doesn't already have auth
        (getObjectFromArray(config.key_management, "name", service)
          .has_secrets_manager_auth || false) !== true
      ) {
        kmstf += formatSecretsManagerToKmsAuth(service, config);
        totalKmsInstances++;
      }
    }
  });
  if (totalKmsInstances !== 0) {
    tf += tfBlock("Key Management Authorizations", kmstf) + "\n";
  }
  let secretsManagerData = "";
  config.secrets_manager.forEach(instance => {
    secretsManagerData += formatSecretsManagerInstance(instance, config);
  });
  if (secretsManagerData.length > 0)
    tf += tfBlock("Secrets Manager Instances", secretsManagerData);
  return tf;
}

module.exports = {
  formatSecretsManagerToKmsAuth,
  formatSecretsManagerInstance,
  secretsManagerTf
};
