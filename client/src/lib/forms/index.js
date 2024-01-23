const {
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  aclHelperTextCallback,
  invalidSubnetTierText,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleText,
  clusterHelperTestCallback,
  invalidCidrText,
  invalidProjectNameText,
  invalidCrnText,
  powerVsWorkspaceHelperText,
  vpnServersHelperText,
} = require("./text-callbacks");
const {
  invalidName,
  invalidSshPublicKey,
  validSshKey,
  invalidTagList,
  invalidCrnList,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidNewResourceName,
  invalidIpCommaList,
  invalidIdentityProviderURI,
  isValidUrl,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidProjectName,
  invalidProjectDescription,
  invalidCbrRule,
  invalidCbrZone,
  invalidCrns,
} = require("./invalid-callbacks");
const { propsMatchState } = require("./props-match-state");
const {
  disableSave,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
} = require("./disable-save");
const { hasDuplicateName } = require("./duplicate-name");
const { getSubnetTierStateData, getTierSubnets } = require("./state-data");
const {
  formatConfig,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent,
} = require("./format-json");
const { leftNavItemClassName } = require("./class-names");
const { notificationText, getCosFromBucket } = require("./utils");
const { storageChangeDisabledCallback } = require("./power-affinity");
const wizard = require("./wizard");

module.exports = {
  wizard,
  storageChangeDisabledCallback,
  leftNavItemClassName,
  notificationText,
  hasDuplicateName,
  resourceGroupHelperTextCallback,
  genericNameCallback,
  invalidName,
  propsMatchState,
  disableSave,
  clusterHelperTestCallback,
  invalidNameText,
  cosResourceHelperTextCallback,
  invalidSshPublicKey,
  validSshKey,
  invalidTagList,
  aclHelperTextCallback,
  invalidSubnetTierName,
  invalidSubnetTierText,
  formatConfig,
  getSubnetTierStateData,
  getTierSubnets,
  iamAccountSettingInvalidText,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  invalidNewResourceName,
  invalidIpCommaList,
  copyAclModalContent,
  copyRuleCodeMirrorData,
  copySgModalContent,
  forceShowForm,
  invalidIdentityProviderURI,
  isValidUrl,
  disableSshKeyDelete,
  cidrBlocksOverlap,
  hasOverlappingCidr,
  invalidCidr,
  invalidCidrText,
  invalidCrnList,
  invalidProjectName,
  invalidProjectDescription,
  invalidCbrRule,
  invalidCbrZone,
  invalidCidrBlock,
  invalidProjectNameText,
  getCosFromBucket,
  invalidCrns,
  invalidCrnText,
  powerVsWorkspaceHelperText,
  vpnServersHelperText,
};
