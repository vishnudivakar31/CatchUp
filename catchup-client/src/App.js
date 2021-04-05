import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import React, { Component } from 'react' 
import Peer from 'peerjs'
import Home from './container/Home'
import { nanoid } from 'nanoid'

class App extends Component {
  constructor(props) {
    super(props)
    this.uuid = nanoid(9).replace(/[-_]/g, 'A')
    this.peer = new Peer(this.uuid)
    this.state = {
      myConnection: undefined,
      remoteConnection: undefined
    }
    this.setMyConnection = this.setMyConnection.bind(this)
    this.setRemoteConnection = this.setRemoteConnection.bind(this)
  }

  setMyConnection(conn) {
    this.setState({
      myConnection: conn
    })
  }
  
  setRemoteConnection(conn) {
    this.setState({
      remoteConnection: conn
    })
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <Home 
              peer={this.peer} 
              uuid={this.uuid} 
              myConnection={this.state.myConnection} 
              remoteConnection={this.state.remoteConnection}
              setMyConnection={this.setMyConnection}
              setRemoteConnection={this.setRemoteConnection}
            />
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
