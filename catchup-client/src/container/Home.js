import React, { Component } from 'react'

class Home extends Component {
    
    constructor(props) {
        super(props)
        this.socket = this.props.socket
    }

    componentDidMount() {
        this.socket.emit("register", "aabcc-fffg")
    }

    render() {
        return (
            <div>
                Home.....
            </div>
        )
    }
}

export default Home
