const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require("cors")
require('dotenv').config();

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const randomMongodbId = () => crypto.randomBytes(24).toString("hex");
const randomMessageId = () => crypto.randomBytes(24).toString("hex");
const key = 'chatgroupkey'

const Channel = require("./models/Channel");
const User = require("./models/User");
const { InMemorySessionStore } = require("./sessionStore");

const sessionStore = new InMemorySessionStore();

// import routes here. Ex: const userRoutes = require("./routes/userRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// The socket.io will use the same connection as express
const server = http.createServer(app);
const io = socketIo(server, {
	// Enable cors to allow client to communicate
	cors: {
		origin: process.env.CLIENT_URL,
	},
});


mongoose.connect(`${process.env.DB_CONNECTION_STRING}/Chat_Application?retryWrites=true&w=majority`,
		{
			useNewUrlParser : true,
			useUnifiedTopology : true
		});

let db = mongoose.connection;
let ONLINE_USERS_ID = []
let newChannelId, newMessageId

// Prints when websocket is established
io.on("connection", (socket) => {
	socket.on("user connected", (email) => {
		console.log(`${email} connected socket: ${socket.id}`);

		User.findOne({email: email}).then((res) => {
			if(res){
				socket.emit("channels joined", res.channelsJoined)

				res.channelsJoined.map((channel) => {
					socket.join(channel._id)
				})
			}
		})
	});

	socket.on("search channels", ({channel}) => {
		Channel.find({name: channel}).then((channels) => {
			socket.emit("channels found", channels)
		})
	})

	sessionStore.saveSession(socket.sessionID, {
	  userID: socket.userID,
	  username: socket.username,
	  connected: true,
	});

	socket.emit("session", {
		sessionID: socket.sessionID,
		userID: socket.userID,
	});

	socket.join(socket.userID);

	socket.on("join channel", ({_id, channel, userID}) => {
		User.findOne({email: userID}).then((res) => {
			if(res.channelsJoined.some((item) => { return item._id == _id })){
				return socket.emit("already joined")
			} else {
				socket.join(_id);
				

				Channel.findOneAndUpdate({_id: _id}, { $push: { members: { email: userID } } }).then((res) => {
					console.log(res)
				})

				User.findOneAndUpdate({email: userID}, { $push: { channelsJoined: {_id: _id, name: channel } } }).then((item) => {
					socket.emit("channels joined", [...res.channelsJoined, {_id: _id, name: channel}])
				})
			}
		})
	})

	socket.on("create channel", ({channel, description, userID}) => {	
		newChannelId = randomMongodbId();
		let newChannel = new Channel({
			_id: newChannelId,
			name: channel,
			description: description,
			members: [],
			messages: []
		})

		newChannel.save().then((res) => {
			console.log(res)
		})

		socket.emit("user joined channel", {_id: newChannelId, name: channel})
		User.findOneAndUpdate({email: userID}, { $push: { channelsJoined: {_id: newChannelId, name: channel } } }).then((res) => {
			console.log(res)
		})

		Channel.findOneAndUpdate({_id: newChannelId}, { $push: { members: { email: userID } } }).then((res) => {
			console.log(res)
		})

		socket.join(newChannelId);
	})

	socket.on("get channel message", (channel) => {
		Channel.findOne({_id: channel}, { messages: { $slice: -15 } } ).then((res) => {
			console.log(res)
			socket.emit("channel messages" , {id: channel, messages: res.messages})
		})
	})	

	socket.on("send message", ({content, to, from}) => {
		newMessageId = randomMessageId();

		console.log({content, to, from})
		socket.to(to).emit("broadcasted message", {content: content, from: from, to: to, id: newMessageId});
		socket.emit("broadcasted message", {content: content, from: from, to: to, id: newMessageId})

		Channel.findOneAndUpdate({_id: to}, { $push: { messages: { message: content, from: from, _id: newMessageId} } }).then((res) => {
			console.log(res)
		})
	})

	socket.on("delete message", ({id, channel, from}) => {
		console.log(`${id} ${channel} ${from}`)
		Channel.findOne({_id: channel}, { messages: { $slice: -15 } } ).then((channelDetails) => {
			channelDetails.messages.forEach((message) => {
				if(message._id == id){
					message.message = "message-unsent-system-deleted"			
				}
			})

			channelDetails.markModified('messages')
			channelDetails.save();
					
			socket.to(channel).emit("channel messages" , {id: channel, messages: channelDetails.messages})
			socket.emit("channel messages" , {id: channel, messages: channelDetails.messages})
		})
	})


	socket.on("disconnect", () => {
	  console.log(`${socket.userID} disconnected`);
	});

});


io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  // if (sessionID) {
  //   // find existing session
  //   const session = sessionStore.findSession(sessionID);
  //   if (session) {
  //     socket.sessionID = sessionID;
  //     socket.userID = session.userID;
  //     console.log(`session ID found ${socket.sessionID} userID: ${socket.userID}`)
  //     return next();
  //   }
  // }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = sessionID;
  socket.userID = username;
  
  console.log(`new session ID ${socket.sessionID}`)
  next();
});

db.on('error', console.error.bind(console, "MongoDB connection Error"))
db.once('open', () => console.log('Now connected to MongoDB Atlas!'))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Use routes here. Ex: app.use("/users", userRoutes)
app.use("/users", userRoutes)

server.listen(process.env.PORT || 4000, () => {
	console.log(`API is now online on port ${process.env.PORT || 4000}`)
})


