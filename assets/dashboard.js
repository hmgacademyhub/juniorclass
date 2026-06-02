async function loadDashboard() {
    const classSelect = document.getElementById('classSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const termSelect = document.getElementById('termSelect');
    const welcomeView = document.getElementById('welcomeView');
    const topicsView = document.getElementById('topicsView');
    const topicsGrid = document.getElementById('topicsGrid');
    const currentViewTitle = document.getElementById('currentViewTitle');
    const currentViewSubtitle = document.getElementById('currentViewSubtitle');
    const topicCount = document.getElementById('topicCount');
    const topicSearch = document.getElementById('topicSearch');

    let curriculumData = null;
    let currentTopics = [];

    try {
        const response = await fetch('data/curriculum/map.json');
        curriculumData = await response.json();
        const classes = curriculumData.classes;
        for (const classId in classes) {
            const option = document.createElement('option');
            option.value = classId;
            option.textContent = classes[classId].name;
            classSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading curriculum:', error);
        alert('Failed to load curriculum data.');
    }

    function updateProfileUI() {
        const name = localStorage.getItem('userName') || 'Scholar Learner';
        document.getElementById('displayName').textContent = name;
        document.getElementById('userNameInput').value = name;
        document.getElementById('avatarInitial').textContent = name.charAt(0).toUpperCase();
        document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
    }

    window.openProfileModal = () => document.getElementById('profileModal').classList.remove('hidden');
    window.closeProfileModal = () => document.getElementById('profileModal').classList.add('hidden');
    window.saveProfile = () => {
        const name = document.getElementById('userNameInput').value;
        localStorage.setItem('userName', name);
        updateProfileUI();
        closeProfileModal();
    };

    topicSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (currentTopics.length === 0) return;
        const filtered = currentTopics.filter(t => 
            t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        );
        renderTopics(filtered);
    });

    classSelect.addEventListener('change', () => {
        const classId = classSelect.value;
        subjectSelect.innerHTML = '<option value="">Choose Subject...</option>';
        termSelect.innerHTML = '<option value="">Choose Term...</option>';
        termSelect.disabled = true;
        if (!classId) return;
        const subjects = curriculumData.classes[classId].subjects;
        for (const subId in subjects) {
            const option = document.createElement('option');
            option.value = subId;
            option.textContent = subjects[subId].name;
            subjectSelect.appendChild(option);
        }
        subjectSelect.disabled = false;
        updateAnalytics();
    });

    subjectSelect.addEventListener('change', () => {
        const classId = classSelect.value;
        const subId = subjectSelect.value;
        termSelect.innerHTML = '<option value="">Choose Term...</option>';
        if (!subId) return;
        const terms = curriculumData.classes[classId].subjects[subId].terms;
        for (const termId in terms) {
            const option = document.createElement('option');
            option.value = termId;
            option.textContent = terms[termId].name;
            termSelect.appendChild(option);
        }
        termSelect.disabled = false;
        updateAnalytics();
    });

    termSelect.addEventListener('change', () => {
        const classId = classSelect.value;
        const subId = subjectSelect.value;
        const termId = termSelect.value;
        if (!termId) {
            welcomeView.classList.remove('hidden');
            topicsView.classList.add('hidden');
            return;
        }
        const topics = curriculumData.classes[classId].subjects[subId].terms[termId].topics;
        currentTopics = topics;
        welcomeView.classList.add('hidden');
        topicsView.classList.remove('hidden');
        currentViewTitle.textContent = curriculumData.classes[classId].subjects[subId].name;
        currentViewSubtitle.textContent = `${curriculumData.classes[classId].name} - ${curriculumData.classes[classId].subjects[subId].terms[termId].name}`;
        topicCount.textContent = `${topics.length} Topics`;
        renderTopics(topics);
    });

    function renderTopics(topics) {
        topicsGrid.innerHTML = '';
        topics.forEach(topic => {
            const isCompleted = localStorage.getItem(`completed-${topic.id}`) === 'true';
            const hasCert = localStorage.getItem(`cert-${topic.id}`) === 'true';
            const card = document.createElement('div');
            card.className = `p-6 rounded-3xl border transition-all cursor-pointer flex justify-between items-center group ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl'}`;
            card.innerHTML = `
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'} transition shadow-sm">
                        <i class="fas ${hasCert ? 'fa-award' : (isCompleted ? 'fa-check' : 'fa-book')}"></i>
                    </div>
                    <div>
                        <h4 class="font-extrabold ${isCompleted ? 'text-green-800' : 'text-slate-800'}">${topic.title}</h4>
                        <p class="text-sm text-slate-500 font-medium">${topic.description}</p>
                    </div>
                </div>
                <a href="lesson.html?id=${topic.id}" class="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition shadow-md">
                    ${isCompleted ? 'Review' : 'Start'} <i class="fas fa-arrow-right ml-1"></i>
                </a>
            `;
            topicsGrid.appendChild(card);
        });
    }

    function updateAnalytics() {
        const completed = Object.keys(localStorage).filter(key => key.startsWith('completed-')).length;
        const certs = Object.keys(localStorage).filter(key => key.startsWith('cert-')).length;
        const total = calculateTotalTopics(curriculumData);
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('certCount').textContent = certs;
    }

    function calculateTotalTopics(data) {
        let count = 0;
        for (const classId in data.classes) {
            for (const subId in data.classes[classId].subjects) {
                for (const termId in data.classes[classId].subjects[subId].terms) {
                    count += data.classes[classId].subjects[subId].terms[termId].topics.length;
                }
            }
        }
        return count;
    }

    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let streak = parseInt(localStorage.getItem('streak') || '0');
    if (lastVisit !== today) {
        streak++;
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastVisit', today);
    }
    document.getElementById('streakCount').textContent = `${streak} Day Streak`;

    updateProfileUI();
    updateAnalytics();
}

document.addEventListener('DOMContentLoaded', loadDashboard);
