// var MyToken = artifacts.require('MyToken')
//
// module.exports = function(deployer) {
//   deployer.deploy(MyToken)
// }
const KeyStore = artifacts.require('KeyStore');
module.exports = function(deployer) {
  deployer.deploy(KeyStore);
};
