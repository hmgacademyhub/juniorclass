let currentTopicId = null;
let currentLessonData = null;
let currentFontSize = 18; // Default text size is 18px

// Flashcard state
let currentVocabIndex = 0;
let isFlipped = false;

// Science sandbox state
const sciSpecimens = [
    { name: "Dog 🐕", isLiving: true },
    { name: "Stone 🪨", isLiving: false },
    { name: "Rose Plant 🌹", isLiving: true },
    { name: "Computer 💻", isLiving: false },
    { name: "Cat 🐈", isLiving: true },
    { name: "Car 🚗", isLiving: false },
    { name: "Mushroom 🍄", isLiving: true },
    { name: "Pencil ✏️", isLiving: false }
];
let currentSciIndex = 0;

// Text-to-Speech state
let voices = [];
let ttsElements = [];
let currentTtsElementIdx = 0;
let activeSpeechUtterance = null;

async function loadLesson() {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('id');
    currentTopicId = topicId;
    
    if (!topicId) {
        alert('No topic ID provided!');
        window.location.href = 'dashboard.html';
        return;
    }

    const lessonTitle = document.getElementById('lessonTitle');
    const breadcrumb = document.getElementById('breadcrumb');
    const lessonContent = document.getElementById('lessonContent');
    const assessmentSection = document.getElementById('assessmentSection');
    const quizLink = document.getElementById('quizLink');
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    const objectivesSection = document.getElementById('objectivesSection');
    const objectivesList = document.getElementById('objectivesList');
    const vocabSection = document.getElementById('vocabSection');
    const vocabGrid = document.getElementById('vocabGrid');

    // Notebook elements
    const notebookArea = document.getElementById('notebookArea');
    const savedNotes = localStorage.getItem(`notes-${topicId}`);
    if (savedNotes) {
        notebookArea.value = savedNotes;
    }
    notebookArea.addEventListener('input', () => {
        localStorage.setItem(`notes-${topicId}`, notebookArea.value);
    });

    try {
        const response = await fetch(`data/curriculum/topics/${topicId}.json`);
        if (!response.ok) throw new Error('Lesson not found');
        currentLessonData = await response.json();
        const data = currentLessonData;

        breadcrumb.textContent = `${data.class} | ${data.subject} | ${data.term}`;
        lessonTitle.textContent = data.title;

        // Render objectives
        if (data.learning_objectives) {
            objectivesSection.classList.remove('hidden');
            objectivesList.innerHTML = data.learning_objectives.map(obj => 
                `<li class="flex items-start gap-3"><i class="fas fa-check-circle mt-1 text-green-500"></i> ${obj}</li>`
            ).join('');
        }

        // Render vocab list
        if (data.key_vocabulary && data.key_vocabulary.length > 0) {
            vocabSection.classList.remove('hidden');
            vocabGrid.innerHTML = data.key_vocabulary.map(item => `
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
                    <span class="block font-extrabold text-blue-600 mb-1">${item.term}</span>
                    <span class="text-slate-600 text-sm font-medium">${item.definition}</span>
                </div>
            `).join('');

            // Initialize active recall flashcards
            document.getElementById('flashcardSection').classList.remove('hidden');
            currentVocabIndex = 0;
            isFlipped = false;
            updateFlashcardUI();
        }

        // Setup Sandbox
        setupSandbox(data.subject);

        // Render main content
        lessonContent.innerHTML = '';
        data.content.forEach(block => {
            const element = document.createElement('div');
            element.className = 'mb-10';

            if (block.type === 'heading') {
                element.innerHTML = `<h2 class="text-3xl font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-3">${block.text}</h2>`;
            } else if (block.type === 'text') {
                element.innerHTML = `<p class="text-slate-600 leading-relaxed text-lg">${block.text}</p>`;
            } else if (block.type === 'info-box') {
                element.innerHTML = `
                    <div class="bg-blue-50 border-l-8 border-blue-500 p-8 rounded-r-3xl text-blue-800 italic shadow-sm">
                        <i class="fas fa-lightbulb mr-2 text-blue-500"></i> ${block.text}
                    </div>
                `;
            } else if (block.type === 'list') {
                const list = document.createElement('ul');
                list.className = 'space-y-4';
                block.items.forEach(item => {
                    list.innerHTML += `
                        <li class="flex items-start gap-3 text-slate-600 text-lg">
                            <i class="fas fa-arrow-right text-blue-500 mt-1.5 text-sm"></i> ${item}
                        </li>
                    `;
                });
                element.appendChild(list);
            } else if (block.type === 'table') {
                const table = document.createElement('div');
                table.className = 'overflow-x-auto rounded-3xl border border-slate-200 shadow-sm';
                let tableHtml = `<table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50">
                        <tr>${block.headers.map(h => `<th class="p-5 font-extrabold text-slate-700 border-b border-slate-200">${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${block.rows.map(row => `
                            <tr class="border-b border-slate-100 hover:bg-blue-50/50 transition">
                                ${row.map(cell => `<td class="p-5 text-slate-600">${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
                table.innerHTML = tableHtml;
                element.appendChild(table);
            } else if (block.type === 'knowledge-check') {
                element.innerHTML = `
                    <div class="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border-2 border-blue-500 relative">
                        <span class="absolute -top-4 left-6 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Quick Knowledge Check</span>
                        <h3 class="text-xl font-bold mb-6 mt-2">${block.question}</h3>
                        <div class="grid gap-3">
                            ${block.options.map((opt, idx) => `
                                <button onclick="checkKC(this, ${idx === block.answer})" class="text-left p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition font-medium text-sm">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                        <div class="kc-feedback hidden mt-6 p-4 rounded-xl bg-blue-500/20 text-blue-300 italic text-sm border border-blue-500/30">
                            ${block.explanation}
                        </div>
                    </div>
                `;
            }
            lessonContent.appendChild(element);
        });

        if (data.assessment) {
            assessmentSection.classList.remove('hidden');
            quizLink.href = `quiz.html?id=${data.assessment.quizId}`;
        }

        const isCompleted = localStorage.getItem(`completed-${topicId}`) === 'true';
        if (isCompleted) updateCompleteButtonState();

        markCompleteBtn.onclick = () => {
            localStorage.setItem(`completed-${topicId}`, 'true');
            updateCompleteButtonState();
        };

        populateVoicesDropdown();
        initThemeAndStyles();

    } catch (error) {
        console.error('Error loading lesson:', error);
        alert('Failed to load lesson content.');
        window.location.href = 'dashboard.html';
    }
}

function updateCompleteButtonState() {
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    markCompleteBtn.innerHTML = `<i class="fas fa-check-double mr-2"></i> Completed`;
    markCompleteBtn.className = 'bg-green-100 text-green-700 px-8 py-3 rounded-full font-bold border border-green-200 cursor-default shadow-sm';
    markCompleteBtn.onclick = null;
}

window.checkKC = (btn, isCorrect) => {
    const parent = btn.parentElement;
    const buttons = parent.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    if (isCorrect) {
        btn.classList.add('bg-green-600', 'border-green-600', 'text-white');
    } else {
        btn.classList.add('bg-red-600', 'border-red-600', 'text-white');
    }
    const feedback = parent.nextElementSibling;
    if (feedback && feedback.classList.contains('kc-feedback')) {
        feedback.classList.remove('hidden');
    }
};

/* --- STUDY NOTES NOTEBOOK SYSTEM --- */
window.downloadStudyNotes = () => {
    const notes = document.getElementById('notebookArea').value;
    if (!notes.trim()) {
        alert('Your notebook is empty! Type some key takeaways before exporting.');
        return;
    }
    const blob = new Blob([`HMG ACADEMY STUDY NOTEBOOK\nTopic: ${currentLessonData.title}\nSubject: ${currentLessonData.subject}\nDate: ${new Date().toLocaleDateString()}\n----------------------------------------\n\n${notes}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HMG_Notes_${currentTopicId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.clearStudyNotes = () => {
    if (confirm('Are you sure you want to clear your notes? This action cannot be undone.')) {
        document.getElementById('notebookArea').value = '';
        localStorage.removeItem(`notes-${currentTopicId}`);
    }
};

/* --- ACCESSIBILITY TOOLSET (TTS Voice + Speed + Section Highlight) --- */
function populateVoicesDropdown() {
    if (!window.speechSynthesis) return;

    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        const select = document.getElementById('ttsVoice');
        select.innerHTML = '<option value="">Default Voice</option>';

        const engVoices = voices.filter(v => v.lang.includes('en'));
        engVoices.forEach((v, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `${v.name} (${v.lang})`;
            select.appendChild(opt);
        });
    }

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

window.toggleTTS = () => {
    const btn = document.getElementById('ttsBtn');
    if (activeSpeechUtterance) {
        window.speechSynthesis.cancel();
        activeSpeechUtterance = null;
        
        if (ttsElements[currentTtsElementIdx]) {
            ttsElements[currentTtsElementIdx].style.backgroundColor = "";
            ttsElements[currentTtsElementIdx].style.padding = "";
            ttsElements[currentTtsElementIdx].style.borderRadius = "";
        }
        
        btn.innerHTML = `<i class="fas fa-volume-up"></i> Read`;
        btn.parentElement.classList.remove('bg-blue-100', 'text-blue-800');
        return;
    }

    const content = document.getElementById('lessonContent');
    const objectives = document.getElementById('objectivesSection');
    
    ttsElements = [];
    if (!objectives.classList.contains('hidden')) {
        ttsElements.push(objectives);
    }
    
    Array.from(content.children).forEach(child => {
        if (['H2', 'P', 'UL', 'OL', 'DIV'].includes(child.tagName)) {
            ttsElements.push(child);
        }
    });

    if (ttsElements.length === 0) return;

    currentTtsElementIdx = 0;
    btn.innerHTML = `<i class="fas fa-stop-circle text-red-500"></i> Stop`;
    btn.parentElement.classList.add('bg-blue-100', 'text-blue-800');
    
    readNextBlock();
};

function readNextBlock() {
    if (currentTtsElementIdx >= ttsElements.length) {
        activeSpeechUtterance = null;
        const btn = document.getElementById('ttsBtn');
        btn.innerHTML = `<i class="fas fa-volume-up"></i> Read`;
        btn.parentElement.classList.remove('bg-blue-100', 'text-blue-800');
        return;
    }

    ttsElements.forEach(el => {
        el.style.backgroundColor = "";
        el.style.padding = "";
        el.style.borderRadius = "";
        el.style.transition = "";
    });

    const activeEl = ttsElements[currentTtsElementIdx];
    
    activeEl.style.transition = "all 0.3s";
    activeEl.style.backgroundColor = "#fef08a";
    activeEl.style.padding = "10px";
    activeEl.style.borderRadius = "12px";

    const textToSpeak = activeEl.innerText;
    activeSpeechUtterance = new SpeechSynthesisUtterance(textToSpeak);

    const speed = parseFloat(document.getElementById('ttsSpeed').value) || 1.0;
    activeSpeechUtterance.rate = speed;

    const voiceIdx = document.getElementById('ttsVoice').value;
    if (voiceIdx !== "") {
        const engVoices = voices.filter(v => v.lang.includes('en'));
        activeSpeechUtterance.voice = engVoices[parseInt(voiceIdx)];
    }

    activeSpeechUtterance.onend = () => {
        currentTtsElementIdx++;
        readNextBlock();
    };

    activeSpeechUtterance.onerror = () => {
        activeSpeechUtterance = null;
        const btn = document.getElementById('ttsBtn');
        btn.innerHTML = `<i class="fas fa-volume-up"></i> Read`;
        btn.parentElement.classList.remove('bg-blue-100', 'text-blue-800');
    };

    window.speechSynthesis.speak(activeSpeechUtterance);
}

window.changeFontSize = (step) => {
    currentFontSize += step * 2;
    if (currentFontSize < 14) currentFontSize = 14;
    if (currentFontSize > 28) currentFontSize = 28;
    document.getElementById('lessonContent').style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('hmg_font_size', currentFontSize);
};

window.toggleDyslexicFont = () => {
    const content = document.getElementById('lessonContent');
    const isDyslexic = content.classList.toggle('dyslexic');
    const btn = document.getElementById('dysBtn');
    if (isDyslexic) {
        btn.classList.add('bg-blue-100', 'text-blue-700');
        localStorage.setItem('hmg_dyslexic', 'true');
    } else {
        btn.classList.remove('bg-blue-100', 'text-blue-700');
        localStorage.setItem('hmg_dyslexic', 'false');
    }
};

window.toggleDarkMode = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('darkBtn');
    if (isDark) {
        btn.innerHTML = `<i class="fas fa-sun text-yellow-500"></i>`;
        localStorage.setItem('hmg_theme', 'dark');
    } else {
        btn.innerHTML = `<i class="fas fa-moon"></i>`;
        localStorage.setItem('hmg_theme', 'light');
    }
};

function initThemeAndStyles() {
    const size = localStorage.getItem('hmg_font_size');
    if (size) {
        currentFontSize = parseInt(size);
        document.getElementById('lessonContent').style.fontSize = `${currentFontSize}px`;
    }
    if (localStorage.getItem('hmg_dyslexic') === 'true') {
        document.getElementById('lessonContent').classList.add('dyslexic');
        document.getElementById('dysBtn').classList.add('bg-blue-100', 'text-blue-700');
    }
    if (localStorage.getItem('hmg_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkBtn').innerHTML = `<i class="fas fa-sun text-yellow-500"></i>`;
    }
}

/* --- ACTIVE RECALL FLASHCARDS (With Keyboard Shortcuts & Voice V10) --- */
function updateFlashcardUI() {
    const vocab = currentLessonData.key_vocabulary;
    if (!vocab || vocab.length === 0) return;
    
    const cardContent = document.getElementById('cardContent');
    const cardLabel = document.getElementById('cardLabel');
    const box = document.getElementById('flashcardBox');
    
    box.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    
    setTimeout(() => {
        if (!isFlipped) {
            cardLabel.textContent = `Vocabulary Card (Front) • Press 'S' to Speak`;
            cardContent.textContent = vocab[currentVocabIndex].term;
            box.className = "w-full max-w-md aspect-[1.6] bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center cursor-pointer relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02]";
        } else {
            cardLabel.textContent = `Vocabulary Definition (Back) • Press 'S' to Speak`;
            cardContent.textContent = vocab[currentVocabIndex].definition;
            box.className = "w-full max-w-md aspect-[1.6] bg-gradient-to-br from-teal-600 to-emerald-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center cursor-pointer relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02]";
        }
        document.getElementById('flashcardIndex').textContent = `${currentVocabIndex + 1} / ${vocab.length}`;
    }, 150);
}

window.flipFlashcard = () => {
    isFlipped = !isFlipped;
    updateFlashcardUI();
};

window.nextFlashcard = () => {
    const vocab = currentLessonData.key_vocabulary;
    isFlipped = false;
    currentVocabIndex = (currentVocabIndex + 1) % vocab.length;
    updateFlashcardUI();
};

window.prevFlashcard = () => {
    const vocab = currentLessonData.key_vocabulary;
    isFlipped = false;
    currentVocabIndex = (currentVocabIndex - 1 + vocab.length) % vocab.length;
    updateFlashcardUI();
};

// Keyboard Hotkey Navigations inside V10
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
        return; // ignore while writing notes
    }

    const flashcardSection = document.getElementById('flashcardSection');
    if (flashcardSection && !flashcardSection.classList.contains('hidden')) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            flipFlashcard();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextFlashcard();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevFlashcard();
        } else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            speakActiveFlashcard();
        }
    }
});

function speakActiveFlashcard() {
    const vocab = currentLessonData.key_vocabulary;
    if (!vocab || vocab.length === 0) return;
    
    const activeTerm = vocab[currentVocabIndex].term;
    const activeDef = vocab[currentVocabIndex].definition;
    const textToSpeak = `${activeTerm}. Definition: ${activeDef}`;

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

/* --- STUDY PLANNER SCHEDULER INTEGRATION --- */
window.addThisLessonToPlanner = () => {
    const tasks = JSON.parse(localStorage.getItem('hmg_planner_tasks') || '[]');
    const taskText = `Review and study: ${currentLessonData.title} (${currentLessonData.subject})`;
    
    const exists = tasks.some(t => t.text === taskText);
    if (exists) {
        alert('This lesson is already scheduled in your study planner!');
        return;
    }

    tasks.push({
        text: taskText,
        date: "2026-06-02",
        done: false
    });
    localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
    localStorage.setItem('badge-planner-scheduled', 'true');
    alert(`Successfully scheduled "${currentLessonData.title}" in your Study Planner for 2026-06-02!`);
};

/* --- DYNAMIC INTERACTIVE LAB SANDBOXES --- */
function setupSandbox(subject) {
    const section = document.getElementById('sandboxSection');
    const cs = document.getElementById('csSandbox');
    const math = document.getElementById('mathSandbox');
    const sci = document.getElementById('sciSandbox');

    section.classList.remove('hidden');
    
    if (subject === 'Computer Science') {
        cs.classList.remove('hidden');
        runCsSandbox();
    } else if (subject === 'Mathematics') {
        math.classList.remove('hidden');
        solveMathSandbox();
    } else if (subject === 'Basic Science') {
        sci.classList.remove('hidden');
        const tid = currentTopicId;
        if (tid.includes('sci-t1-1') && !tid.startsWith('jss3')) {
            document.getElementById('bioLab').classList.remove('hidden');
            document.getElementById('chemLab').classList.add('hidden');
            currentSciIndex = 0;
            loadSciSpecimen();
        } else {
            document.getElementById('chemLab').classList.remove('hidden');
            document.getElementById('bioLab').classList.add('hidden');
            renderBohrModel('H');
        }
    } else {
        section.classList.add('hidden');
    }
}

// CS Sandbox logic
window.runCsSandbox = () => {
    const input = document.getElementById('decSandboxInput');
    let val = parseInt(input.value);
    
    if (isNaN(val) || val < 0) {
        document.getElementById('binSandboxOutput').textContent = "Invalid Input";
        return;
    }
    
    const binary = val.toString(2);
    document.getElementById('binSandboxOutput').textContent = binary;
    document.getElementById('ipoInputVal').textContent = val;
    document.getElementById('ipoOutputVal').textContent = `${binary}_2`;
};

// Math Sandbox logic
window.solveMathSandbox = () => {
    const a = parseFloat(document.getElementById('eqA').value);
    const b = parseFloat(document.getElementById('eqB').value);
    const c = parseFloat(document.getElementById('eqC').value);

    const mathEqDisp = document.getElementById('mathEqDisp');
    const mathEqStep2 = document.getElementById('mathEqStep2');
    const mathEqResult = document.getElementById('mathEqResult');
    const mathEqSubtract = document.getElementById('mathEqSubtract');
    const mathEqDiv = document.getElementById('mathEqDiv');

    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
        mathEqDisp.textContent = "Error: Invalid Coefficients";
        mathEqStep2.textContent = "-";
        mathEqResult.textContent = "a cannot be 0";
        return;
    }

    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    mathEqDisp.textContent = `${a}x ${bSign} = ${c}`;
    
    const cMinusB = c - b;
    mathEqSubtract.textContent = `${b}`;
    mathEqStep2.textContent = `${a}x = ${cMinusB}`;

    const result = (cMinusB / a).toFixed(2);
    mathEqDiv.textContent = `${a}`;
    mathEqResult.textContent = `x = ${result.endsWith('.00') ? result.slice(0, -3) : result}`;
};

// Biology Science Specimen Classifier logic
function loadSciSpecimen() {
    const specimen = sciSpecimens[currentSciIndex];
    document.getElementById('sciSpecimen').textContent = specimen.name;
    document.getElementById('sciFeedback').textContent = "Is this specimen Living or Non-Living?";
    document.getElementById('sciFeedback').className = "text-sm italic font-semibold text-slate-300 min-h-[20px]";
}

window.guessSciSpecimen = (guessedLiving) => {
    const specimen = sciSpecimens[currentSciIndex];
    const feedback = document.getElementById('sciFeedback');
    
    if (guessedLiving === specimen.isLiving) {
        feedback.textContent = `Correct! ${specimen.name} is classified as ${specimen.isLiving ? 'Living' : 'Non-Living'}.`;
        feedback.className = "text-sm italic font-semibold text-green-400 min-h-[20px]";
    } else {
        feedback.textContent = `Not quite! ${specimen.name} is actually ${specimen.isLiving ? 'Living' : 'Non-Living'}.`;
        feedback.className = "text-sm italic font-semibold text-red-400 min-h-[20px]";
    }

    setTimeout(() => {
        currentSciIndex = (currentSciIndex + 1) % sciSpecimens.length;
        loadSciSpecimen();
    }, 2500);
};

// Chemistry Science Interactive Bohr Atomic Model Generator (Pure SVG)
window.renderBohrModel = (element) => {
    const pText = document.getElementById('bohrP');
    const nText = document.getElementById('bohrN');
    const eText = document.getElementById('bohrE');
    const sText = document.getElementById('bohrShells');
    const container = document.getElementById('bohrSvgContainer');
    
    let p=1, n=0, e=1, shells=1;
    let shellArr = [1];
    
    if (element === 'H') {
        p=1; n=0; e=1; shells=1; shellArr = [1];
    } else if (element === 'He') {
        p=2; n=2; e=2; shells=1; shellArr = [2];
    } else if (element === 'C') {
        p=6; n=6; e=6; shells=2; shellArr = [2, 4];
    } else if (element === 'O') {
        p=8; n=8; e=8; shells=2; shellArr = [2, 6];
    }

    pText.textContent = p;
    nText.textContent = n;
    eText.textContent = e;
    sText.textContent = shells;

    let svg = `<svg class="w-full h-full" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<circle cx="80" cy="80" r="18" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>`;
    svg += `<text x="80" y="77" font-size="6" font-weight="bold" fill="#2dd4bf" text-anchor="middle">P: ${p}</text>`;
    svg += `<text x="80" y="86" font-size="6" font-weight="bold" fill="#f59e0b" text-anchor="middle">N: ${n}</text>`;

    shellArr.forEach((elecCount, shellIdx) => {
        const r = 28 + (shellIdx * 20);
        svg += `<circle cx="80" cy="80" r="${r}" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>`;
        for (let i = 0; i < elecCount; i++) {
            const angle = (i * (2 * Math.PI / elecCount)) + (shellIdx * 0.5);
            const ex = 80 + r * Math.cos(angle);
            const ey = 80 + r * Math.sin(angle);
            svg += `<circle cx="${ex}" cy="${ey}" r="4.5" fill="#3b82f6" stroke="#93c5fd" stroke-width="1"/>`;
        }
    });

    svg += `</svg>`;
    container.innerHTML = svg;
};

window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
});

document.addEventListener('DOMContentLoaded', loadLesson);
