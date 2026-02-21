
// ============================================
// Voice Assistant
// ============================================
let recognition;
let isListening = false;

function toggleVoiceAssistant() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Désolé, votre navigateur ne supporte pas la reconnaissance vocale.");
        return;
    }

    const btn = document.getElementById('voice-assist-btn');

    if (isListening) {
        stopVoiceAssistant();
    } else {
        startVoiceAssistant();
    }
}

function startVoiceAssistant() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = function () {
        isListening = true;
        const btn = document.getElementById('voice-assist-btn');
        if (btn) {
            btn.classList.add('recording');
            btn.style.color = '#ef4444'; // Red to indicate recording
        }

        // Feedback
        const content = document.getElementById('cooking-content');
        const feedback = document.createElement('div');
        feedback.id = 'voice-feedback';
        feedback.textContent = "Je vous écoute... Dites 'Suivant' !";
        feedback.style.cssText = "text-align: center; color: var(--primary); margin-bottom: 10px; font-weight: bold; animation: pulse 1.5s infinite;";
        content.insertBefore(feedback, content.firstChild);

        // Speak initial instructions
        speakText("Assistant vocal activé. Dites Suivant pour avancer.");
    };

    recognition.onend = function () {
        // Auto-restart if it stops but we didn't explicitly stop it (unless navigated away)
        if (isListening && document.getElementById('cooking-mode').classList.contains('active')) {
            try {
                recognition.start();
            } catch (e) {
                isListening = false;
                updateVoiceButtonUI();
            }
        } else {
            isListening = false;
            updateVoiceButtonUI();
        }
    };

    recognition.onresult = function (event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();

        console.log("Voice Command:", command);

        // Show what was heard
        const feedback = document.getElementById('voice-feedback');
        if (feedback) feedback.textContent = `Entendu : "${command}"`;

        if (command.includes('suivant') || command.includes('après') || command.includes('next') || command.includes('prochaine')) {
            if (typeof nextStep === 'function') nextStep();
        } else if (command.includes('précédent') || command.includes('retour') || command.includes('back')) {
            if (state.cookingStep > 0) {
                state.cookingStep--;
                updateCookingStep();
            }
        } else if (command.includes('stop') || command.includes('arrête')) {
            stopVoiceAssistant();
        }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error(e);
    }
}

function stopVoiceAssistant() {
    isListening = false;
    if (recognition) {
        recognition.stop();
    }
    updateVoiceButtonUI();
    const feedback = document.getElementById('voice-feedback');
    if (feedback) feedback.remove();
}

function updateVoiceButtonUI() {
    const btn = document.getElementById('voice-assist-btn');
    if (btn) {
        btn.classList.remove('recording');
        btn.style.color = 'currentColor';
    }
}

function speakText(text) {
    if (!('speechSynthesis' in window)) return;

    // Cancel current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
}
