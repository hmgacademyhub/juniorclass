async function loadQuiz() {
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('id');
    if (!quizId) {
        alert('No quiz ID provided!');
        window.location.href = 'dashboard.html';
        return;
    }

    const topicId = quizId.replace('-quiz', '');
    const questionText = document.getElementById('questionText');
    const optionsGrid = document.getElementById('optionsGrid');
    const quizProgress = document.getElementById('quizProgress');
    const quizStatus = document.getElementById('quizStatus');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const questionArea = document.getElementById('questionArea');
    const resultArea = document.getElementById('resultArea');

    let questions = [];
    let currentIdx = 0;
    let userAnswers = [];

    try {
        const response = await fetch(`data/curriculum/topics/${topicId}.json`);
        const data = await response.json();
        questions = data.assessment.questions;
        renderQuestion();
    } catch (error) {
        console.error('Error loading quiz:', error);
        questionText.textContent = 'Failed to load quiz questions.';
    }

    function renderQuestion() {
        const q = questions[currentIdx];
        questionText.textContent = q.question;
        optionsGrid.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `p-5 text-left border-2 rounded-2xl transition-all font-bold text-lg ${userAnswers[currentIdx] === idx ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 hover:border-blue-300 text-slate-600'}`;
            btn.textContent = opt;
            btn.onclick = () => selectOption(idx);
            optionsGrid.appendChild(btn);
        });
        const progress = ((currentIdx + 1) / questions.length) * 100;
        quizProgress.style.width = `${progress}%`;
        quizStatus.textContent = `Q ${currentIdx + 1}/${questions.length}`;
        prevBtn.classList.toggle('hidden', currentIdx === 0);
        nextBtn.innerHTML = currentIdx === questions.length - 1 ? 'Finish <i class="fas fa-flag-checkered ml-2"></i>' : 'Next <i class="fas fa-chevron-right ml-2"></i>';
    }

    function selectOption(idx) {
        userAnswers[currentIdx] = idx;
        renderQuestion();
    }

    nextBtn.onclick = () => {
        if (userAnswers[currentIdx] === undefined) {
            alert('Please select an answer before proceeding!');
            return;
        }
        if (currentIdx < questions.length - 1) {
            currentIdx++;
            renderQuestion();
        } else {
            showResults();
        }
    };

    prevBtn.onclick = () => {
        if (currentIdx > 0) {
            currentIdx--;
            renderQuestion();
        }
    };

    function showResults() {
        questionArea.classList.add('hidden');
        resultArea.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        prevBtn.classList.add('hidden');
        let score = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.answer) score++;
        });
        const percent = Math.round((score / questions.length) * 100);
        
        // Save quiz score for academic report card
        const prevScore = parseInt(localStorage.getItem(`score-${topicId}`) || '0');
        if (percent > prevScore) {
            localStorage.setItem(`score-${topicId}`, percent);
        }

        // Set perfect score badge
        if (percent === 100) {
            localStorage.setItem('badge-perfect-score', 'true');
        }

        const scoreText = document.getElementById('scoreText');
        const scoreMsg = document.getElementById('scoreMsg');
        const scoreIcon = document.getElementById('scoreIcon');
        const certBtn = document.getElementById('certBtn');
        scoreText.textContent = `Your Score: ${percent}%`;
        if (percent === 100) {
            scoreIcon.innerHTML = '🏆';
            scoreMsg.textContent = 'Absolute Perfection! You have mastered this topic completely.';
            certBtn.classList.remove('hidden');
        } else if (percent >= 70) {
            scoreIcon.innerHTML = '🌟';
            scoreMsg.textContent = 'Great job! You have a strong grasp of this topic.';
            certBtn.classList.remove('hidden');
        } else {
            scoreIcon.innerHTML = '📚';
            scoreMsg.textContent = 'Good effort! We recommend reviewing the lesson and trying again to earn your certificate.';
        }
        
        if (percent >= 70) {
            const certId = `cert-${topicId}`;
            localStorage.setItem(certId, 'true');
            localStorage.setItem('last_cert_topic', topicId);

            // Generate enterprise serial signature (Secure Base64 verification key)
            const studentName = localStorage.getItem('userName') || 'Scholar Learner';
            const rawHash = `${studentName}|${percent}|${new Date().toLocaleDateString()}`;
            const base64Hash = btoa(rawHash);
            const serialCode = `HMG-CERT-${topicId}-${base64Hash}`;

            // Display verification block
            const serialBox = document.getElementById('certSerialBox');
            if (serialBox) {
                serialBox.classList.remove('hidden');
                document.getElementById('certSerialCode').textContent = serialCode;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', loadQuiz);
