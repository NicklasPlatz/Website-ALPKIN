const log = (text) => {
    console.log('Message from server: '+text)
};
  

const onValueSubmitted = (sock) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#guess-input');
    const value = input.value;
    input.value = '';
    
    if(value != ''){
        sock.emit('message', value);
    }
}

  (() => {

    const sock = io();

    sock.on('message', log);
    document.querySelector('#guess-form').addEventListener('submit', onValueSubmitted(sock));

  })();