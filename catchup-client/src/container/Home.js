import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CallIcon from '@material-ui/icons/Call'
import Modal from '@material-ui/core/Modal'
import Ringtone from '../sound/ringtone_minimal.wav'
import Alert from '@material-ui/lab/Alert'
import { withRouter } from 'react-router-dom'

import "./Home.css"

class Home extends Component {
    
    constructor(props) {
        super(props)
        this.peer = this.props.peer
        this.uuid = this.props.uuid
        this.myConnection = this.props.myConnection
        this.remoteConnection = this.props.remoteConnection
        this.setRemoteConnection = this.props.setRemoteConnection
        this.setMyConnection = this.props.setMyConnection
        this.callButtonTapped = this.callButtonTapped.bind(this)
        this.showCallingModal = this.showCallingModal.bind(this)
        this.showCallRejectedAlert = this.showCallRejectedAlert.bind(this)
        this.showConnectingModal = this.showConnectingModal.bind(this)
        this.acceptCall = this.acceptCall.bind(this)
        this.state = {
            calling: false,
            calling_from: '',
            call_rejected: false,
            connecting: false,
            callerID: ''
        }
        this.ringtone = new Audio(Ringtone)
        this.ringtone.loop = true
    }

    componentDidMount() {
        this.peer.on('open', id => {
            console.log('myID', id)
        })
        this.peer.on('error', e => console.log(e))
        this.peer.on('connection', remoteConn => {
            remoteConn.on('open', () => {
                this.props.setRemoteConnection(remoteConn)
                remoteConn.on('data', data => {
                    if (data.message_type && data.message_type === 'calling') {
                        this.setState({
                            calling: true,
                            calling_from: `${data.userID} is calling you.`,
                            callerID: `${data.userID}`
                        })
                    }
                })
            })
        })
    }

    componentDidUpdate(_, prevState) {
        if (this.state.calling !== prevState.calling) {
            if (!this.state.calling) {
                if(this.props.remoteConnection) {
                    this.props.remoteConnection.send({
                        message_type: 'call-declined'
                    })
                }
                this.ringtone.pause()
            } else {
                this.ringtone.play()
            }
        }
    }

    componentWillUnmount() {
        this.ringtone.remove()
    }

    acceptCall() {
        this.props.setTargetUUID(this.state.callerID)
        this.props.setCalledByMe(false)
        if (this.props.remoteConnection) {
            this.props.remoteConnection.send({
                message_type: 'call-accepted'
            })
            this.props.history.push('/chat')
            this.ringtone.pause()
        }
    }

    callButtonTapped() {
        if (this.friendsUUID && this.friendsUUID.value.length > 0) {
            let uuid = this.friendsUUID.value
            let conn = this.peer.connect(uuid)
            this.props.setCalledByMe(true)
            conn.on('open', () => {
                this.setMyConnection(conn)
                this.props.setTargetUUID(uuid)
                conn.send({
                    message_type: 'calling',
                    userID: this.uuid
                })
                conn.on('data', data => {
                    if (data.message_type && data.message_type === 'call-declined') {
                        this.setState({
                            call_rejected: true,
                            connecting: false
                        })
                    } else if (data.message_type && data.message_type === 'call-accepted') {
                        this.props.history.push('/chat')
                    }
                })
                this.setState({ connecting: true })
            })
            conn.on('error', e => {
                console.log(e)
            })
        }
    }

    showCallingModal() {
        return (
            <Modal
                open={this.state.calling}
                disableBackdropClick={false}
            >
                <div className='calling_card'>
                    <p>{this.state.calling_from}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10%' }}>
                        <Button
                            color='secondary'
                            onClick={() => this.setState({
                                calling: false,
                                calling_from: ''
                            })}
                        >
                            Reject
                        </Button>
                        <Button
                            color='primary'
                            variant='contained'
                            style={{ marginLeft: '2%' }}
                            onClick={this.acceptCall}
                        >
                            Accept
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    showCallRejectedAlert() {
        return (
            <div style={{ display: this.state.call_rejected ? 'block' : 'none' }} className='alert-dialog'>
                <Alert
                    severity='warning'
                    onClose={() => this.setState({ call_rejected: false })}
                >
                    Call rejected. User is busy. Try again later.
                </Alert>
            </div>
        )
    }

    showConnectingModal() {
        return (
            <div style={{ display: this.state.connecting ? 'block' : 'none' }} className='alert-dialog'>
                <Alert
                    severity='info'
                >
                    Trying to connect with user. Please be patient.
                </Alert>
            </div>
        )
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
                {this.showCallingModal()}
                {this.showCallRejectedAlert()}
                {this.showConnectingModal()}
            </div>
        )
    }
}

export default withRouter(Home)
