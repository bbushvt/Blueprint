const { lazyZstate } = require("lazy-z/lib/store");
const { contains, typeCheck, transpose, snakeCase } = require("lazy-z");
const { optionsInit, optionsSave } = require("./options");
const { initKeyManagement } = require("./key-management");
const { initResourceGroup } = require("./resource-groups");
const { initObjectStorageStore } = require("./cos");
const { initAtracker } = require("./atracker");
const { initAppIdStore } = require("./appid");
const {
  vpcCreate,
  vpcDelete,
  vpcInit,
  vpcOnStoreUpdate,
  vpcSave,
  subnetCreate,
  subnetSave,
  subnetDelete,
  subnetTierCreate,
  subnetTierSave,
  subnetTierDelete,
  naclCreate,
  naclSave,
  naclDelete,
  naclRuleCreate,
  naclRuleSave,
  naclRuleDelete,
  createEdgeVpc,
} = require("./vpc");
const { sccInit, sccSave, sccDelete } = require("./scc");
const {
  sshKeyCreate,
  sshKeyDelete,
  sshKeySave,
  sshKeyInit,
  sshKeyOnStoreUpdate,
} = require("./ssh-keys.js");
const {
  securityGroupInit,
  securityGroupOnStoreUpdate,
  securityGroupCreate,
  securityGroupSave,
  securityGroupDelete,
  securityGroupRulesCreate,
  securityGroupRulesSave,
  securityGroupRulesDelete,
} = require("./security-groups");
const { initTransitGateway } = require("./transit-gateways");
const {
  vpnInit,
  vpnCreate,
  vpnDelete,
  vpnSave,
  vpnOnStoreUpdate,
} = require("./vpn");
const { initClusterStore } = require("./clusters");
const {
  vsiCreate,
  vsiInit,
  vsiDelete,
  vsiOnStoreUpdate,
  vsiSave,
  vsiVolumeCreate,
  vsiVolumeDelete,
  vsiVolumeSave,
} = require("./vsi");
const {
  vpeInit,
  vpeCreate,
  vpeDelete,
  vpeSave,
  vpeOnStoreUpdate,
} = require("./vpe");
const {
  f5Init,
  f5VsiSave,
  f5InstanceSave,
  f5VsiCreate,
  f5OnStoreUpdate,
  f5TemplateSave,
} = require("./f5");
const { initLoadBalancers } = require("./load-balancers");
const { initEventStreams } = require("./event-streams");
const {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete,
} = require("./secrets-manager");
const {
  iamInit,
  iamSave,
  accessGroupInit,
  accessGroupOnStoreUpdate,
  accessGroupCreate,
  accessGroupSave,
  accessGroupDelete,
  accessGroupPolicyCreate,
  accessGroupPolicySave,
  accessGroupPolicyDelete,
  accessGroupDynamicPolicyCreate,
  accessGroupDynamicPolicySave,
  accessGroupDynamicPolicyDelete,
} = require("./iam");
const validate = require("../validate");
const { buildSubnetTiers } = require("./utils");
const {
  addClusterRules,
  copySecurityGroup,
  copyNetworkAcl,
  copyRule,
  copySgRule,
  getAllOtherGroups,
  getAllRuleNames,
} = require("./copy-rules");
const {
  routingTableInit,
  routingTableOnStoreUpdate,
  routingTableCreate,
  routingTableSave,
  routingTableDelete,
  routingTableRouteCreate,
  routingTableRouteSave,
  routingTableRouteDelete,
} = require("./routing-tables");
const {
  cbrZonesInit,
  cbrZoneCreate,
  cbrZoneSave,
  cbrZoneDelete,
  cbrZoneAddressCreate,
  cbrZoneAddressSave,
  cbrZoneAddressDelete,
  cbrZoneExclusionCreate,
  cbrZoneExclusionSave,
  cbrZoneExclusionDelete,
} = require("./cbr-zones");
const {
  cbrRulesInit,
  cbrRuleCreate,
  cbrRuleSave,
  cbrRuleDelete,
  cbrRuleContextCreate,
  cbrRuleContextSave,
  cbrRuleContextDelete,
  cbrRuleAttributeCreate,
  cbrRuleAttributeSave,
  cbrRuleAttributeDelete,
  cbrRuleTagCreate,
  cbrRuleTagSave,
  cbrRuleTagDelete,
} = require("./cbr-rules");
const { initVpnState } = require("./vpn-servers");
const {
  dnsInit,
  dnsCreate,
  dnsSave,
  dnsDelete,
  dnsOnStoreUpdate,
  dnsZoneCreate,
  dnsZoneDelete,
  dnsZoneSave,
  dnsRecordCreate,
  dnsRecordSave,
  dnsRecordDelete,
  dnsResolverCreate,
  dnsResolverDelete,
  dnsResolverSave,
} = require("./dns");
const {
  logdnaInit,
  logdnaOnStoreUpdate,
  logdnaSave,
  sysdigInit,
  sysdigOnStoreUpdate,
  sysdigSave,
} = require("./logging-monitoring");
const { initIcdStore } = require("./icd");
const { initPowerVsStore } = require("./power-vs");
const { initPowerVsInstance } = require("./power-vs-instances");
const {
  powerVsVolumesInit,
  powerVsVolumesOnStoreUpdate,
  powerVsVolumeCreate,
  powerVsVolumeSave,
  powerVsVolumeDelete,
  initPowerVsVolumeStore,
} = require("./power-vs-volumes");
const { intiClassicInfrastructure } = require("./classic");
const { initClassicGateways } = require("./classic-gateways");

