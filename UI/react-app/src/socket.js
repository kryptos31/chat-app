import { io } from "socket.io-client";

const URL = "http://localhost:4000"; // Express server address
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
