import logo from './logo.svg';
import io from 'socket.io-client'
import './App.css';

const SERVER = "http://localhost:5000";
let socket = io.connect(SERVER)

function App() {
  socket.emit("offer", "new offer")
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