/**
 * get state for craig
 * @param {boolean=} legacy this param is for unit tests and is not passed in the application
 * use the `legacy` parameter for the initialization of unit tests that require the SLZ cidr
 * blocks to function.
 * @returns {lazyZstate} store
 */
const state = function (legacy) {
  let store = new lazyZstate({
    _defaults: {
      json: {
        iam_account_settings: {
          enable: false,
        },
        access_groups: [],
        secrets_manager: [],
        f5_vsi: [],
        _options: {
          endpoints: "private",
        },
      },
      cosBuckets: [],
      cosKeys: [],
      hideCodeMirror: false,
      hideFooter: false,
      jsonInCodeMirror: false,
    },
    _no_default: [],
  });

  /**
   * toggle a state store value
   * @param {string} value name of the boolean value to toggle
   */
  store.toggleStoreValue = function (value) {
    typeCheck(
      `store.toggleStoreValue - store.${value}`,
      "boolean",
      store.store[value]
    );
    store.store[value] = !store.store[value];
  };

  store.setStoreValue = function (field, value) {
    store.store[field] = value;
  };

  /**
   * update unfound value from store
   * @param {string} listName name of the list within the store
   * @param {Object} obj arbitrary object
   * @param {string} field name of the field on the object to update
   */
  store.updateUnfound = function (listName, obj, field) {
    if (!contains(store.store[listName], obj[field])) {
      obj[field] = null;
    }
  };

  /**
   * update the resourceGroup field for an object
   * @param {Object} obj arbitrary object
   * @param {string=} field name of the field to update default to `resource_group`
   */
  store.updateUnfoundResourceGroup = function (obj, field) {
    let rgField = field || "resource_group";
    store.updateUnfound("resourceGroups", obj, rgField);
  };

  store.createEdgeVpc = function (pattern, managementVpc, zones) {
    createEdgeVpc(store, pattern, managementVpc, zones);
  };

  store.newField("options", {
    init: optionsInit,
    save: optionsSave,
  });

  initResourceGroup(store);
  // components must check for key management second
  initKeyManagement(store);
  // next, update cos
  initObjectStorageStore(store);

  store.newField("vpcs", {
    init: vpcInit,
    onStoreUpdate: vpcOnStoreUpdate,
    create: vpcCreate,
    save: vpcSave,
    delete: vpcDelete,
    subComponents: {
      acls: {
        create: naclCreate,
        save: naclSave,
        delete: naclDelete,
        subComponents: {
          rules: {
            create: naclRuleCreate,
            save: naclRuleSave,
            delete: naclRuleDelete,
          },
        },
      },
      subnets: {
        create: subnetCreate,
        save: subnetSave,
        delete: subnetDelete,
      },
      subnetTiers: {
        create: subnetTierCreate,
        save: subnetTierSave,
        delete: subnetTierDelete,
      },
    },
  });

  initAtracker(store);

  initAppIdStore(store);

  store.newField("scc", {
    init: sccInit,
    save: sccSave,
    delete: sccDelete,
  });

  store.newField("ssh_keys", {
    init: sshKeyInit,
    onStoreUpdate: sshKeyOnStoreUpdate,
    create: sshKeyCreate,
    save: sshKeySave,
    delete: sshKeyDelete,
  });

  store.newField("security_groups", {
    init: securityGroupInit,
    onStoreUpdate: securityGroupOnStoreUpdate,
    create: securityGroupCreate,
    save: securityGroupSave,
    delete: securityGroupDelete,
    subComponents: {
      rules: {
        create: securityGroupRulesCreate,
        save: securityGroupRulesSave,
        delete: securityGroupRulesDelete,
      },
    },
  });

  initTransitGateway(store);

  store.newField("vpn_gateways", {
    init: vpnInit,
    onStoreUpdate: vpnOnStoreUpdate,
    create: vpnCreate,
    save: vpnSave,
    delete: vpnDelete,
  });

  initClusterStore(store);

  store.newField("vsi", {
    init: vsiInit,
    onStoreUpdate: vsiOnStoreUpdate,
    create: vsiCreate,
    save: vsiSave,
    delete: vsiDelete,
    subComponents: {
      volumes: {
        create: vsiVolumeCreate,
        save: vsiVolumeSave,
        delete: vsiVolumeDelete,
      },
    },
  });

  store.newField("virtual_private_endpoints", {
    init: vpeInit,
    onStoreUpdate: vpeOnStoreUpdate,
    create: vpeCreate,
    save: vpeSave,
    delete: vpeDelete,
  });

  store.newField("f5", {
    init: f5Init,
    onStoreUpdate: f5OnStoreUpdate,
    subComponents: {
      instance: {
        save: f5InstanceSave,
      },
      vsi: {
        create: f5VsiCreate,
        save: f5VsiSave,
      },
      template: {
        save: f5TemplateSave,
      },
    },
  });

  initLoadBalancers(store);

  initEventStreams(store);

  store.newField("secrets_manager", {
    init: (config) => {
      config.store.json.secrets_manager = [];
    },
    onStoreUpdate: secretsManagerOnStoreUpdate,
    create: secretsManagerCreate,
    save: secretsManagerSave,
    delete: secretsManagerDelete,
  });

  store.newField("iam_account_settings", {
    init: iamInit,
    save: iamSave,
  });

  store.newField("routing_tables", {
    init: routingTableInit,
    onStoreUpdate: routingTableOnStoreUpdate,
    save: routingTableSave,
    create: routingTableCreate,
    delete: routingTableDelete,
    subComponents: {
      routes: {
        create: routingTableRouteCreate,
        save: routingTableRouteSave,
        delete: routingTableRouteDelete,
      },
    },
  });

  store.newField("access_groups", {
    init: accessGroupInit,
    onStoreUpdate: accessGroupOnStoreUpdate,
    create: accessGroupCreate,
    save: accessGroupSave,
    delete: accessGroupDelete,
    subComponents: {
      policies: {
        create: accessGroupPolicyCreate,
        save: accessGroupPolicySave,
        delete: accessGroupPolicyDelete,
      },
      dynamic_policies: {
        create: accessGroupDynamicPolicyCreate,
        save: accessGroupDynamicPolicySave,
        delete: accessGroupDynamicPolicyDelete,
      },
    },
  });

  store.newField("cbr_zones", {
    init: cbrZonesInit,
    create: cbrZoneCreate,
    save: cbrZoneSave,
    delete: cbrZoneDelete,
    subComponents: {
      addresses: {
        create: cbrZoneAddressCreate,
        save: cbrZoneAddressSave,
        delete: cbrZoneAddressDelete,
      },
      exclusions: {
        create: cbrZoneExclusionCreate,
        save: cbrZoneExclusionSave,
        delete: cbrZoneExclusionDelete,
      },
    },
  });

  store.newField("cbr_rules", {
    init: cbrRulesInit,
    create: cbrRuleCreate,
    save: cbrRuleSave,
    delete: cbrRuleDelete,
    subComponents: {
      contexts: {
        create: cbrRuleContextCreate,
        save: cbrRuleContextSave,
        delete: cbrRuleContextDelete,
      },
      resource_attributes: {
        create: cbrRuleAttributeCreate,
        save: cbrRuleAttributeSave,
        delete: cbrRuleAttributeDelete,
      },
      tags: {
        create: cbrRuleTagCreate,
        save: cbrRuleTagSave,
        delete: cbrRuleTagDelete,
      },
    },
  });

  initVpnState(store);

  store.newField("dns", {
    init: dnsInit,
    onStoreUpdate: dnsOnStoreUpdate,
    create: dnsCreate,
    save: dnsSave,
    delete: dnsDelete,
    subComponents: {
      zones: {
        create: dnsZoneCreate,
        delete: dnsZoneDelete,
        save: dnsZoneSave,
      },
      records: {
        create: dnsRecordCreate,
        save: dnsRecordSave,
        delete: dnsRecordDelete,
      },
      custom_resolvers: {
        create: dnsResolverCreate,
        delete: dnsResolverDelete,
        save: dnsResolverSave,
      },
    },
  });

  store.newField("logdna", {
    init: logdnaInit,
    onStoreUpdate: logdnaOnStoreUpdate,
    save: logdnaSave,
  });

  store.newField("sysdig", {
    init: sysdigInit,
    onStoreUpdate: sysdigOnStoreUpdate,
    save: sysdigSave,
  });

  initIcdStore(store);
  initPowerVsStore(store);

  initPowerVsInstance(store);

  initPowerVsVolumeStore(store);
  intiClassicInfrastructure(store);
  initClassicGateways(store);

  /**
   * hard set config dot json in state store
   * @param {Object} json craig json configuration object
   * @param {boolean=} slz skip validation step when slz
   */
  store.hardSetJson = function (json, slz) {
    if (!slz) validate(json);
    let subnetTiers = {};
    if (!json._options) json._options = {};
    if (!json._options.dynamic_subnets) json._options.dynamic_subnets = false;
    transpose(json, store.store.json);
    store.store.json.vpcs.forEach((network) => {
      subnetTiers[network.name] = buildSubnetTiers(network);
    });
    store.store.json.vpcs.forEach((nw) => {
      nw.subnets.forEach((subnet) => {
        subnet.vpc = nw.name;
      });
      nw.address_prefixes.forEach((prefix) => {
        prefix.vpc = nw.name;
      });
      nw.acls.forEach((acl) => {
        acl.rules.forEach((rule) => {
          rule.acl = acl.name;
          rule.vpc = nw.name;
        });
      });
    });
    store.store.json.clusters.forEach((cluster) => {
      cluster.worker_pools.forEach((pool) => {
        pool.cluster = cluster.name;
        pool.vpc = cluster.vpc;
      });
    });
    store.store.json.security_groups.forEach((group) => {
      group.rules.forEach((rule) => {
        rule.vpc = group.vpc;
        rule.sg = group.name;
      });
    });
    store.store.subnetTiers = subnetTiers;
    // convert permitted networks to vpcs
    store.store.json.dns.forEach((dns) => {
      dns.zones.forEach((zone) => {
        if (zone.permitted_networks) {
          zone.vpcs = zone.permitted_networks;
          delete zone.permitted_networks;
        }
      });
    });
    store.update();
  };

  /**
   * get all subnets
   * @returns {Array<object>} all subnet objects
   */
  store.getAllSubnets = function () {
    let subnetList = [];
    store.store.json.vpcs.forEach((vpc) => {
      vpc.subnets.forEach((subnet) => subnetList.push(subnet));
    });
    return subnetList;
  };

  /**
   * add cluster rules and update
   * @param {string} vpcName
   * @param {string} aclName
   */
  store.addClusterRules = function (vpcName, aclName) {
    addClusterRules(store, vpcName, aclName);
  };

  /**
   * copy security group from one vpc to another and update
   * @param {string} sourceSecurityGroup name of acl to copy
   * @param {string} destinationVpc copy destination
   */
  store.copySecurityGroup = function (sourceSecurityGroup, destinationVpc) {
    copySecurityGroup(store, sourceSecurityGroup, destinationVpc);
  };

  /**
   * copy network acl from one vpc to another and update
   * @param {string} sourceVpc source vpc
   * @param {string} aclName name of acl to copy
   * @param {string} destinationVpc copy destination
   */
  store.copyNetworkAcl = function (sourceVpc, aclName, destinationVpc) {
    copyNetworkAcl(store, sourceVpc, aclName, destinationVpc);
  };

  /**
   * copy acl rule to list and update
   * @param {string} sourceVpc
   * @param {string} aclName
   * @param {string} ruleName
   * @param {string} destinationAcl
   */
  store.copyRule = function (sourceVpc, aclName, ruleName, destinationAcl) {
    copyRule(store, sourceVpc, aclName, ruleName, destinationAcl);
  };

  /**
   * copy sg rule to list and update
   * @param {string} sgName
   * @param {string} ruleName
   * @param {string} destinationSg
   */
  store.copySgRule = function (sgName, ruleName, destinationSg) {
    copySgRule(store, sgName, ruleName, destinationSg);
  };

  /**
   * get all rule names
   * @param {string} ruleSource rule source
   * @param {string=} sourceName vpc acl source name, used only for acls
   */
  store.getAllRuleNames = function (ruleSource, sourceName) {
    return getAllRuleNames(store, ruleSource, sourceName);
  };

  /**
   * get all acls or security groups other than selected one for rule copy
   * @param {*} stateData
   * @param {*} componentProps
   * @returns {Array<string>} list of acl names
   */
  store.getAllOtherGroups = function (stateData, componentProps) {
    return getAllOtherGroups(store, stateData, componentProps);
  };

  store.getAllResourceKeys = function () {
    let allKeys = [];
    store.store.json.object_storage.forEach((cos) => {
      cos.keys.forEach((key) => {
        allKeys.push({
          cos: cos.name,
          key: key.name,
          ref:
            "ibm_resource_key." +
            snakeCase(cos.name + "-object-storage-key-" + key.name),
        });
      });
    });
    store.store.json.appid.forEach((appid) => {
      appid.keys.forEach((key) => {
        allKeys.push({
          appid: appid.name,
          key: key.name,
          ref: "ibm_resource_key." + snakeCase(`${key.appid} key ${key.name}`),
        });
      });
    });
    if (store.store.json.logdna.enabled) {
      allKeys.push({
        ref: "ibm_resource_key.logdna_key",
        key: "logdna-key",
      });
    }
    if (store.store.json.sysdig.enabled) {
      allKeys.push({
        ref: "ibm_resource_key.sysdig_key",
        key: "sysdig-key",
      });
    }
    return allKeys;
  };

  // this line enforces scalable subnets without causing application to rerender
  if (!legacy) vpcOnStoreUpdate(store);

  return store;
};

module.exports = state;
