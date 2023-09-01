const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const mongoose = require('mongoose');
const cors = require("cors")
require('dotenv').config();

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

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
		origin: "http://localhost:3000",
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
	socket.on("user connected", (message) => {
		console.log(`${message} connected socket: ${socket.id}`);
		
	});

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
		socket.join(channel);
		ONLINE_USERS_ID.push(userID)
		socket.to(channel).emit("user joined channel", ONLINE_USERS_ID);
		socket.emit("user joined channel", ONLINE_USERS_ID)
	})


	socket.on("channel message", ({content, to, from}) => {
		socket.to(to).emit("channel message", {content, from});
	})

	socket.on("disconnect", () => {
	  console.log(`${socket.userID} disconnected`);
	  ONLINE_USERS_ID.pop(socket.userID)
	});

	socket.on("private message", ({content, to, from}) => {
		console.log({content, to, from})
		socket.to(to).emit("private message", {content, from});
		socket.emit("private message", {content, from})
	})

	socket.on("sent message", (content) => {
		console.log(content)
		socket.emit("sent message", "message sent from server")
	})
});


io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
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
  socket.username = username;
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


