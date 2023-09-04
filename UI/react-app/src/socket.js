import { io } from "socket.io-client";

const URL = `${process.env.REACT_APP_API_URL}`; // Express server address
const socket = io(URL, { autoConnect: false });

// For development testing

// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });

export default socket;
