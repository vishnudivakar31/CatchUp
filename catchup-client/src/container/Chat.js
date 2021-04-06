import React, { Component } from 'react'
import VideoChat from '../components/VideoChat'
import { withRouter } from 'react-router-dom'

class Chat extends Component {
    render() {
        return (
            <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                <VideoChat 
                        calledByMe={this.props.calledByMe}
                        peer={this.props.peer}
                        uuid={this.props.uuid}
                        myConnection={this.props.myConnection} 
                        remoteConnection={this.props.remoteConnection}
                        targetUUID={this.props.targetUUID}
                        history={this.props.history}
                />
            </div>
        )
    }
}

export default withRouter(Chat)
