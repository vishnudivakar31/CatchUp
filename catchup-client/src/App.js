import io from 'socket.io-client'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import Home from './container/Home'

const SERVER = "http://localhost:5000";
let socket = io.connect(SERVER)

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Home socket={socket} />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
