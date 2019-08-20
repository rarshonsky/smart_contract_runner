import React, { Component } from 'react'
import { Header, Divider, Form, Button, Segment } from 'semantic-ui-react'
import TruffleContract from 'truffle-contract'
import ReactTable from 'react-table'

import getWeb3 from './utils/getWeb3'
import KeyStoreContract from './contracts/KeyStore.json'

import './App.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-table/react-table.css'

const columns =  [{
   Header: 'First Name',
   accessor: 'first_name',
 }, {
   Header: 'Last Name',
   accessor: 'last_name',
 }, {
   Header: 'Type',
   accessor: 'type',
 }, {
   Header: 'Key',
   accessor: 'key',
 }, {
   Header: 'Verified',
   accessor: 'verified',
}, {
  Header: 'Compromised',
  accessor: 'compromised',
}]


class App extends Component {

  state = {
    loaded: false,
    triedInit: false,
    email: '',
    firstName: '',
    lastName: '',
    key: '',
    searchEmail: '',
    rows: [],
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

      const token = TruffleContract(KeyStoreContract)
      token.setProvider(this.state.web3.currentProvider)
      token.defaults({from: accounts[0]})

      token.deployed().then(contract => {
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

  handleSubmit = (ev) => {
    ev.preventDefault()
    this.state.contract.addKey(this.state.email, this.state.firstName, this.state.lastName, this.state.key, this.state.type).then(() => {
      alert('Key added!')
      window.location.reload()
    }).catch(err => {
      console.error(err)
    })
  }

  handleContract = (ev) => {
    ev.preventDefault()
    var abi = [{outputs:[],inputs:[],constant:false,payable:false,type:'constructor'},{name:'getABI',outputs:[{type: "string", name: "out"}],inputs:[],constant:true,payable:false,type:'function',gas:1448653}]
    // var qux = this.state.web3.eth.contract(abi).at(this.state.contractAddress)
    var qux = this.state.web3.eth.contract(abi).at('0x62a0b509a50131ccb311976e3cd0885bd4aaffbc')

    // var contract_call = 'this.state.contract.' + this.state.type + '("' + this.state.searchEmail + '",0)';
    // let eval_promise = eval(contract_call).then(results => {
    //   console.log(results);
    //   return results;
    // }).catch(err => {
    //   console.error("error finding contracts: ", err);
    // });
    //
    // Promise.all([eval_promise])
    //      .then((results) => {
    //       this.setState({
    //           contract_result: results
    //       })
    //        console.log("All done", results)
    //      })
    //      .catch((e) => {
    //          // Handle errors here
    // });


    qux.getABI.call(function(error,result){
      if(error){
          console.log("Error");
          throw error;
      }else{
          console.log(result);
          var parse_abi = JSON.parse(result);
          // let new_contract = this.state.web3.eth.contract(parse_abi).at(this.state.contractAddress)
          // this.setState({
          //     nc: new_contract
          // })

          parse_abi = parse_abi.filter(function(method) { console.log(method['constant']); return method['constant'] === true });
          console.log(parse_abi);
          this.state.function_names = []
          parse_abi.map(function(e){this.state.function_names.push(e['name'])}.bind(this))
          this.state.abi = parse_abi;
          this.setState({parse_abi: this.state.abi})
          console.log('--===' + this.state.function_names)
          // debugger;
          this.setState({function_names: this.state.function_names})

          // this.setState({inputs: parse_abi[1]["inputs"]});
          var contract_call = 'this.state.nc.' + this.state.type + '("' + this.state.searchEmail + '",0)';
          // let moo = eval(contract_call).then(results => {
          //   console.log(results);
          //   return results;
          // }).catch(err => {
          //   console.error("error finding contracts: ", err);
          // });
          //
          // Promise.all([moo])
          //      .then((results) => {
          //       this.setState({
          //           contract_result: results
          //       })
          //        console.log("All done", results)
          //      })
          //      .catch((e) => {
          //          // Handle errors here
          // });

          // debugger;
      }
    }.bind(this));
  }

  handleSelectChange = (ev) => {
    var index = ev.nativeEvent.target.selectedIndex;
    var fnum = parseInt(ev.nativeEvent.target[index].id);
    debugger;
    // this.state.selected_function = ev;
    this.setState({inputs: this.state.parse_abi[fnum]["inputs"]});
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
    var contract_call = 'this.state.nc.' + this.state.type + '(' + inputs.join(',') + ')';
    debugger;
  }


  handleSearchSubmit = (ev) => {
    ev.preventDefault()
    let promises = [];
    let i = 0;
    for (i = 0; i < 10; ++i) {
      let key_promise =  this.state.contract.getKey(this.state.searchEmail, i).then((e) => {
        return JSON.parse(e)
      })
      promises.push(key_promise)
    }

    Promise.all(promises)
         .then((results) => {
           results = results.filter(function (el) {
            return Object.keys(el).length != 0;
          });
          this.setState({
              rows: results
          })
           console.log("All done", results)
         })
         .catch((e) => {
             // Handle errors here
    });
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
        <Header as='h1'>Decentralized PGP Key Store </Header>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleSearchSubmit.bind(this)}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.search_email} onChange={this.handleChange.bind(this)} data-prop-name= 'searchEmail'/>
              </Form.Field>
              <Button type="submit" className="btn btn-info btn-lg" data-toggle="modal" data-target="#searchResults">Search</Button>
            </Form>
          </Segment>
        </div>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleSubmit.bind(this)}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.email} onChange={this.handleChange.bind(this)} data-prop-name= 'email'/>
              </Form.Field>
              <Form.Field>
                <label>First Name:</label>
                <input value={this.state.firstName} onChange={this.handleChange.bind(this)} data-prop-name = 'firstName'/>
              </Form.Field>
              <Form.Field>
                <label>Last Name</label>
                <input value={this.state.lastName} onChange={this.handleChange.bind(this)} data-prop-name = 'lastName'/>
              </Form.Field>
              <Form.Field>
                <label>Key:</label>
                <input value={this.state.key} onChange={this.handleChange.bind(this)} data-prop-name= 'key' />
              </Form.Field>
              <Form.Field>
                <label>Type:</label>
                <input value={this.state.type} onChange={this.handleChange.bind(this)} data-prop-name = 'type'/>
              </Form.Field>
              <Button type='submit'>Add Key</Button>
            </Form>
          </Segment>
        </div>
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
        <Divider />

        <div id="contractResults" className="fade modal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Contract Info</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                   <input value={this.state.contract_result || ''} disabled />
                   <div id="display-data-Container">

                   <form onSubmit={this.handleContractCall.bind(this)}>
                       <select onChange={this.handleSelectChange.bind(this)}>
                          {this.state.abi.map(function(fn, idx){return <option name={fn['name']} id={idx}> {fn['name']} () </option>})}
                       </select>
                      <div id="inputs">
                          {this.state.inputs.map(function(foo, idx){return <label>{foo['name']}({foo['type']}) <input type="text" data-type= {foo['type']} name={foo['name']} ref={'input' + idx}/></label> })}
                      </div>

                        <Button type="submit" className="btn btn-info btn-lg">Call Contract</Button>
                   </form>


                  </div>


              </div>
            </div>

          </div>
        </div>

        <div id="searchResults" className="fade modal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Search Results</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                <ReactTable
                  data={this.state.rows}
                  columns={columns}
                  className="-striped -highlight"
                  showPagination={false}
                />
              </div>
            </div>

          </div>
        </div>




      </div>
    )
  }
}

export default App
