import React, { Component } from 'react'
import CallIcon from '@material-ui/icons/Call'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TextChat from './TextChat'
import IconButton from '@material-ui/core/IconButton'
import CallEndIcon from '@material-ui/icons/CallEnd'
import MicOffIcon from '@material-ui/icons/MicOff'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import VideocamIcon from '@material-ui/icons/Videocam'
import MicIcon from '@material-ui/icons/Mic'
import './videochat.css'

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
        this.toggleAudio = this.toggleAudio.bind(this)
        this.toggleVideo = this.toggleVideo.bind(this)
        this.state = {
            callDisconnected: false,
            videoOff: false,
            audioOff: false
        }
    }

    componentDidMount() {
        this.callFriend()
        this.receiveCall()
        this.remoteVideoRef.onended = e => this.handleDisconnection()
        this.peer.on('connection', conn => {
            conn.on('data', data => {
                if(data.message_type && data.message_type === 'call-disconnected') {
                    if(this.myCallObj) {
                        this.myCallObj.close()
                    }
                    if(this.receiveCallObj) {
                        this.receiveCallObj.close()
                    }
                    this.props.history.push("/")
                }
            })
        })
    }

    componentDidUpdate(_ ,prevState) {
        if(this.state.audioOff !== prevState.audioOff) {
            this.toggleAudio()
        }
        if (this.state.videoOff !== prevState.videoOff) {
            this.toggleVideo()
        }
    }

    toggleAudio() {
        if(this.myStream) {
            this.myStream.getAudioTracks()[0].enabled = !this.state.audioOff
        }
    }

    toggleVideo() {
        if(this.myStream) {
            this.myStream.getVideoTracks()[0].enabled = !this.state.videoOff
        }
    }
    
    componentWillUnmount() {
        if (this.props.remoteConnection) {
            this.props.remoteConnection.send({
                message_type: 'call-disconnected'
            })
        }
        if(this.props.myConnection) {
            this.props.myConnection.send({
                message_type: 'call-disconnected'
            })
        }
        this.handleDisconnection()
    }

    endCall() {
        let conn = this.peer.connect(this.props.targetUUID)
        conn.on('open', () => {
            conn.send({
                message_type: 'call-disconnected'
            })
        })
        if(this.myCallObj) {
            this.myCallObj.close()
        }
        if(this.receiveCallObj) {
            this.receiveCallObj.close()
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
        if(this.myVideoRef !== null) {
            this.myVideoRef.srcObject = null
        }
    
        this.stopUserMedia(this.remoteVideoRef)
        if(this.remoteVideoRef !== null) {
            this.remoteVideoRef.srcObject = null
        }
    }

    stopUserMedia(ref) {
        if(ref !== null) {
            let stream = ref.srcObject
            if(stream) {
                let tracks = stream.getTracks()
                tracks.forEach(track => track.stop())
            }
        }
    }

    callFriend() {
        if (this.props.calledByMe) {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(stream => {
                this.myStream = stream
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
                this.myStream = stream
                this.receiveCallObj = call
                call.answer(stream)
                call.on('stream', remoteStream => {
                    if(this.remoteVideoRef !== null) {
                        this.remoteVideoRef.srcObject = remoteStream
                    }
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
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2%' }}>
                            <IconButton
                                style={{
                                    padding: '2%',
                                    border: '0.5px solid grey',
                                    borderRadius: '20px',
                                    background: this.state.videoOff ? 'grey' : 'white',
                                    color: this.state.videoOff? 'white' : 'grey'
                                }}
                                onClick={() => this.setState({ videoOff: !this.state.videoOff })}
                            >
                                {this.state.videoOff ? <VideocamOffIcon /> : <VideocamIcon />} 
                            </IconButton>
                            <IconButton
                                style={{
                                    padding: '2%',
                                    border: '0.5px solid grey',
                                    borderRadius: '20px',
                                    marginLeft: '3%',
                                    background: this.state.audioOff ? 'grey' : 'white',
                                    color: this.state.audioOff? 'white' : 'grey'
                                }}
                                onClick={() => this.setState({ audioOff: !this.state.audioOff })}
                            >
                                {this.state.audioOff ? <MicOffIcon /> : <MicIcon />}
                            </IconButton>
                            <IconButton
                                onClick={this.endCall}
                                style={{
                                    padding: '2%',
                                    borderRadius: '20px',
                                    border: '0.5px solid grey',
                                    background: 'red',
                                    color: 'white',
                                    marginLeft: '3%'
                                }}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </div>
                        <TextChat 
                            peer={this.props.peer}
                            uuid={this.props.uuid}
                            targetUUID={this.props.targetUUID}
                            calledByMe={this.props.calledByMe}
                            myConnection={this.props.myConnection} 
                            remoteConnection={this.props.remoteConnection}
                        />
                    </div>
                </div>
                
                {this.showDisconnectMessage()}
            </div>
        )
    }
}

export default VideoChat
