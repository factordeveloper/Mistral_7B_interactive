document.getElementById('record-btn').addEventListener('mousedown', startRecording);
document.getElementById('record-btn').addEventListener('mouseup', stopRecording);

let recognition;
const chatContainer = document.getElementById('chat-container');

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
} else {
    recognition = new SpeechRecognition();
}

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

function startRecording() {
    chatContainer.classList.add('recording');  // Cambia el fondo a rojo
    recognition.start();
}

function stopRecording() {
    chatContainer.classList.remove('recording');  // Vuelve al fondo original
    recognition.stop();
}

recognition.onresult = function(event) {
    const userInput = event.results[0][0].transcript;
    appendMessage('user', userInput);
    sendMessage(userInput);
};

function sendMessage(userInput) {
    const url = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions';
    const apiKey = 'Bearer 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';  // Reemplaza con tu API key

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [{"role": "user", "content": userInput}],
            max_tokens: 500,
            stream: false
        })
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = data.choices[0].message.content;
        appendMessage('bot', aiResponse);
        speak(aiResponse);  // Convierte el texto en voz y lo reproduce
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('bot', 'Error: Unable to fetch response.');
    });
}

function appendMessage(role, text) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);

    const messageText = document.createElement('div');
    messageText.classList.add('text');
    messageText.textContent = text;

    messageDiv.appendChild(messageText);
    chatBox.appendChild(messageDiv);

    // Scroll to bottom after adding a new message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función para convertir el texto en voz
function speak(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    synth.speak(utterance);
}
