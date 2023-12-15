const { assert } = require("chai");
const { formatVpn, vpnTf } = require("../../client/src/lib/json-to-iac/vpn");
const slzNetwork = require("../data-files/slz-network.json");

describe("vpn gateways", () => {
  describe("formatVpn", () => {
    it("should create tf code for vpn gateway", () => {
      let actualData = formatVpn(
        {
          name: "management",
          resource_group: "slz-management-rg",
          subnet: "vpn-zone-1",
          vpc: "management",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_gateway" "management_management_vpn_gw" {
  name           = "\${var.prefix}-management-management-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create tf code for vpn gateway with policy", () => {
      let actualData = formatVpn(
        {
          name: "management",
          resource_group: "slz-management-rg",
          subnet: "vpn-zone-1",
          vpc: "management",
          policy_mode: true,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_gateway" "management_management_vpn_gw" {
  name           = "\${var.prefix}-management-management-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
  resource_group = ibm_resource_group.slz_management_rg.id
  mode           = "policy"
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vpnTf", () => {
    it("should create tf code for vpn gateway", () => {
      let nw = { ...slzNetwork };
      nw.vpn_gateways[0].additional_prefixes = ["127.0.0.1/5"];
      nw.vpn_gateways[0].connections = undefined;
      let actualData = vpnTf(nw);
      let expectedData = `##############################################################################
# VPN Gateways
##############################################################################

resource "ibm_is_vpn_gateway" "management_management_gateway_vpn_gw" {
  name           = "\${var.prefix}-management-management-gateway-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}

resource "ibm_is_vpc_address_prefix" "management_management_gateway_on_prem_127_0_0_1_5_prefix" {
  name = "\${var.prefix}-management-management-gateway-on-prem-127-0-0-1-5"
  vpc  = module.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "127.0.0.1/5"
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create tf code for vpn gateway with connections", () => {
      let nw = { ...slzNetwork };
      nw.vpn_gateways[0].additional_prefixes = ["127.0.0.1/5"];
      nw.vpn_gateways[0].connections = [
        {
          vpn: "management-gateway",
          name: "connection-1",
          local_cidrs: ["10.10.10.10/24"],
          peer_cidrs: ["10.10.20.10/24"],
        },
      ];
      let actualData = vpnTf(nw);
      let expectedData = `##############################################################################
# VPN Gateways
##############################################################################

resource "ibm_is_vpn_gateway" "management_management_gateway_vpn_gw" {
  name           = "\${var.prefix}-management-management-gateway-vpn-gw"
  subnet         = module.management_vpc.vpn_zone_1_id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags = [
    "slz",
    "landing-zone"
  ]
  timeouts {
    delete = "1h"
  }
}

resource "ibm_is_vpn_gateway_connection" "management_management_gateway_vpn_gw_connection_connection_1" {
  name          = "\${var.prefix}-management-gateway-connection-1"
  vpn_gateway   = ibm_is_vpn_gateway.management_management_gateway_vpn_gw.id
  peer_address  = ibm_is_vpn_gateway.management_management_gateway_vpn_gw.public_ip_address
  preshared_key = var.management_gateway_connection_1_preshared_key
  local_cidrs = [
    "10.10.10.10/24"
  ]
  peer_cidrs = [
    "10.10.20.10/24"
  ]
}

resource "ibm_is_vpc_address_prefix" "management_management_gateway_on_prem_127_0_0_1_5_prefix" {
  name = "\${var.prefix}-management-management-gateway-on-prem-127-0-0-1-5"
  vpc  = module.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "127.0.0.1/5"
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
