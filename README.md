Running Dapp locally with local block chain

```
$ganache-cli # starts local blockchain
```
Restore MetaMask wallet from mnemonic pass phrase (ganache-cli will output this)

Make sure latest smart contracts have been compiled and deployed (script for this soon to come)

```
$truffle compile #compile to json
$truffle deploy --restart # deploy to local block chain
```

Start web server

```
$npm run start
```
