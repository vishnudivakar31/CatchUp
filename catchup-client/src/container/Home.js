import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CallIcon from '@material-ui/icons/Call';
import { nanoid } from 'nanoid'

import "./Home.css"

class Home extends Component {
    
    constructor(props) {
        super(props)
        this.socket = this.props.socket
        this.uuid = nanoid(9)
        this.callButtonTapped = this.callButtonTapped.bind(this)
        this.initiateP2P = this.initiateP2P.bind(this)
        this.setup = this.setup.bind(this)
        this.onMessageForDC = this.onMessageForDC.bind(this)
        this.createAnswer = this.createAnswer.bind(this)
        this.invalidUUID = this.invalidUUID.bind(this)
        this.onMessageForRemoteDC = this.onMessageForRemoteDC.bind(this)
        this.setRemoteDescription = this.setRemoteDescription.bind(this)
        this.dataChannelOpened = this.dataChannelOpened.bind(this)
        this.setup()
    }

    componentDidMount() {
        this.socket.emit("register", this.uuid)
        this.socket.on('offer-recv', payload => this.createAnswer(payload))
        this.socket.on('invalid-uuid', payload => this.invalidUUID(payload))
        this.socket.on('answer-recv', payload => this.setRemoteDescription(payload))
    }

    setup() {
        let config = {
            iceServers: [
                { 
                    urls: 'stun:stun1.l.google.com:19302'
                }
            ]
        }
        this.localConnection = new RTCPeerConnection(config)
        this.dataChannel = this.localConnection.createDataChannel('p2p-channel')
        this.dataChannel.onmessage = this.onMessageForDC
        this.dataChannel.onopen = this.dataChannelOpened

        this.remoteConnection = new RTCPeerConnection()
    }

    onMessageForDC(event) {
        console.log('event data', event.data)
    }

    onMessageForRemoteDC(event) {
        console.log('remote event', event.data)
    }

    dataChannelOpened(event) {
        console.log('datachannel', this.dataChannel.readyState)
        this.dataChannel.send("I hope you get this")
    }

    callButtonTapped() {
        if (this.friendsUUID && this.friendsUUID.value.length > 0) {
            let friendsUUID = this.friendsUUID.value
            this.initiateP2P(friendsUUID)
        }
    }

    initiateP2P(uuid) {
        console.log('offer created by', this.uuid, uuid)
        this.localConnection.createOffer()
        .then(offer => this.localConnection.setLocalDescription(offer))
        .then(() => this.socket.emit('offer-send', {
            targetUUID: uuid,
            myUUID: this.uuid,
            offer:this.localConnection.localDescription
        }))
    }

    createAnswer(payload) {
        let jsonPayload = JSON.parse(payload)
        if (jsonPayload.targetUUID === this.uuid) {
            console.log('answer created by', this.uuid, jsonPayload.myUUID)
            this.remoteConnection.ondatachannel = e => {
                this.remoteConnection.dc = e.channel
                this.remoteConnection.dc.onmessage = this.onMessageForRemoteDC
            }
            this.remoteConnection.setRemoteDescription(jsonPayload.offer)
            .then(() => {
                this.remoteConnection.createAnswer()
                .then(a => this.remoteConnection.setLocalDescription(a))
                .then(() => {
                    this.socket.emit('answer-send', {
                        targetUUID: jsonPayload.myUUID,
                        myUUID: this.uuid,
                        answer: this.remoteConnection.localDescription
                    })
                })
            })
        }
    }

    setRemoteDescription(payload) {
        let jsonPayload = JSON.parse(payload)
        if (jsonPayload.targetUUID === this.uuid) {
            console.log('setting remote description by', this.uuid, jsonPayload.myUUID)
            this.localConnection.setRemoteDescription(jsonPayload.answer)
            .then(() => {
                console.log('remote description set')
                console.log('datachannel state', this.dataChannel.readyState)
            })
            .catch(e => console.log(e))
        }
    }

    invalidUUID(payload) {
        if (payload.myUUID === this.uuid) {
            alert('invalid user')
        }
    }

    render() {
        return (
            <div className="home">
                <div className="left-pane">
                    <div className="brand">CatchUp</div>
                    <div className="subtitle">
                        CatchUp is an anonymous video chat solution for you to communicate with each other without worrying about companies collecting your data and spying on you.
                    </div>
                </div>
                <div className="right-pane">
                    <div className="id-title">Your ID:</div>
                    <div className="your-id">{this.uuid}</div>
                    <div className="input">
                        <TextField 
                            id="standard-basic"
                            placeholder="enter your friend's ID to connect"
                            inputRef={el => this.friendsUUID = el}
                            fullWidth
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            className='connect-button'
                            startIcon={<CallIcon />}
                            onClick={this.callButtonTapped}
                        >
                            Call
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Home
