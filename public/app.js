// List bar display toggle
let uwindow = document.querySelector(".user-window");

function show_hide() {
  if (uwindow.style.display === "none") {
    uwindow.style.display = "block";
  } else {
    uwindow.style.display = "none";
  }
}




  //chatWindow.scrollTop = chatWindow.scrollHeight;

// main.js

const messageBox = document.querySelector("#chat");
const textBox = document.querySelector("input");
const sendButton = document.querySelector("button");


// Function to scroll the chat to the bottom
function scrollToBottom() {
  const chatWindow = document.querySelector("#chat");
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createMessage(text, ownMessage = false) {
  const messageElement = document.createElement("div");
  messageElement.className = "chat-message";
  const subMesssageElement = document.createElement("div");
  subMesssageElement.className =
    "messenger incoming";
  if (ownMessage) {
    subMesssageElement.className += " messenger outgoing";
  }
  subMesssageElement.innerText = text;
  messageElement.appendChild(subMesssageElement);

  messageBox.appendChild(messageElement);
  scrollToBottom();
  
}


const socket = io();

socket.on("connection", (socket) => {
  console.log(socket.id);
});

socket.on("receive-message", (message) => {
  createMessage(message);
});

sendButton.addEventListener("click", () => {
  sendMessage();
});

textBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && textBox.value !== "") {
    sendMessage();
  }
});

function sendMessage() {
  if (textBox.value !== "") {
    socket.emit("send-message", textBox.value);
    createMessage(textBox.value, true);
    textBox.value = "";
  }
}

