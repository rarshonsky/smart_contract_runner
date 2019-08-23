import React, { Component } from 'react'
import { Header, Divider, Form, Button, Segment } from 'semantic-ui-react'
import TruffleContract from 'truffle-contract'

import getWeb3 from './utils/getWeb3'
import AbiContract from './contracts/ABI.json'

import './App.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  state = {
    loaded: false,
    triedInit: false,
    type: '',
    contractAddress: '',
    inputs: [],
    function_names: [],
    abi: []
  }

  componentDidMount() {
    this.initWeb3()
    setTimeout(() => {
      this.setState({
        triedInit: true,
      })
    }, 1000)
  }

  initWeb3() {
    getWeb3.then(({ web3 }) => {
      console.log('web3: ', web3)
      this.setState({
        web3: web3,
      })
      this.initContract(web3)
    }).catch(err => {
      console.error("error finding web3: ", err)
    })
  }

  initContract(web3) {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        console.error("error finding accounts: ", err)
        return
      }

      const token = TruffleContract(AbiContract)
      token.setProvider(this.state.web3.currentProvider)
      token.defaults({from: accounts[0]})

      token.at('0x58E3Cf8AFb3ee89246e9AD74fDd2dFB5E7E9E1ab').then(contract => {
        this.setState({
          contract: contract,
          account: accounts[0],
        })

        this.initData()
      }).catch(err => {
        console.error("error finding contracts: ", err)
      })
    })
  }

  async initData() {
    this.setState({
      loaded: true,
    })
  }

  handleChange = (ev) => {
    let elements = {}
    elements[ev.target.dataset['propName']] = ev.target.value
    this.setState(elements)
  }
  handleContract = (ev) => {
    ev.preventDefault()
    var abi = [{outputs:[],inputs:[],constant:false,payable:false,type:'constructor'},{name:'getABI',outputs:[{type: "string", name: "out"}],inputs:[],constant:true,payable:false,type:'function',gas:1448653}]
    var mock_contact = this.state.web3.eth.contract(abi).at(this.state.contractAddress)
    mock_contact.getABI.call(function(error,result){
      if(error){
          console.log("Error");
          throw error;
      }else{
          var parse_abi = JSON.parse(result);
          let new_contract = this.state.web3.eth.contract(parse_abi).at(this.state.contractAddress)
          this.setState({
              nc: new_contract
          })

          parse_abi = parse_abi.filter(function(method) { return method['constant'] === true });
          this.state.function_names = []
          parse_abi.map(function(e){this.state.function_names.push(e['name'])}.bind(this))
          // e['name'] + '() => ' + e['outputs'][0]['type'])

          this.state.abi = parse_abi;
          this.setState({parse_abi: this.state.abi})
          this.setState({function_names: this.state.function_names})
          this.setState({sel_fn: this.state.function_names[0]})
      }
    }.bind(this));
  }

  handleSelectChange = (ev) => {
    var index = ev.nativeEvent.target.selectedIndex;
    var fnum = parseInt(ev.nativeEvent.target[index].id);
    this.setState({inputs: this.state.parse_abi[fnum]["inputs"]});
    this.setState({sel_fn: ev.target[index].dataset['name']})
  }

  handleContractCall = (ev) => {
    ev.preventDefault();
    var inputs = [];
    Object.keys(this.refs).forEach(function (key) {
      var type = this.refs[key].dataset['type'];
      var val = this.refs[key].value;
      if(type == 'string') {
        val = '"' + val + '"';
      }
    inputs.push(val)

  }.bind(this))
    inputs.push('function(e,r){this.setState({contract_result: r});}.bind(this)');
    var contract_call = 'this.state.nc.' + this.state.sel_fn + '.call(' + inputs.join(',') + ')';
    eval(contract_call);
  }

  render() {
    if (!this.state.loaded) {
      if (!this.state.triedInit) {
        return <p>Loading...</p>
      } else {
        return (
          <Segment>
            <h2>No connection to Thunder</h2>
            <p>Please make sure you are using a DApp browser such as MetaMask or Mist.</p>
            <p> This contract is deployed to the Thundercore Test Net</p>
            <p> Thundercore Wallet Instructions: <a href='https://www.thundercore.com/wallet-instructions'>https://www.thundercore.com/wallet-instructions</a> </p>
            <p> Add custom RPC on MetaMask withthe following values:


          </p>
          <table>
            <tr>
              <td>Network Name </td>
              <td> Thundercore Test Net </td>
            </tr>
            <tr>
              <td>New RPC URL</td>
              <td> https://testnet-rpc.thundercore.com </td>
            </tr>
            <tr>
              <td>ChainID </td>
              <td> 18 </td>
            </tr>
            <tr>
              <td>Symbol </td>
              <td> TT </td>
            </tr>
          </table>

          <p> Once connected Go to <a href='https://faucet-testnet.thundercore.com'>https://faucet-testnet.thundercore.com</a> to get free testnet tokens.</p>
          <p>Authenticate with Google or Github. </p>
          <p>Enter Wallet address to receive tokens at (this can be found at the top of MetaMask, click Account 1 and it'll copy the address) </p>

          </Segment>
        )
      }
    }

    return (
      <div id="main" className="">
        <Header as='h1' className="name">Smart Contract Runner</Header>
        <Header as='h3'>
          <a href="https://github.com/rarshonsky/smart_contract_runner"><svg width="50" height="50" class="octicon octicon-mark-github" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg></a>

        </Header>
        <Header as='h5' className='white'>
            <a href="https://dkey.store">Decentralized Key Store</a> test contract address: 0x574145d19c3e33518dE2c95A947182901E2Ad021
        </Header>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleContract.bind(this)}>
              <Form.Field>
                <label>Contract Address</label>
                <input id="contract-address" value={this.state.contractAddress} onChange={this.handleChange.bind(this)} data-prop-name= 'contractAddress'/>
              </Form.Field>
              <Button id="contract-button" type="submit" className="btn btn-info btn-lg" data-toggle="modal" data-target="#contractResults">Get Contract!</Button>
            </Form>
          </Segment>
        </div>

        <div id="contractResults" className="fade modal" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Contract Info</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                  <label>
                    Contract Call Results
                    <textarea rows="20" cols="100" value={this.state.contract_result || ''} disabled />
                  </label>
                   <div id="display-data-Container">
                   <form onSubmit={this.handleContractCall.bind(this)}>
                       <select onChange={this.handleSelectChange.bind(this)}>
                          {this.state.abi.map(function(fn, idx){return <option select={(idx == 0).toString()} data-name={fn['name']} id={idx}> {fn['name']}() => {fn['outputs'][0]['type']} </option>})}
                       </select>
                      <div id="inputs">
                        <table>
                          <tbody>
                            {this.state.inputs.map(function(input_attr, idx){return <tr><td><label>{input_attr['name']}({input_attr['type']})</label></td><td><input type="text" data-type= {input_attr['type']} name={input_attr['name']} ref={'input' + idx} required/></td></tr>})}
                          </tbody>
                        </table>
                      </div>
                        <Button type="submit" className="btn btn-info btn-lg">Call Contract</Button>
                   </form>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
