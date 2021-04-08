import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import './TextChat.css'

class TextChat extends Component {
    constructor(props) {
        super(props)
        this.formatAMPM = this.formatAMPM.bind(this)
        this.messageRef = React.createRef()
        this.state = {
            messages: []
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.addMessage = this.addMessage.bind(this) 
    }

    componentDidMount() {
        if(this.props.calledByMe) {
            if (this.props.myConnection) {
                this.props.myConnection.on('data', data => {
                    this.addMessage(data)
                })
            }
        } else {
            if(this.props.remoteConnection) {
                this.props.remoteConnection.on('data', data => {
                    this.addMessage(data)
                })
            }
        }
        this.messageRef.scrollTop = this.messageRef.scrollHeight
    }

    componentDidUpdate(_ ,prevState) {
        if(prevState !== this.state.messages && this.messageRef) {
            this.messageRef.scrollTop = this.messageRef.scrollHeight
        }
    }

    addMessage(data) {
        if(data.message_type === 'text-message') {
            let messages = this.state.messages;
            messages.push(data)
            this.setState({ messages })
        }
    }

    formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        let seconds = date.getSeconds()
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
        return strTime;
    }

    sendMessage() {
        let message = this.messageTextField ? this.messageTextField.value : ''
        if(message.length > 0) {
            let packet = {
                message_type: 'text-message',
                send: this.props.uuid,
                target: this.props.targetUUID,
                msg: message,
                time: this.formatAMPM(new Date())
            }
            if(this.props.calledByMe && this.props.myConnection) {
                this.props.myConnection.send(packet)
                this.addMessage(packet)
                this.messageTextField.value = ''
            } else if (!this.props.calledByMe && this.props.remoteConnection) {
                this.props.remoteConnection.send(packet)
                this.addMessage(packet)
                this.messageTextField.value = ''
            }
        }
    }

    render() {
        return (
            <div className='text-chat'>       
                <div className='chat-header'>Chats</div>
                <div className='chat-message-display' ref={ref => this.messageRef = ref}>
                    <div className='table-cell'>
                        {this.state.messages.map((message, index) => {
                            return (
                                <div key={index} className={`message-container ${message.send === this.props.uuid ? 'right' : 'left'}`}>
                                    <div className={`message-bubble ${message.send === this.props.uuid ? 'right' : 'left'}`}>
                                        {message.msg}
                                    </div>
                                    <div className='message-time'>
                                        {message.time}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='input-group'>
                    <TextField
                        placeholder='type message...'
                        inputRef={el => this.messageTextField = el}
                        fullWidth
                        onKeyPress={event => {
                            if(event.key === 'Enter') {
                                this.sendMessage()
                            }
                        }}
                    />
                    <Button
                        color='primary'
                        variant='contained'
                        style={{ marginLeft: '2%' }}
                        onClick={this.sendMessage}
                    >
                        Send
                    </Button>
                </div>
            </div>
        )
    }
}

export default TextChat
