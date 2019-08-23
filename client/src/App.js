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
          console.log(result);
          var parse_abi = JSON.parse(result);
          let new_contract = this.state.web3.eth.contract(parse_abi).at(this.state.contractAddress)
          this.setState({
              nc: new_contract
          })

          parse_abi = parse_abi.filter(function(method) { return method['constant'] === true });
          this.state.function_names = []
          parse_abi.map(function(e){this.state.function_names.push(e['name'])}.bind(this))
          this.state.abi = parse_abi;
          this.setState({parse_abi: this.state.abi})
          this.setState({function_names: this.state.function_names})
          this.setState({sel_fn: this.state.function_names[0]})
      }
    }.bind(this));
  }

  handleSelectChange = (ev) => {
    // 0x574145d19c3e33518dE2c95A947182901E2Ad021
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
          </Segment>
        )
      }
    }

    return (
      <div id="main" className="">
        <Header as='h1'>Smart Contract Runner </Header>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleContract.bind(this)}>
              <Form.Field>
                <label>Contract Address</label>
                <input value={this.state.contractAddress} onChange={this.handleChange.bind(this)} data-prop-name= 'contractAddress'/>
              </Form.Field>
              <Button type="submit" className="btn btn-info btn-lg" data-toggle="modal" data-target="#contractResults">Get Contract!</Button>
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
                          {this.state.abi.map(function(fn, idx){return <option select={(idx == 0).toString()} data-name={fn['name']} id={idx}> {fn['name']} () </option>})}
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
