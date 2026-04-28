// Tab Switching Logic
function switchTab(tabId) {
    // Remove active classes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab
    document.querySelector(`button[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ==========================================
// 1. VOICE TYPING LOGIC (Web Speech API)
// ==========================================
const startBtn = document.getElementById('start-btn');
const clearVoiceBtn = document.getElementById('clear-voice-btn');
const voiceResult = document.getElementById('voice-result');
const statusText = document.getElementById('status-text');

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    // Set language to Sinhala (Sri Lanka)
    recognition.lang = 'si-LK';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isRecording = true;
        startBtn.classList.add('recording');
        startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
        statusText.textContent = "Listening... Speak in Sinhala now.";
        statusText.classList.add('listening');
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            // Append the final recognized text to the textarea
            voiceResult.value += finalTranscript;
            // Scroll to bottom
            voiceResult.scrollTop = voiceResult.scrollHeight;
            // Update stats
            updateStats('voice-result', 'voice-stats');
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        statusText.textContent = `Error: ${event.error}. Please try again.`;
    };

    recognition.onend = () => {
        if (isRecording) {
            // If it stopped automatically (e.g. pause in speech), restart it
            try {
                recognition.start();
            } catch (e) {
                console.error(e);
            }
        } else {
            startBtn.classList.remove('recording');
            startBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
            statusText.textContent = "Voice typing stopped. Click 'Start Listening' to resume.";
            statusText.classList.remove('listening');
        }
    };

    startBtn.addEventListener('click', () => {
        if (isRecording) {
            isRecording = false;
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error(e);
            }
        }
    });

} else {
    startBtn.disabled = true;
    statusText.textContent = "Your browser does not support Voice Typing. Please use Google Chrome.";
    startBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not Supported';
}

clearVoiceBtn.addEventListener('click', () => {
    voiceResult.style.opacity = '0.3';
    setTimeout(() => {
        voiceResult.value = '';
        voiceResult.style.opacity = '1';
    }, 200);
});


// ==========================================
// 2. SINGLISH TO SINHALA TRANSLITERATION LOGIC
// ==========================================
const singlishInput = document.getElementById('singlish-input');
const sinhalaOutput = document.getElementById('sinhala-output');
const clearTranslateBtn = document.getElementById('clear-translate-btn');

function transliterate(text) {
    let s = text;
    
    // Special Characters (Binduwa - ං & Visargaya - ඃ)
    s = s.replace(/x/g, "ං");
    s = s.replace(/W/g, "ං");
    s = s.replace(/H/g, "ඃ");
    
    // Consonant mappings ordered by length (longest match first) to avoid partial matches
    // This includes Sanyaka (ඟ, ඬ, ඳ, ඹ) and Murdhaja (ට, ඨ, ඩ, ඪ, ණ, ළ, ෂ)
    const consonants = [
        ['nndh', 'ඬ'], ['nnd', 'ඬ'], ['nng', 'ඟ'], ['mmb', 'ඹ'],
        ['zdh', 'ඳ'], ['zd', 'ඬ'], ['zg', 'ඟ'], ['zb', 'ඹ'],
        ['ndh', 'ඳ'], ['nd', 'ඳ'], ['ng', 'ඟ'], ['mb', 'ඹ'],
        ['Th', 'ථ'], ['Dh', 'ධ'], ['gh', 'ඝ'], ['Ch', 'ඡ'], ['ph', 'ඵ'], ['bh', 'භ'], 
        ['sh', 'ශ'], ['Sh', 'ෂ'], ['GN', 'ඥ'], ['KN', 'ඤ'], ['Lu', 'ළු'], 
        ['dh', 'ද'], ['ch', 'ච'], ['kh', 'ඛ'], ['th', 'ත'], 
        ['t', 'ට'], ['T', 'ඨ'], ['k', 'ක'], ['d', 'ඩ'], ['D', 'ඪ'], 
        ['n', 'න'], ['N', 'ණ'], ['p', 'ප'], ['P', 'ඵ'], ['b', 'බ'], ['B', 'භ'], 
        ['m', 'ම'], ['Y', '‍ය'], ['y', 'ය'], ['j', 'ජ'], ['l', 'ල'], ['L', 'ළ'], 
        ['v', 'ව'], ['w', 'ව'], ['s', 'ස'], ['S', 'ෂ'], ['h', 'හ'], 
        ['K', 'ඛ'], ['G', 'ඝ'], ['f', 'ෆ'], ['q', 'ඣ'], ['g', 'ග'], ['r', 'ර'], ['c', 'ක්‍']
    ];

    const vowels = [
        ['oo', 'ූ', 'ඌ'], ['oe', 'ෝ', 'ඕ'], ['aa', 'ා', 'ආ'], 
        ['aee', 'ෑ', 'ඈ'], ['ae', 'ැ', 'ඇ'], ['Aa', 'ෑ', 'ඈ'], ['A', 'ැ', 'ඇ'],
        ['ii', 'ී', 'ඊ'], ['ie', 'ී', 'ඊ'], ['ee', 'ී', 'ඊ'], ['ea', 'ේ', 'ඒ'], 
        ['ei', 'ේ', 'ඒ'], ['uu', 'ූ', 'ඌ'], ['au', 'ෞ', 'ඖ'], ['a', '', 'අ'], 
        ['i', 'ි', 'ඉ'], ['e', 'ෙ', 'එ'], ['u', 'ු', 'උ'], 
        ['o', 'ො', 'ඔ'], ['I', 'ෛ', 'ඓ']
    ];

    // 1. Process standalone vowels (at the beginning of a word or after a space)
    for (let i = 0; i < vowels.length; i++) {
        let pattern = new RegExp("(^|\\s)" + vowels[i][0], "g");
        s = s.replace(pattern, "$1" + vowels[i][2]);
    }
    
    // 2. Process consonants + vowels combinations
    for (let i = 0; i < consonants.length; i++) {
        for (let j = 0; j < vowels.length; j++) {
            let pattern = new RegExp(consonants[i][0] + vowels[j][0], "g");
            s = s.replace(pattern, consonants[i][1] + vowels[j][1]);
        }
    }

    // 3. Process remaining standalone consonants (add Hal Kirima - '්')
    for (let i = 0; i < consonants.length; i++) {
        let pattern = new RegExp(consonants[i][0], "g");
        s = s.replace(pattern, consonants[i][1] + "්");
    }
    
    // 4. Quick fixes for common remaining issues
    s = s.replace(/්a/g, ""); // If "a" follows a consonant after hal kirima, remove it
    s = s.replace(/්ර්/g, "්‍ර"); // Rakaranshaya support (e.g., kr -> ක්‍ර)
    
    return s;
}

singlishInput.addEventListener('input', (e) => {
    sinhalaOutput.value = transliterate(e.target.value);
});

clearTranslateBtn.addEventListener('click', () => {
    singlishInput.style.opacity = '0.3';
    sinhalaOutput.style.opacity = '0.3';
    setTimeout(() => {
        singlishInput.value = '';
        sinhalaOutput.value = '';
        singlishInput.style.opacity = '1';
        sinhalaOutput.style.opacity = '1';
    }, 200);
});

// ==========================================
// 3. COPY TO CLIPBOARD LOGIC
// ==========================================
function copyText(elementId) {
    const copyText = document.getElementById(elementId);
    if (!copyText.value) return;
    
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    
    navigator.clipboard.writeText(copyText.value).then(() => {
        // Change icon to checkmark temporarily
        const btn = copyText.nextElementSibling;
        if(btn && btn.classList.contains('copy-btn')) {
            const icon = btn.querySelector('i');
            const originalClass = icon.className;
            icon.className = 'fas fa-check';
            btn.style.color = '#00f2fe';
            btn.style.borderColor = '#00f2fe';
            
            setTimeout(() => {
                icon.className = originalClass;
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        }
        
        showToast("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// 4. STATS & DOWNLOAD LOGIC
// ==========================================
function updateStats(textareaId, statsId) {
    const text = document.getElementById(textareaId).value;
    const charCount = text.length;
    // Count words (splitting by spaces, filtering out empty strings)
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    document.getElementById(statsId).textContent = `Words: ${wordCount} | Characters: ${charCount}`;
}

// Hook up stats updates
document.getElementById('voice-result').addEventListener('input', () => updateStats('voice-result', 'voice-stats'));
document.getElementById('sinhala-output').addEventListener('input', () => updateStats('sinhala-output', 'translate-stats'));

function downloadTxt(elementId, filename) {
    const text = document.getElementById(elementId).value;
    if (!text) {
        showToast("Nothing to download!");
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File downloaded!");
}

document.getElementById('download-voice-btn').addEventListener('click', () => {
    downloadTxt('voice-result', 'Voice_Typing_Sinhala.txt');
});

document.getElementById('download-translate-btn').addEventListener('click', () => {
    downloadTxt('sinhala-output', 'Singlish_Translation.txt');
});
