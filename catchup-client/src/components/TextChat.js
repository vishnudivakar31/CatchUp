import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import './TextChat.css'

class TextChat extends Component {
    render() {
        return (
            <div className='text-chat'>       
                <div className='chat-header'>Chats</div>
                <div className='chat-message-display'></div>
                <div className='input-group'>
                    <TextField
                        placeholder='type message...'
                        fullWidth
                    />
                    <Button
                        color='primary'
                        variant='contained'
                        style={{ marginLeft: '2%' }}
                    >
                        Send
                    </Button>
                </div>
            </div>
        )
    }
}

export default TextChat
