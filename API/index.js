const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require("cors")
require('dotenv').config();

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
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


// Prints when websocket is established
io.on("connection", (socket) => {
	socket.on("user connected", (email) => {
		console.log(`${email} connected socket: ${socket.id}`);

		User.findOne({email: email}).then((res) => {
			if(res){
				socket.emit("channels joined", res.channelsJoined)

				res.channelsJoined.map((channel) => {
					socket.join(channel.name)
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

	socket.on("join channel", ({channel, userID}) => {
		User.findOne({email: userID}).then((res) => {
			if(res.channelsJoined.some((item) => { return item.name == channel })){
				return socket.emit("already joined")
			} else {
				socket.join(channel);
				socket.emit("user joined channel", channel)

				Channel.findOneAndUpdate({name: channel}, { $push: { members: { email: userID } } }).then((res) => {
					console.log(res)
				})

				User.findOneAndUpdate({email: userID}, { $push: { channelsJoined: { name: channel } } }).then((res) => {
					console.log(res)
				})
			}
		})
	})

	socket.on("create channel", ({channel, userID}) => {	

		let newChannel = new Channel({
			name: channel,
			members: [],
			messages: []
		})

		newChannel.save().then((res) => {
			console.log(res)
		})
	})

	socket.on("get channel message", (channel) => {
		Channel.findOne({name: channel}, { messages: { $slice: -15 } } ).then((res) => {
			console.log(res)
			socket.emit("channel messages" , res.messages)
		})
	})	

	socket.on("send message", ({content, to, from}) => {
		console.log({content, to, from})
		socket.to(to).emit("broadcasted message", {content, from, to});
		socket.emit("broadcasted message", {content, from, to})

		Channel.findOneAndUpdate({name: to}, { $push: { messages: { message: content, from: from} } }).then((res) => {
			console.log(res)
		})
	})

	socket.on("delete message", ({id, channel, from}) => {
		console.log(`${id} ${channel} ${from}`)
		Channel.findOne({name: channel}, { messages: { $slice: -15 } } ).then((channelDetails) => {
			channelDetails.messages.forEach((message) => {
				if(message.id == id){
					message.message = "message-unsent-system-deleted"
					channelDetails.save().then((res) => {
						console.log(res)
					})
				}
			})
			
			socket.to(channel).emit("channel messages" , channelDetails.messages)
			socket.emit("channel messages" , channelDetails.messages)
		})
	})


	socket.on("disconnect", () => {
	  console.log(`${socket.userID} disconnected`);
	});

});


io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      console.log(`session ID found ${socket.sessionID} userID: ${socket.userID}`)
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  // create new session
  socket.sessionID = randomId();
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


