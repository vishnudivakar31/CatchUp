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
    }

    componentDidMount() {
        this.socket.emit("register", this.uuid)
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
                            fullWidth
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            className='connect-button'
                            startIcon={<CallIcon />}
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
