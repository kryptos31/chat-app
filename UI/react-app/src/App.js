import { useState, useEffect } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {Container} from 'react-bootstrap'
import {UserProvider} from './UserContext';

import Login from './pages/Login'
import ChatTab from './pages/ChatTab'

import socket from "./socket";



function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null
  });

  const unsetUser = () => {
    localStorage.clear();
  }
  
  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");
    console.log(sessionID)
    if (sessionID) {
      console.log('reconnected')
      socket.auth = { sessionID };
      socket.connect();

      socket.on("session", ({ sessionID, userID }) => {
        // attach the session ID to the next reconnection attempts
        socket.auth = { sessionID };
        // store it in the localStorage
        localStorage.setItem("sessionID", sessionID);
        // save the ID of the user
        socket.userID = userID;

        socket.emit("user connected", userID);
      });

    }
  }, [])

  return (
    <UserProvider value = {{user, setUser, unsetUser}}>
      <BrowserRouter>        
        <Container fluid>  
          <Routes>
            <Route path='/' element = {<Login/>} />
            <Route path='/chat' element={<ChatTab/>} />
          </Routes>
        </Container>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
