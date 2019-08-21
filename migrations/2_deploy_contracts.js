const ABI = artifacts.require('ABI');

module.exports = function(deployer) {
  deployer.deploy(ABI);
  deployer.then(function() {
  // Create a new version of A
  return ABI.deployed();
}).then(function(instance) {
  abi = JSON.stringify(ABI.abi)
  instance.setABI(abi);
  return instance;
});
};
