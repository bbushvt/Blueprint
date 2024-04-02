const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize slz with store update callback
 * @returns {slzStore} slz state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("observability", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("logdna", () => {
    describe("logdna.init", () => {
      it("should initialize logdna", () => {
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: "atracker-cos",
            bucket: "atracker-bucket",
          },
          "it should set defaults"
        );
      });
    });
    describe("logdna.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        craig.store.json.logdna = {
          enabled: false,
          plan: "",
          endpoints: "",
          platform_logs: false,
          resource_group: "aaa",
          cos: "aaa",
          bucket: "aaa",
        };
        craig.update();
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "",
            endpoints: "",
            platform_logs: false,
            resource_group: null,
            cos: null,
            bucket: null,
          },
          "it should set defaults"
        );
      });
    });
    describe("logdna.save", () => {
      it("should update logdna on save", () => {
        craig.logdna.save({
          name: "aaa",
        });
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: null,
            bucket: null,
            name: "aaa",
          },
          "it should set defaults"
        );
      });
      it("should update logdna on save with found bucket", () => {
        craig.logdna.save({
          name: "aaa",
          bucket: "management-bucket",
        });
        assert.deepEqual(
          craig.store.json.logdna,
          {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: "service-rg",
            cos: "cos",
            bucket: "management-bucket",
            name: "aaa",
          },
          "it should set defaults"
        );
      });
    });
  });
  describe("sysdig", () => {
    describe("sysdig.init", () => {
      it("should initialize logdna", () => {
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
          },
          "it should set defaults"
        );
      });
    });
    describe("sysdig.onStoreUpdate", () => {
      it("should reset cos, bucket, and rg when unfound", () => {
        craig.store.json.sysdig = {
          enabled: false,
          plan: "",
          resource_group: "aaa",
        };
        craig.update();
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "",
            resource_group: null,
          },
          "it should set defaults"
        );
      });
    });
    describe("sysdig.save", () => {
      it("should update sysdig on save", () => {
        craig.sysdig.save({
          name: "aaa",
        });
        assert.deepEqual(
          craig.store.json.sysdig,
          {
            enabled: false,
            plan: "graduated-tier",
            resource_group: "service-rg",
            name: "aaa",
          },
          "it should set defaults"
        );
      });
    });
  });
  describe("schema", () => {
    describe("logdna & sysdig", () => {
      it("should return helper text for name", () => {
        assert.deepEqual(
          craig.logdna.name.helperText({}, { craig: craig }),
          "iac-logdna",
          "it should return"
        );
      });
      it("should return list of cos buckets", () => {
        assert.deepEqual(
          craig.logdna.bucket.groups({}, { craig: craig }),
          ["atracker-bucket", "management-bucket", "workload-bucket"],
          "it should return list of buckets"
        );
      });
      it("should return helper text for name", () => {
        assert.deepEqual(
          craig.sysdig.name.helperText({}, { craig: craig }),
          "iac-sysdig",
          "it should return"
        );
      });
      it("should return plan on render", () => {
        assert.deepEqual(
          craig.logdna.plan.onRender({ plan: "30-day" }),
          "30 Day",
          "it should return correct text"
        );
      });
      it("should return false when not enabled for resource group invalid", () => {
        assert.isFalse(
          craig.logdna.resource_group.invalid({ enabled: false }),
          "it should be false"
        );
        assert.isFalse(
          craig.sysdig.resource_group.invalid({ enabled: false }),
          "it should be false"
        );
      });
    });
  });
});
