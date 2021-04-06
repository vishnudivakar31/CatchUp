import React, { Component } from 'react'
import CallIcon from '@material-ui/icons/Call'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import './videochat.css'
import { TimerSharp } from '@material-ui/icons'

class VideoChat extends Component {
    constructor(props) {
        super(props)
        this.peer=this.props.peer
        this.uuid=this.props.uuid
        this.targetUUID=this.props.targetUUID
        this.myVideoRef = React.createRef()
        this.remoteVideoRef = React.createRef()
        this.callFriend = this.callFriend.bind(this)
        this.receiveCall = this.receiveCall.bind(this)
        this.handleDisconnection = this.handleDisconnection.bind(this)
        this.showDisconnectMessage = this.showDisconnectMessage.bind(this)
        this.stopUserMedia = this.stopUserMedia.bind(this)
        this.endCall = this.endCall.bind(this)
        this.state = {
            callDisconnected: false
        }
    }

    componentDidMount() {
        this.callFriend()
        this.receiveCall()
        this.remoteVideoRef.onended = e => this.handleDisconnection()
        this.peer.on('connection', conn => {
            conn.on('data', data => {
                if(data.message_type && data.message_type === 'call-disconnected') {
                    this.endCall()
                }
            })
        })
    }
    
    componentWillUnmount() {
        if (this.props.remoteConnection) {
            this.props.remoteConnection.send({
                message_type: 'call-disconnected'
            })
        }
    }

    endCall() {
        this.handleDisconnection()
        if(this.myCallObj) {
            this.myCallObj.close()
        }
        if(this.receiveCallObj) {
            this.receiveCallObj.close()
        }
        if(this.props.remoteConnection) {
            this.props.remoteConnection.send({
                message_type: 'call-disconnected'
            })
        }
        this.props.history.push("/")
    }

    showDisconnectMessage() {
        return (
            <Modal
                open={this.state.callDisconnected}
                disableBackdropClick={false}
            >
                <div className='calling_card'>
                    <p>Call disconnected.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10%' }}>
                        <Button
                            color='primary'
                            style={{ marginLeft: '2%' }}
                            onClick={() => this.props.history.push("/")}
                        >
                            Ok
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    handleDisconnection() {
        this.setState({
            callDisconnected: true
        })
        this.stopUserMedia(this.myVideoRef)
        this.myVideoRef.srcObject = null

        this.stopUserMedia(this.remoteVideoRef)
        this.remoteVideoRef.srcObject = null
    }

    stopUserMedia(ref) {
        let stream = this.myVideoRef.srcObject
        if(stream) {
            let tracks = stream.getTracks()
            tracks.forEach(track => track.stop())
        }
    }

    callFriend() {
        if (this.props.calledByMe) {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(stream => {
                let call = this.peer.call(this.targetUUID, stream)
                this.myCallObj = call
                call.on('stream', remoteStream => {
                    this.remoteVideoRef.srcObject = remoteStream
                })
                call.on('close', e => this.endCall())
                this.myVideoRef.srcObject = stream
            })
            .catch(err => console.log(err))  
        }
    }

    receiveCall() {
        this.peer.on('call', call => {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(stream => {
                this.receiveCallObj = call
                call.answer(stream)
                call.on('stream', remoteStream => {
                    this.remoteVideoRef.srcObject = remoteStream
                })
                call.on('close', e => this.endCall())
                this.myVideoRef.srcObject = stream
            })
            .catch(err => console.log(err))
        })
    }

    render() {
        return (
            <div className='video-chat'>
                <div className='header'>
                    <div className="brand">CatchUp</div>
                    <div className='connection-notification'>
                        <CallIcon 
                            fontSize='small'
                        />
                        <div style={{ marginLeft: '2%', whiteSpace: 'nowrap' }}>{this.targetUUID} connected.</div>
                    </div>
                </div>
                <div className='video-container'>
                    <div className='remote-video-container'>
                        <video className='remote-video' ref={video => this.remoteVideoRef = video} autoPlay />
                    </div>
                    <div className='my-video-container'>
                        <video className='my-video' ref={video => this.myVideoRef = video} autoPlay muted />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                color='secondary'
                                variant='contained'
                                onClick={this.endCall}
                            >
                                End Call
                            </Button>
                        </div>
                    </div>
                </div>
                
                {this.showDisconnectMessage()}
            </div>
        )
    }
}

export default VideoChat
