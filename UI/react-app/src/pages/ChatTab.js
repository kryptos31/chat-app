import {useEffect, useState, useContext, useRef} from 'react'
import {Container, Card, Button, Form, Nav, Navbar, Offcanvas} from 'react-bootstrap';
import socket from "../socket";


export default function ChatTab(){
	const [message, setMessage] = useState('');
	const [channel, setChannel] = useState('');
	const [messageReceived, setMessageReceived] = useState([]);	
	const [channelMessage, setChannelMessage] = useState([]);	
	const [channelList, setChannelList] = useState([]);
	const [selectedChannelID, setSelectedChannelID] = useState('');
	let channelShown = ''
	const divRef = useRef(null);
	const inputRef = useRef(null);


	const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

	useEffect(() => {
		divRef.current.scrollIntoView({ behavior: 'smooth' });
	});

	function sendMessage(e){
		e.preventDefault();
		socket.emit("send message", {content: message, to: selectedChannelID, from: socket.userID});
		setMessage('')
		inputRef.current.focus()
	}

	function createChannel(e){
		socket.emit("create channel", {channel: channel, userID: socket.userID})
		setChannel('')
		handleClose();
	}

	function joinChannel(e){
		socket.emit("join channel", {channel: channel, userID: socket.userID});
		setChannel('')
		handleClose();
	}

	function selectChannelToShow(channel){
		socket.emit("get channel message", channel);
		setSelectedChannelID(channel)
		channelShown = channel;
		handleClose();
	}

	socket.on("already joined", () => {
		console.log('already joined channel')
	})

	socket.on("broadcasted message", (message) => {
		if(channelShown == message.to){
			

			socket.userID == message.from ? 
			setMessageReceived(messageReceived => [...messageReceived, 
				<div className="from-user">
					<div className={'mx-2 my-1 p-2 px-3 message-card'}>{message.content}</div>
				</div>])
			:
			setMessageReceived(messageReceived => [...messageReceived, 
				<div>
					<div className={'mx-2 my-1 p-2 px-3 message-card'}>{message.content}</div>
				</div>])
		}
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
					socket.userID == item.from ? 
						<div className="from-user">
							<div className={'mx-2 my-1 p-2 px-3 message-card'}>{item.message}</div>
						</div>
					:
						<div>
							<div className={'mx-2 my-1 p-2 px-3 message-card'}>{item.message}</div>
						</div>
				)
			})
		)
	})

	return(
		<>
			<div className={'row'}>
				<Navbar expand="lg" className="bg-body-tertiary">
	                <Container className="col-2 col-sm-2 col-md-1 col-lg-4">
	                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-lg-none" onClick={handleShow} />
	                    <Nav className="d-none d-lg-block">
	                        <Nav.Item >
	                        	<Nav.Link>Channels</Nav.Link>
	                        </Nav.Item>
	                    </Nav>
	                </Container>
	                <Nav className="justify-content-left col-10 col-sm-10 col-md-11 col-lg-8">
	                    <Nav.Item className="mx-3">
	                    	<Nav.Link>{selectedChannelID}</Nav.Link>
	                    </Nav.Item>
	                </Nav>
	            </Navbar>
	            <Offcanvas show={show} onHide={handleClose} responsive="lg" className="col-lg-4 channels-container">
	                <Offcanvas.Header closeButton>
	                	<Offcanvas.Title>Channels</Offcanvas.Title>
	                </Offcanvas.Header>
	                <Offcanvas.Body className="flex-column">
		                <Card>
		                   	<Form className="p-3">					
		                   		<Form.Control type="text" placeholder="Join channel" value={channel} onChange={e => setChannel(e.target.value)}></Form.Control>
		                   		<Button className="mt-3" onClick={(e) => joinChannel(e)}>Join</Button>
		                   		<Button className="mt-3" onClick={(e) => createChannel(e)}>Create</Button>
		                   	</Form>
		                </Card>
	                   
	                    <Card className={'mt-2 p-1'} style={{height: "70vh", overflowY: 'auto'}}>
	                   		{channelList}
	                    </Card>
	                </Offcanvas.Body>
	            </Offcanvas>
				<Card className={'py-2 col-12 col-lg-8'}>
					<Card className={'col-xl-12 p-3'}>
						<div className={'mt-3'} style={{height: "50vh", overflowY: 'auto'}}>
							{messageReceived}
							<div ref={divRef} />
						</div>
					</Card>
					<Card className={'mt-5 col-xl-12'}>
						<Form className="p-3">
							<Form.Control className="mt-1" ref={inputRef} type="email" value={message} placeholder="Compose message" onChange={e => setMessage(e.target.value)}></Form.Control>
							<Button className="mt-1" onClick={(e) => sendMessage(e)}>Send</Button>
						</Form>
					</Card>
				</Card>
			</div>
		</>
	)
}