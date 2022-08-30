var socketId = null
function request(strScript,fn){
  	var on = "request"
	front.send(on,strScript+`
		socketId="${socketId}"`)
	if(fn)
	front.on(on,(m)=>{
		if(socketId==m.socketId)
			fn(m)
	})
}
//socket.emit('open',(e)=>{
//	 console.log('Open)
//})
//	socket.on('Open', function(event, ...args) {
//	    console.log('Open)
//	    console.log(...args)
//	    //exeFunction(event, ...args);
//	})
window.onload = function() {
  
  // Get references to elements on the page.
  var form = document.getElementById('message-form');
  var messageField = document.getElementById('message');
  var messagesList = document.getElementById('messages');
  var socketStatus = document.getElementById('status');
  var closeBtn = document.getElementById('close');

  // Handle any errors that occur.
	socket.addEventListener('error',function(error) {
		console.log('WebSocket Error: ' + error);
	});

	socket.addEventListener('connect',function(e) {
		socketId = socket.id
	    socketStatus.innerHTML = 'Connected to: ' + socket.id;
	    socketStatus.className = 'open';
	})

  	socket.addEventListener('close',function(e) {
	    socketStatus.innerHTML = 'Disconnected from WebSocket.';
	    socketStatus.className = 'closed';
	})
	 socket.addEventListener('disconnect',function(e) {
	    socketStatus.innerHTML = 'Disconnected from WebSocket.';
	    socketStatus.className = 'closed';
	})

  // Send a message when the form is submitted.
  form.onsubmit = function(e) {
    e.preventDefault();

    // Retrieve the message from the textarea.
    var message = messageField.value;

    // Send the message through the WebSocket.
    //socket.send(message);
    request(`
    	data="${message}"
    `,(m)=>{
    	//if(socket.id==m.socketId &&socketId!=null)
    	messagesList.innerHTML += '<li class="received"><span>Received:</span>' + m.data + '</li>';
	})

    // Add the message to the messages list.
    messagesList.innerHTML += '<li class="sent"><span>Sent:</span>' + message +
                              '</li>';

    // Clear out the message field.
    messageField.value = '';

    return false;
  };

  // Close the WebSocket connection when the close button is clicked.
  closeBtn.onclick = function(e) {
    e.preventDefault();

    // Close the WebSocket.
    socket.close();

    return false;
  };

};

