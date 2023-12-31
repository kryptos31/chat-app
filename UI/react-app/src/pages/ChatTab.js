import {useEffect, useState, useContext, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {Container, Card, Button, Form, Nav, Navbar, Offcanvas, Modal} from 'react-bootstrap';

import socket from "../socket";
import UserContext from '../UserContext';
import Login from './Login'


export default function ChatTab(){
	const [message, setMessage] = useState('');
	const [channel, setChannel] = useState('');
	const [messageReceived, setMessageReceived] = useState([]);	
	const [channelMessage, setChannelMessage] = useState([]);	
	const [channelList, setChannelList] = useState([]);
	const [selectedChannelID, setSelectedChannelID] = useState('');
	const [selectedChannelName, setSelectedChannelName] = useState('');

	const [createChannelName, setCreateChannelName] = useState('')
	const [createChannelDesc, setCreateChannelDesc] = useState('')
	let channelShown = ''
	const divRef = useRef(null);
	const inputRef = useRef(null);
	const navigate = useNavigate()
	const {user, setUser, unsetUser} = useContext(UserContext);


	const [showOffcanvas, setShowOffcanvas] = useState(false);
    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => {
		setShowModal(false);
		setCreateChannelName('')
		setCreateChannelDesc('')
	}
    const handleShowModal = () => setShowModal(true);

	useEffect(() => {
		if(user.id == null || user.id == undefined){
			return
		}
		divRef.current.scrollIntoView({ behavior: 'smooth' });
	});

	useEffect(() => {
		if(channel == ''){
			socket.emit("user connected", socket.userID)
			selectChannelToShow(1, 'WELCOME')
		}
	}, [channel])

	function createChannel(e){
		socket.emit("create channel", {channel: createChannelName, description: createChannelDesc, userID: socket.userID})
		setCreateChannelName('')
		setCreateChannelDesc('')
		handleCloseModal();
		handleCloseOffcanvas();
	}

	function joinChannel(channelID, channelName){
		socket.emit("join channel", {_id: channelID, channel: channelName, userID: socket.userID});
		setChannel('')
		handleCloseOffcanvas();
	}

	function selectChannelToShow(channelID, channelName){
		socket.emit("get channel message", channelID);
		setSelectedChannelID(channelID)
		setSelectedChannelName(channelName)
		channelShown = channelID;
		handleCloseOffcanvas();		
	}

	function sendMessagePress() {
		if(message == ''){
			return
		}
		socket.emit("send message", {content: message, to: selectedChannelID, from: socket.userID});
		setMessage('')
		inputRef.current.focus()
	}

	let sendMessage = (event) => {
		if(message == ''){
			return
		}
		if(event.key === 'Enter'){	    
			socket.emit("send message", {content: message, to: selectedChannelID, from: socket.userID});
			setMessage('')
			inputRef.current.focus()
		}
	}

	function searchChannelPress(){
		socket.emit("search channels" , {channel})
	}

	function searchChannel(event){
		if(event.key === 'Enter'){
			socket.emit("search channels" , {channel})
		}
	}

	function deleteMessage(channelID, messageID){
		socket.emit("delete message", {id: messageID, channel: channelID, from: socket.userID});
	}

	function logout(){
		unsetUser();
		setUser({
			id: null,
			isAdmin: null
		});
		socket.disconnect();
	}

	socket.on("already joined", () => {
		console.log('already joined channel')
	})

	socket.on("broadcasted message", (message) => {		
		if(channelShown == message.to){
			socket.userID == message.from ? 
			setMessageReceived(messageReceived => [...messageReceived, 
				<div key={message.id} className="from-user">
					<div id="delete-message">
						<svg onClick={(e) => {deleteMessage(message.to, message.id)}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgba(181, 17, 17, 0.6666666666666666)" d="M3.94 5L2.22 3.28a.75.75 0 1 1 1.06-1.06l18.5 18.5a.75.75 0 0 1-1.06 1.06l-2.19-2.19A3.751 3.751 0 0 1 15.025 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5h1.19ZM15 16.06l-1.5-1.5v2.69a.75.75 0 0 0 1.5 0v-1.19Zm-4.5-4.5L9 10.06v7.19a.75.75 0 0 0 1.5 0v-5.69ZM15 9.75v2.069l4.026 4.026l.905-9.345h1.319a.75.75 0 0 0 0-1.5H15.5a3.5 3.5 0 1 0-7 0h-.318l5.318 5.319V9.75a.75.75 0 0 1 1.5 0ZM14 5h-4a2 2 0 1 1 4 0Z"/></svg>
					</div>
					<div className={'mx-2 my-1 p-2 px-3 message-card'}>{message.content}</div>
				</div>])
			:
			setMessageReceived(messageReceived => [...messageReceived, 
				<div key={message.id}>
					<div className={'mx-2 my-1 p-2 px-3 message-card'}>{message.content}</div>
				</div>])
		}
	})

	socket.on("user joined channel", (channel) => {
		setChannelList([...channelList, <h5 className={'py-2'} key={channel._id} onClick={e => selectChannelToShow(channel._id, channel.name)}>{channel.name}</h5> ])		
	})

	socket.on("channels joined", (channelsArray) => {
		setChannelList(
			channelsArray.map((channelFromArray) => {				
				return(
					<h5 className={'py-2'} key={channelFromArray._id} onClick={e => selectChannelToShow(channelFromArray._id, channelFromArray.name)}>{channelFromArray.name}</h5>
				)
			})
		)
	})

	socket.on("channels found", (channels) => {
		setChannelList(
			channels.map((channel) => {
				return(
					<h5 className={'py-2'} key={channel._id} >{channel.name}<Button onClick={e => {joinChannel(channel._id, channel.name)}}>Join</Button></h5>
				)
			})
		)
	})

	socket.on("channel messages" , ({id, messages}) => {
		setMessageReceived(
			messages.map((item) => {
				return (
					socket.userID == item.from ? 
						<div key={item._id} className="from-user">
							<div id="delete-message">
								<svg onClick={(e) => {deleteMessage(id, item._id)}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="rgba(181, 17, 17, 0.6666666666666666)" d="M3.94 5L2.22 3.28a.75.75 0 1 1 1.06-1.06l18.5 18.5a.75.75 0 0 1-1.06 1.06l-2.19-2.19A3.751 3.751 0 0 1 15.025 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5h1.19ZM15 16.06l-1.5-1.5v2.69a.75.75 0 0 0 1.5 0v-1.19Zm-4.5-4.5L9 10.06v7.19a.75.75 0 0 0 1.5 0v-5.69ZM15 9.75v2.069l4.026 4.026l.905-9.345h1.319a.75.75 0 0 0 0-1.5H15.5a3.5 3.5 0 1 0-7 0h-.318l5.318 5.319V9.75a.75.75 0 0 1 1.5 0ZM14 5h-4a2 2 0 1 1 4 0Z"/></svg>
							</div>
							{
								item.message == "message-unsent-system-deleted" ?
								<div className={'mx-2 my-1 p-2 px-3 message-card deleted-message'}>You unsent a message</div>
								:
								<div className={'mx-2 my-1 p-2 px-3 message-card'}>{item.message}</div>
							}
						</div>
					:
						<div key={item._id}>
						{	
							item.message == "message-unsent-system-deleted" ?
							<div className={'mx-2 my-1 p-2 px-3 message-card deleted-message'}>{`${item.from} unsent a message`}</div>
							:
							<div className={'mx-2 my-1 p-2 px-3 message-card'}>{item.message}</div>
						}
						</div>
				)
			})
		)
	})

	return(
		user.id != null || user.id != undefined
		?
		<>
			<Modal size='md' show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} centered>
				<Modal.Header style={{color: 'white'}} >
					<Modal.Title>NEW CHANNEL</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<input type="text" className="search-input" style={{width: '100%'}} placeholder="Channel name" value={createChannelName} onChange={e => setCreateChannelName(e.target.value)} ></input>
					<textarea className="search-input mt-3" rows="4" style={{width: '100%'}} placeholder="Description" value={createChannelDesc} onChange={e => setCreateChannelDesc(e.target.value)} ></textarea>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-success" onClick={e => {createChannel(e)}}>Create</Button>
					<Button variant="outline-danger" onClick={handleCloseModal}>
					Discard Changes
					</Button>
				</Modal.Footer>
			</Modal>
			<div className="row chat-window">
				<Navbar fixed="top" expand="lg col-12 col-lg-8 offset-lg-4">
	                <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-lg-none mx-3" onClick={handleShowOffcanvas} />
	                <Nav className="col-9 col-sm-10 col-md-10 col-lg-8">
	                    <Nav.Item className="mx-3">
	                    	<Nav.Item><h5>{selectedChannelName}</h5></Nav.Item>
	                    </Nav.Item>
	                </Nav>
	            </Navbar>
	            <Offcanvas id="sidebar" show={showOffcanvas} onHide={handleCloseOffcanvas} responsive="lg" className="col-lg-4 sidebar">
	                <Offcanvas.Header className="d-flex">
	                	<Offcanvas.Title>Channels</Offcanvas.Title>
	                	<button className="create-channel-btn" onClick={(e) => handleShowModal()}>
                    		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    		<path d="M16 10H10V16H6V10H0V6H6V0H10V6H16V10Z" fill="white"/>
                    		</svg>
                    	</button>
	                </Offcanvas.Header>
	                <Offcanvas.Body className="flex-column px-3">
	                	<div className="search-bar">
	                   		<input type="text" onKeyPress={searchChannel} className="search-input" placeholder="Search" value={channel} onChange={e => setChannel(e.target.value)}></input>
	                   		<svg xmlns="http://www.w3.org/2000/svg" onClick={e => {searchChannelPress()}} width="24" height="24" viewBox="0 0 24 24" fill="none">
	                   		<path d="M21.6 22L15.3 15.7C14.8 16.1 14.225 16.4167 13.575 16.65C12.925 16.8833 12.2333 17 11.5 17C9.68333 17 8.146 16.3707 6.888 15.112C5.63 13.8533 5.00067 12.316 5 10.5C5 8.68333 5.62933 7.146 6.888 5.888C8.14667 4.63 9.684 4.00067 11.5 4C13.3167 4 14.854 4.62933 16.112 5.888C17.37 7.14667 17.9993 8.684 18 10.5C18 11.2333 17.8833 11.925 17.65 12.575C17.4167 13.225 17.1 13.8 16.7 14.3L23 20.6L21.6 22ZM11.5 15C12.75 15 13.8127 14.5623 14.688 13.687C15.5633 12.8117 16.0007 11.7493 16 10.5C16 9.25 15.5623 8.18733 14.687 7.312C13.8117 6.43667 12.7493 5.99933 11.5 6C10.25 6 9.18733 6.43767 8.312 7.313C7.43667 8.18833 6.99933 9.25067 7 10.5C7 11.75 7.43767 12.8127 8.313 13.688C9.18833 14.5633 10.2507 15.0007 11.5 15Z" fill="white"/>
	                   		</svg>
                   		</div>
	                    <div className="mt-5 channels-container">
	                   		{channelList}
	                    </div>
	                    <div className="my-2">
	                    	<div onClick={e => {logout()}} >Logout</div>
	                    </div>
	                </Offcanvas.Body>
	            </Offcanvas>
				<div className="py-2 col-12 col-lg-8 chat-container">
					<div className="col-xl-12 mt-5">
						<div className="message-container mb-3">
							{messageReceived}
							<div ref={divRef} />
						</div>
					</div>
					{
						selectedChannelID != 1 ?
						<div className="mb-5 message-bar">
							<input onKeyPress={sendMessage} className="message-input" ref={inputRef} type="text" value={message} placeholder="Type a message here" onChange={e => setMessage(e.target.value)}></input>
							<svg className="message-arrow" onClick={e => {sendMessagePress()}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M3 20V14L11 12L3 10V4L22 12L3 20Z" fill="white"/>
							</svg>
						</div>
						:
						<div />
					}
					
				</div>
			</div>
		</>
		:
		navigate('/')
	)
}