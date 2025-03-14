// Initialize speech synthesis
const synth = window.speechSynthesis;




// Handle microphone button click
document.getElementById('micButton').addEventListener('click', () => {
    speak("Welcome to SkillQuest! I'm your voice assistant. Click on any text to hear it read aloud.");
});




// Make all text content clickable for text-to-speech
document.addEventListener('click', (e) => {
    const text = e.target.textContent;
    if (text && e.target.id !== 'micButton') {
        speak(text);
    }
});




// Function to handle text-to-speech
function speak(text) {
    // Cancel any ongoing speech
    synth.cancel();
   
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
   
    // Speak the text
    synth.speak(utterance);
}




// Voice search functionality (if you want to keep it)
const voiceButton = document.querySelector('.icon-wrapper[title="Voice Search"]');
const searchInput = document.querySelector('.global-search');




if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
   
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        voiceButton.classList.remove('listening');
    };
   
    voiceButton.addEventListener('click', () => {
        if (voiceButton.classList.contains('listening')) {
            recognition.stop();
            voiceButton.classList.remove('listening');
        } else {
            recognition.start();
            voiceButton.classList.add('listening');
        }
    });
}




document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');




    micButton.addEventListener('click', async () => {
        try {
            // Redirect to your Hugging Face space
            window.location.href = 'https://huggingface.co/spaces/Siddhisapkal/AI_Tutor';
        } catch (error) {
            console.error('Error:', error);
            alert('Could not open AI Tutor. Please try again.');
        }
    });




    // Keep existing text-to-speech functionality
    const synth = window.speechSynthesis;




    document.addEventListener('mouseover', (e) => {
        const text = e.target.textContent;
        if (text && text.trim() && !e.target.classList.contains('fa-solid') &&
            !e.target.classList.contains('fas')) {
            synth.cancel();
            speakText(text.trim());
        }
    });




    document.addEventListener('mouseout', () => {
        synth.cancel();
    });




    function speakText(text) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }




    // Get the existing AI Assistant icon
    const aiBot = document.getElementById('aiBot');




    // Add click handler to open Hugging Face space
    aiBot.addEventListener('click', () => {
        window.open('https://huggingface.co/spaces/Siddhisapkal/AI_Tutor', '_blank');
    });
});




// Simple direct click handler - no dependencies needed
document.addEventListener('DOMContentLoaded', function() {
    // Get the bot button using class name
    const botButton = document.querySelector('.ai-bot-button');
   
    if (botButton) {
        // Add click handler
        botButton.addEventListener('click', function() {
            // Open Hugging Face space in new tab
            window.open('https://huggingface.co/spaces/Siddhisapkal/AI_Tutor', '_blank');
           
            // Log to check if click is working
            console.log('Bot clicked!');
        });
       
        // Make sure the button is clickable
        botButton.style.cursor = 'pointer';
    }
});




// Add click handler for sign in button
document.querySelector('.icon-wrapper[title="Sign In"]').addEventListener('click', function() {
    window.location.href = 'login.html';
});




const voiceAssistBtn = document.getElementById('voiceAssistBtn');
if (voiceAssistBtn) {
    voiceAssistBtn.addEventListener('click', function() {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        speakText("Welcome to SkillQuest! I'm your voice assistant. Hover over any text to hear it read aloud.");
    });
}





