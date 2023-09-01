import {useEffect, useState, useContext} from 'react'
import {Container, Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import Swal2 from 'sweetalert2'
import socket from "../socket";

import UserContext from '../UserContext';

export default function Login() {

	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const {user, setUser} = useContext(UserContext);

	const newSession = () => {

	}

	const retrieveUserDetails = (token) => {
		fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
		.then(response => response.json())
		.then(data => {
			setUser({
				id: data._id,
				isAdmin: data.isAdmin
			})
		})
	}

	function login(e) {
		e.preventDefault();

		fetch(`${process.env.REACT_APP_API_URL}/users/login` , {
			method: 'POST',
			headers: {
				'Content-type' : 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
		.then(response => response.json())
		.then(data => {
			if(data === false){
				Swal2.fire({
					title: 'Login unsuccessful',
					icon: 'error',
					text: 'Check your login credentials and try again'
				})
			} else {
				localStorage.setItem('token', data.access)
				retrieveUserDetails(data.access)

				Swal2.fire({
					title: 'Login successful',
					icon: 'success'
				})
				socket.auth = { username: email }
				socket.connect();
				socket.emit("user connected", email);

				socket.on("user connected", (message) => {
					console.log(message)
				});
				
				socket.on("session", ({ sessionID, userID }) => {
				  // attach the session ID to the next reconnection attempts
				  socket.auth = { sessionID };
				  // store it in the localStorage
				  localStorage.setItem("sessionID", sessionID);
				  // save the ID of the user
				  socket.userID = userID;
				});

				navigate('/chat')
			}
		})
	}

	return(
		<Container>
			<Card className={'mt-5'}>
				<Form className={'px-1 col-xl-6'}>
					<Form.Control className={'my-1 col-xl-6'} placeholder="Enter email" type="email" value={email} onChange={e => setEmail(e.target.value)}></Form.Control>
					<Form.Control className={'my-1 col-xl-6'} placeholder="Enter password" type="password" value={password} onChange={e => setPassword(e.target.value)}></Form.Control>
					<Button className={'my-1 col-xl-6'} onClick={(e) => login(e)}>Submit</Button>
				</Form>
			</Card>
		</Container>
	)
}