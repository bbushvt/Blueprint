const { splat } = require("lazy-z");
const { lazyZstate } = require("lazy-z/lib/store");
const { newDefaultCos } = require("./defaults");
const {
  pushAndUpdate,
  updateChild,
  carveChild,
  pushToChildField,
  updateSubChild,
  deleteSubChild,
  setUnfoundResourceGroup,
  setUnfoundEncryptionKey
} = require("./store.utils");

/**
 * set cosBuckets and cosKeys in slz store
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.cos
 * @param {Function} instanceCallback callback after setting splat
 */
function cosSetStoreBucketsAndKeys(config, instanceCallback) {
  config.store.json.cos.forEach(instance => {
    // add all bucket names from instance to buckets
    config.store.cosBuckets = config.store.cosBuckets.concat(
      splat(instance.buckets, "name")
    );
    // add all key names to keys
    config.store.cosKeys = config.store.cosKeys.concat(
      splat(instance.keys, "name")
    );
    // if callback run callback against instance
    if (instanceCallback) {
      instanceCallback(instance);
    }
  });
}

/**
 * initialize object storage
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 */
function cosInit(config) {
  config.store.json.cos = newDefaultCos();
  cosSetStoreBucketsAndKeys(config);
}

/**
 * cos on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<object>} config.store.json.cos
 * @param {Array<object>} config.store.json.cos.buckets
 * @param {string} config.store.json.cos.buckets.kms_key
 */
function cosOnStoreUpdate(config) {
  config.store.cosInstances = splat(config.store.json.cos, "name");
  config.store.cosBuckets = [];
  config.store.cosKeys = [];
  cosSetStoreBucketsAndKeys(config, instance => {
    setUnfoundResourceGroup(config, instance);
    // for each bucket, if encryption key is not found set to null
    instance.buckets.forEach(bucket => {
      setUnfoundEncryptionKey(config, bucket);
    });
  });
}

/**
 * create new cos instance
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 */
function cosCreate(config, stateData) {
  stateData.buckets = [];
  stateData.keys = [];
  pushAndUpdate(config, "cos", stateData);
}

/**
 * delete a cos instance
 * @param {lazyZstate} config state store

 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosDelete(config, stateData, componentProps) {
  carveChild(config, "cos", componentProps);
}

/**
 * update a cos instance
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosSave(config, stateData, componentProps) {
  updateChild(config, "cos", stateData, componentProps);
}

/**
 * create a new cos bucket
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} stateData.showBucket show bucket prop from form
 * @param {object} componentProps props from component form
 */
function cosBucketCreate(config, stateData, componentProps) {
  delete stateData.showBucket;
  pushToChildField(config, "cos", "buckets", stateData, componentProps);
}

/**
 * save a cos bucket
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {object} config.store.json.atracker
 * @param {string} config.store.json.atracker.collector_bucket_name
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data
 * @param {string} componentProps.data.name
 */
function cosBucketSave(config, stateData, componentProps) {
  updateSubChild(config, "cos", "buckets", stateData, componentProps, slz => {
    if (
      config.store.json.atracker.collector_bucket_name ===
      componentProps.data.name
    )
      config.store.json.atracker.collector_bucket_name = stateData.name;
  });
}

/**
 * delete a cos bucket
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosBucketDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cos", "buckets", componentProps);
}

/**
 * create a new cos key
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyCreate(config, stateData, componentProps) {
  pushToChildField(config, "cos", "keys", stateData, componentProps);
}

/**
 * save a cos key
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 * @param {object} componentProps.data original object data
 * @param {string} componentProps.data.name key name before update
 */
function cosKeySave(config, stateData, componentProps) {
  updateSubChild(config, "cos", "keys", stateData, componentProps, config => {
    if (config.store.json.atracker.cos_key === componentProps.data.name) {
      config.store.json.atracker.cos_key = stateData.name;
    }
  });
}

/**
 * delete a cos key
 * @param {lazyZstate} config state store
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function cosKeyDelete(config, stateData, componentProps) {
  deleteSubChild(config, "cos", "keys", componentProps);
}

module.exports = {
  cosKeyCreate,
  cosKeySave,
  cosKeyDelete,
  cosBucketDelete,
  cosBucketSave,
  cosBucketCreate,
  cosCreate,
  cosDelete,
  cosSave,
  cosOnStoreUpdate,
  cosInit
};
