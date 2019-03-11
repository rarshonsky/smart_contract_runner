import React, { Component } from 'react'
import { Header, Divider, Form, Button, Segment } from 'semantic-ui-react'
import TruffleContract from 'truffle-contract'

import getWeb3 from './utils/getWeb3'
import KeyStoreContract from './contracts/KeyStore.json'

import './App.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


class App extends Component {

  state = {
    loaded: false,
    triedInit: false,
    email: '',
    firstName: '',
    lastName: '',
    key: '',
    searchEmail: '',
    resultName: '',
    resultKey: ''
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

  handleChangeFirstName = (ev) => {
    this.setState({
      firstName: ev.target.value,
    })
  }

  handleChangeLastName = (ev) => {
    this.setState({
      lastName: ev.target.value,
    })
  }

  handleChangeKey = (ev) => {
    this.setState({
      key: ev.target.value,
    })
  }

  handleChangeEmail = (ev) => {
    this.setState({
      email: ev.target.value,
    })
  }

  handleChangeSearchEmail = (ev) => {
    this.setState({
      searchEmail: ev.target.value,
    })
  }

  handleSubmit = (ev) => {
    ev.preventDefault()
    this.state.contract.addKey(this.state.email, this.state.firstName, this.state.lastName, this.state.key).then(() => {
      alert('Key added!')
      window.location.reload()
    }).catch(err => {
      console.error(err)
    })
  }

  handleSearchSubmit = (ev) => {
    ev.preventDefault()
    this.state.resultKey = ""
    this.state.resultName = ""
    this.state.contract.getName(this.state.searchEmail).then((e) => {
      this.setState({
        resultName: e,
      })
      console.log(e)
    }).catch(err => {
      console.error(err)
    })

    this.state.contract.getKey(this.state.searchEmail).then((e) => {
      this.setState({
        resultKey: e,
      })
      console.log(e)
    }).catch(err => {
      console.error(err)
    })
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
            <Form onSubmit={this.handleSearchSubmit}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.search_email} onChange={this.handleChangeSearchEmail} />
              </Form.Field>
              <Button type="submit" className="btn btn-info btn-lg" data-toggle="modal" data-target="#searchResults">Search</Button>
            </Form>
          </Segment>
        </div>
        <Divider />
        <div>
          <Segment>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <label>Email:</label>
                <input value={this.state.email} onChange={this.handleChangeEmail} />
              </Form.Field>
              <Form.Field>
                <label>First Name:</label>
                <input value={this.state.firstName} onChange={this.handleChangeFirstName} />
              </Form.Field>
              <Form.Field>
                <label>Last Name</label>
                <input value={this.state.lastName} onChange={this.handleChangeLastName} />
              </Form.Field>
              <Form.Field>
                <label>Key:</label>
                <input value={this.state.key} onChange={this.handleChangeKey} />
              </Form.Field>
              <Button type='submit'>Add Key</Button>
            </Form>
          </Segment>
        </div>
        <div id="searchResults" className="fade modal" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Search Results</h4>
                <Button type="button" className="close" data-dismiss="modal">&times;</Button>
              </div>
              <div className="modal-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>{this.state.resultName}</td>
                      <td>{this.state.resultKey}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

}

export default App
