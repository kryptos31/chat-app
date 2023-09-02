import {useEffect, useState, useContext} from 'react'
import {Container, Card, Button, Form} from 'react-bootstrap';
import socket from "../socket";

export default function ChatTab(){
	const [message, setMessage] = useState('');
	const [channel, setChannel] = useState('');
	const [messageReceived, setMessageReceived] = useState([]);	
	const [channelMessage, setChannelMessage] = useState([]);	
	const [channelList, setChannelList] = useState([]);
	const [selectedChannelID, setSelectedChannelID] = useState([]);
	function sendMessage(e){
		e.preventDefault();
		socket.emit("private message", {content: message, to: selectedChannelID, from: socket.userID});
		setMessage('')	
	}

	function createChannel(e){
		socket.emit("create channel", {channel: channel, userID: socket.userID})
		setChannel('')
	}

	function joinChannel(e){
		socket.emit("join channel", {channel: channel, userID: socket.userID});
		setChannel('')
	}

	function selectChannelToShow(channel){
		socket.emit("check channel message", channel);
		setSelectedChannelID(channel)
	}
	socket.on("already joined", () => {
		console.log('already joined channel')
	})

	socket.on("private message", (message) => {
		setMessageReceived([...messageReceived, <Form.Label className={'mx-2 my-1'}>{`${message.content} - ${message.from}`}</Form.Label>]);
	})

	socket.on("user joined channel", (channel) => {
		setChannelList([...channelList, <Card className={'p-2'} key={channel} onClick={e => selectChannelToShow(channel)}>{channel}</Card> ])		
	})

	socket.on("channels joined", (channelsArray) => {
		setChannelList(
			channelsArray.map((channelFromArray) => {
				return(
					<Card className={'p-2'} key={channelFromArray.name} onClick={e => selectChannelToShow(channelFromArray.name)}>{channelFromArray.name}</Card>
				)
			})
		)
	})

	socket.on("channel messages" , (messages) => {
		setMessageReceived(
			messages.map((item) => {
				return (
					<Form.Label className={'mx-2 my-1'}>{`${item.message} - ${item.from}`}</Form.Label>
				)
			})
		)
	})

	return(
		<Container>
			<Container className={'row'}>
				<Card className={'py-2 mt-5 col-xl-4'}>
					<Card>
						<Form className="p-3">					
							<Form.Control type="text" placeholder="Join channel" value={channel} onChange={e => setChannel(e.target.value)}></Form.Control>
							<Button className="mt-3" onClick={(e) => joinChannel(e)}>Join</Button>
							<Button className="mt-3" onClick={(e) => createChannel(e)}>Create</Button>
						</Form>
					</Card>
					<Card className={'mt-5 p-1'}>
						<Form.Control className={'col-xl-12'} type="text" readOnly value="Channels"></Form.Control>
					</Card>
					<Card className={'mt-2 p-1'}>
						{channelList}
					</Card>
				</Card>
				<Card className={'py-2 mt-5 col-xl-7 offset-xl-1'}>
					<Card className={'col-xl-12 p-3'}>
						<Form.Control type="text" readOnly value={`Messages - ${selectedChannelID}`}></Form.Control>
						<Card className={'mt-3'}>
							{messageReceived}
						</Card>
					</Card>
					<Card className={'mt-5 col-xl-12'}>
						<Form className="p-3">
							<Form.Control className="mt-1" type="email" value={message} placeholder="Compose message" onChange={e => setMessage(e.target.value)}></Form.Control>
							<Button className="mt-1" onClick={(e) => sendMessage(e)}>Send</Button>
						</Form>
					</Card>
				</Card>
			</Container>
		</Container>
	)
}