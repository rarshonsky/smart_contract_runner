const KeyStore = artifacts.require('KeyStore');

module.exports = function(deployer) {
  deployer.deploy(KeyStore);
  deployer.then(function() {
  // Create a new version of A
  return KeyStore.deployed();
}).then(function(instance) {
  abi = JSON.stringify(KeyStore.abi)
  instance.setABI(abi);
  return instance;
});
};
