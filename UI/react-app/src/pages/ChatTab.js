import {useEffect, useState, useContext} from 'react'
import {Container, Card, Button, Form} from 'react-bootstrap';
import socket from "../socket";

export default function ChatTab(){
	const [message, setMessage] = useState('');
	const [target, setTarget] = useState('');
	const [channel, setChannel] = useState('');
	const [messageReceived, setMessageReceived] = useState([]);	
	const [channelMessage, setChannelMessage] = useState([]);	
	const [onlineUsers, setOnlineUsers] = useState([]);
	function sendMessage(e){
		e.preventDefault();
		socket.emit("private message", {content: message, to: target, from: socket.userID});		
	}

	function joinChannel(e){
		socket.emit("join channel", {channel: channel, userID: socket.userID});
		setChannel('')
	}

	socket.on("private message", (message) => {
		setMessageReceived([...messageReceived, <Form.Label>{`${message.content} - ${message.from}`}</Form.Label>]);
	})

	socket.on("user joined channel", (online_users) => {
		setOnlineUsers(online_users.map((user) => {
			if(user !== null){
				return (
				<Form className="my-1">
					<Form.Label className="mt-1 col-xl-6">{user}</Form.Label>
					<Button className="mt-1 col-xl-6" className={'btn-danger'}>Leave</Button>
				</Form>
				)
			}
		}));
	})

	return(
		<Container>
			<Container className={'row'}>
				<Card className={'mt-5 col-xl-6'}>
					{messageReceived}
				</Card>
				<Card className={'mt-5 col-xl-6'}>
					<Form className="my-3">
						<Form.Control className="mt-1" type="email" value={message} placeholder="Compose message" onChange={e => setMessage(e.target.value)}></Form.Control>
						<Form.Control className="mt-1" type="text" placeholder="Send to (email)" value={target} onChange={e => setTarget(e.target.value)}></Form.Control>
						<Button className="mt-1" onClick={(e) => sendMessage(e)}>Send</Button>
					</Form>
				</Card>
				<Card className={'mt-5 col-xl-6'}>
					<Form className="my-3">					
						<Form.Control type="text" placeholder="Join channel" value={channel} onChange={e => setChannel(e.target.value)}></Form.Control>
						<Button className="mt-3" onClick={(e) => joinChannel(e)}>Join</Button>
					</Form>
				</Card>
				<Card className={'mt-5 col-xl-6'}>
					{onlineUsers}
				</Card>
			</Container>
		</Container>
	)
}