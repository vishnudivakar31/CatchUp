import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import React, { Component } from 'react' 
import Peer from 'peerjs'
import Home from './container/Home'
import Chat from './container/Chat'
import { nanoid } from 'nanoid'

class App extends Component {
  constructor(props) {
    super(props)
    this.uuid = nanoid(9).replace(/[-_]/g, 'A')
    this.peer = new Peer(this.uuid)
    this.state = {
      myConnection: undefined,
      remoteConnection: undefined,
      targetUUID: '',
      calledByMe: false
    }
    this.setMyConnection = this.setMyConnection.bind(this)
    this.setRemoteConnection = this.setRemoteConnection.bind(this)
    this.setTargetUUID = this.setTargetUUID.bind(this)
    this.setCalledByMe = this.setCalledByMe.bind(this)
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

  setTargetUUID(uuid) {
    this.setState({
      targetUUID: uuid
    })
  }

  setCalledByMe(status) {
    this.setState({
      calledByMe: status
    })
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path='/chat'>
            <Chat 
              peer={this.peer} 
              uuid={this.uuid} 
              myConnection={this.state.myConnection} 
              remoteConnection={this.state.remoteConnection}
              targetUUID={this.state.targetUUID}
              calledByMe={this.state.calledByMe}
            />
          </Route>
          <Route path="/">
            <Home 
              peer={this.peer} 
              uuid={this.uuid} 
              myConnection={this.state.myConnection} 
              remoteConnection={this.state.remoteConnection}
              setMyConnection={this.setMyConnection}
              setRemoteConnection={this.setRemoteConnection}
              setTargetUUID={this.setTargetUUID}
              setCalledByMe={this.setCalledByMe}
            />
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
