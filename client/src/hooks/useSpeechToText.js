import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const useSpeechToText = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after one sentence/phrase
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            toast("Listening...", { icon: '🎙️', duration: 2000 });
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access denied");
            }
        };

        recognitionRef.current.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) {
            toast.error("Browser does not support speech recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript(''); // Reset transcript on new start
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};

export default useSpeechToText;
