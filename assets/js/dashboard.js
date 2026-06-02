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

    // Load curriculum data from JSON
    try {
        const response = await fetch('data/curriculum/map.json');
        curriculumData = await response.json();
        
        // Populate class selector
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
        return;
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
        const name = document.getElementById('userNameInput').value.trim() || 'Scholar Learner';
        localStorage.setItem('userName', name);
        updateProfileUI();
        closeProfileModal();
        renderLeaderboard(); // Recalculate named row
    };

    // Advanced search: Searches current view if selected, else searches ALL curriculum topics
    topicSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (classSelect.value && subjectSelect.value && termSelect.value) {
            if (currentTopics.length === 0) return;
            const filtered = currentTopics.filter(t => 
                t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
            );
            renderTopics(filtered);
        } else {
            if (!query) {
                welcomeView.classList.remove('hidden');
                topicsView.classList.add('hidden');
                return;
            }
            welcomeView.classList.add('hidden');
            topicsView.classList.remove('hidden');
            currentViewTitle.textContent = "Global Search Results";
            currentViewSubtitle.textContent = `Searching for "${e.target.value}"`;
            
            const results = [];
            for (const classId in curriculumData.classes) {
                const subObj = curriculumData.classes[classId].subjects;
                for (const subId in subObj) {
                    for (const termId in subObj[subId].terms) {
                        const list = subObj[subId].terms[termId].topics;
                        list.forEach(t => {
                            if (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)) {
                                results.push(t);
                            }
                        });
                    }
                }
            }
            topicCount.textContent = `${results.length} Match(es)`;
            renderTopics(results);
        }
    });

    classSelect.addEventListener('change', () => {
        const classId = classSelect.value;
        subjectSelect.innerHTML = '<option value="">Choose Subject...</option>';
        termSelect.innerHTML = '<option value="">Choose Term...</option>';
        termSelect.disabled = true;
        if (!classId) {
            subjectSelect.disabled = true;
            return;
        }
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
        if (!subId) {
            termSelect.disabled = true;
            return;
        }
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
        if (topics.length === 0) {
            topicsGrid.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <i class="fas fa-search text-4xl mb-4 block"></i>
                    <p>No matching topics found.</p>
                </div>
            `;
            return;
        }
        topics.forEach(topic => {
            const isCompleted = localStorage.getItem(`completed-${topic.id}`) === 'true';
            const hasCert = localStorage.getItem(`cert-${topic.id}`) === 'true';
            const card = document.createElement('div');
            card.className = `p-6 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl'}`;
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
                <a href="lesson.html?id=${topic.id}" class="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition shadow-md self-stretch sm:self-auto text-center">
                    ${isCompleted ? 'Review' : 'Start'} <i class="fas fa-arrow-right ml-1"></i>
                </a>
            `;
            topicsGrid.appendChild(card);
        });
    }

    function updateAnalytics() {
        const completedKeys = Object.keys(localStorage).filter(key => key.startsWith('completed-'));
        const completed = completedKeys.length;
        const certs = Object.keys(localStorage).filter(key => key.startsWith('cert-')).length;
        const total = calculateTotalTopics(curriculumData);
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressBar').style.width = `${percent}%`;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('certCount').textContent = certs;

        // Render Badges, charts, leaderboard and diagnostic parameters
        renderBadges(completed, certs);
        renderSVGAnalyticsCharts();
        renderLeaderboard(completed, certs);
        runPwaSelfDiagnostics(true); // background silent diagnostics
    }

    function calculateTotalTopics(data) {
        if (!data || !data.classes) return 0;
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

    /* --- GAMIFIED MILESTONES BADGES --- */
    function renderBadges(completed, certs) {
        const streakVal = parseInt(localStorage.getItem('streak') || '0');
        const libraryVisited = localStorage.getItem('badge-library-visited') === 'true';
        const plannerScheduled = localStorage.getItem('badge-planner-scheduled') === 'true';
        const perfectScore = localStorage.getItem('badge-perfect-score') === 'true';

        const completedKeys = Object.keys(localStorage).filter(key => key.startsWith('completed-'));
        const csCompleted = completedKeys.filter(k => k.includes('-cs-')).length;
        const mathCompleted = completedKeys.filter(k => k.includes('-math-')).length;

        const badges = [
            { id: "log", name: "First Steps", icon: "fa-sign-in-alt", desc: "Access the learning command center.", unlocked: true },
            { id: "lib", name: "Curious Scholar", icon: "fa-book-reader", desc: "Explore the global resource library.", unlocked: libraryVisited },
            { id: "plan", name: "Planner Scheduled", icon: "fa-calendar-alt", desc: "Schedule a topic in the planner.", unlocked: plannerScheduled },
            { id: "cadet", name: "Academic Cadet", icon: "fa-graduation-cap", desc: "Complete your first lesson.", unlocked: completed >= 1 },
            { id: "mind", name: "Master Mind", icon: "fa-brain", desc: "Score 100% on any topic quiz.", unlocked: perfectScore },
            { id: "streak", name: "Consistent", icon: "fa-fire", desc: "Keep a study streak of 3+ days.", unlocked: streakVal >= 3 },
            { id: "math", name: "Math Virtuoso", icon: "fa-calculator", desc: "Complete 3+ mathematics topics.", unlocked: mathCompleted >= 3 },
            { id: "cs", name: "Code Cadet", icon: "fa-laptop-code", desc: "Complete 3+ computer science topics.", unlocked: csCompleted >= 3 }
        ];

        const grid = document.getElementById('badgesGrid');
        grid.innerHTML = '';
        
        badges.forEach(badge => {
            const el = document.createElement('div');
            el.className = `relative group flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${badge.unlocked ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : 'bg-slate-50 border-slate-100 opacity-40'}`;
            el.innerHTML = `
                <div class="text-2xl mb-1 ${badge.unlocked ? 'text-indigo-600' : 'text-slate-400'}">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <span class="text-[9px] font-extrabold text-slate-800 tracking-tighter truncate w-full">${badge.name}</span>
                
                <!-- Tooltip hover -->
                <div class="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-lg text-[10px] font-medium leading-relaxed w-40 opacity-0 group-hover:opacity-100 transition shadow-xl z-50">
                    <span class="block font-bold mb-0.5">${badge.name}</span>
                    <p class="text-slate-300 font-normal">${badge.desc}</p>
                    <span class="block text-[8px] mt-1 font-bold ${badge.unlocked ? 'text-green-400' : 'text-yellow-400'}">${badge.unlocked ? 'UNLOCKED ✔' : 'LOCKED 🔒'}</span>
                </div>
            `;
            grid.appendChild(el);
        });
    }

    /* --- REAL STREAK CALCULATION BUG FIX --- */
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    let streak = parseInt(localStorage.getItem('streak') || '0');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastVisit === null) {
        streak = 1;
    } else if (lastVisit === today) {
        // Already logged
    } else if (lastVisit === yesterdayStr) {
        streak++;
    } else {
        streak = 1;
    }
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastVisit', today);
    document.getElementById('streakCount').textContent = `${streak} Day Streak`;

    /* --- ENTERPRISE REPORT CARD METRICS SYSTEM --- */
    window.openReportCardModal = () => {
        const name = localStorage.getItem('userName') || 'Scholar Learner';
        document.getElementById('reportStudentName').textContent = name;
        document.getElementById('reportStreak').textContent = `${streak} Day(s)`;
        
        const total = calculateTotalTopics(curriculumData);
        const completedKeys = Object.keys(localStorage).filter(key => key.startsWith('completed-'));
        const completed = completedKeys.length;
        document.getElementById('reportCompletedCount').textContent = `${completed} / ${total} Topics`;

        const certs = Object.keys(localStorage).filter(key => key.startsWith('cert-')).length;
        document.getElementById('reportCertCount').textContent = `${certs} Earned`;

        const scoreKeys = Object.keys(localStorage).filter(key => key.startsWith('score-'));
        let avgScore = 0;
        let letterGrade = "-";
        let gpa = "0.00";
        let remarks = "No academic assessment data available yet. Please complete a curriculum topic quiz from your classroom to generate report metrics.";

        if (scoreKeys.length > 0) {
            let totalScore = 0;
            scoreKeys.forEach(k => {
                totalScore += parseInt(localStorage.getItem(k) || '0');
            });
            avgScore = Math.round(totalScore / scoreKeys.length);
            
            if (avgScore >= 95) {
                letterGrade = "A+"; gpa = "4.00";
                remarks = "Outstanding performance! You are showing exemplary academic mastery and professional cognitive capability. Keep representing the absolute highest standard of the HMG Concepts values.";
            } else if (avgScore >= 85) {
                letterGrade = "A"; gpa = "3.80";
                remarks = "Excellent competence. You have demonstrated clear analytical thinking and core subject comprehension. Keep driving for absolute peak mastery!";
            } else if (avgScore >= 70) {
                letterGrade = "B"; gpa = "3.00";
                remarks = "Good academic progress. You have crossed the mastery benchmark. Minor revisions of missed questions in your active check blocks will unlock elite grading status.";
            } else if (avgScore >= 50) {
                letterGrade = "C"; gpa = "2.00";
                remarks = "Decent effort, but key core conceptual misconceptions remain. We recommend re-reading curriculum texts and utilizing study notebooks before executing quiz attempts.";
            } else {
                letterGrade = "F"; gpa = "0.00";
                remarks = "Academic grading falls below threshold. Diligent focus is required. Please re-engage the learning blocks completely and consult tutors in the HMG ecosystem.";
            }
        }

        document.getElementById('reportAvgScore').textContent = `${avgScore}%`;
        document.getElementById('reportLetterGrade').textContent = letterGrade;
        document.getElementById('reportGPA').textContent = gpa;
        document.getElementById('reportDirectorRemarks').textContent = remarks;
        document.getElementById('reportIssueDate').textContent = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const clsSelVal = classSelect.value ? curriculumData.classes[classSelect.value].name : "JUNIOR SECONDARY";
        document.getElementById('reportCardClass').textContent = clsSelVal.toUpperCase();

        document.getElementById('reportCardModal').classList.remove('hidden');
    };

    window.closeReportCardModal = () => {
        document.getElementById('reportCardModal').classList.add('hidden');
    };

    /* --- DATA VISUALIZATION SVG CHARTS GENERATOR --- */
    function renderSVGAnalyticsCharts() {
        const completedKeys = Object.keys(localStorage).filter(key => key.startsWith('completed-'));
        
        let mathCount = 0, mathCompleted = 0;
        let csCount = 0, csCompleted = 0;
        let sciCount = 0, sciCompleted = 0;

        for (const cl in curriculumData.classes) {
            const subs = curriculumData.classes[cl].subjects;
            for (const sub in subs) {
                const terms = subs[sub].terms;
                for (const t in terms) {
                    terms[t].topics.forEach(topic => {
                        if (sub === 'mathematics') {
                            mathCount++;
                            if (completedKeys.includes(`completed-${topic.id}`)) mathCompleted++;
                        } else if (sub === 'computer_science') {
                            csCount++;
                            if (completedKeys.includes(`completed-${topic.id}`)) csCompleted++;
                        } else if (sub === 'basic_science') {
                            sciCount++;
                            if (completedKeys.includes(`completed-${topic.id}`)) sciCompleted++;
                        }
                    });
                }
            }
        }

        const mathPerc = mathCount === 0 ? 0 : Math.round((mathCompleted / mathCount) * 100);
        const csPerc = csCount === 0 ? 0 : Math.round((csCompleted / csCount) * 100);
        const sciPerc = sciCount === 0 ? 0 : Math.round((sciCompleted / sciCount) * 100);

        const mathHeight = Math.max(5, Math.round(mathPerc * 1.2));
        const csHeight = Math.max(5, Math.round(csPerc * 1.2));
        const sciHeight = Math.max(5, Math.round(sciPerc * 1.2));

        const barChartSvg = `
            <svg class="w-full h-full" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
                <line x1="20" y1="120" x2="220" y2="120" stroke="#cbd5e1" stroke-width="2"/>
                <line x1="20" y1="10" x2="20" y2="120" stroke="#cbd5e1" stroke-width="2"/>
                
                <rect x="40" y="${120 - mathHeight}" width="30" height="${mathHeight}" fill="#3b82f6" rx="4"/>
                <text x="55" y="${115 - mathHeight}" font-size="8" font-weight="bold" fill="#1e3a8a" text-anchor="middle">${mathPerc}%</text>
                <text x="55" y="132" font-size="7" font-weight="bold" fill="#64748b" text-anchor="middle">Math</text>

                <rect x="105" y="${120 - csHeight}" width="30" height="${csHeight}" fill="#10b981" rx="4"/>
                <text x="120" y="${115 - csHeight}" font-size="8" font-weight="bold" fill="#065f46" text-anchor="middle">${csPerc}%</text>
                <text x="120" y="132" font-size="7" font-weight="bold" fill="#64748b" text-anchor="middle">CompSci</text>

                <rect x="170" y="${120 - sciHeight}" width="30" height="${sciHeight}" fill="#f59e0b" rx="4"/>
                <text x="185" y="${115 - sciHeight}" font-size="8" font-weight="bold" fill="#78350f" text-anchor="middle">${sciPerc}%</text>
                <text x="185" y="132" font-size="7" font-weight="bold" fill="#64748b" text-anchor="middle">Science</text>
            </svg>
        `;
        document.getElementById('svgSubjectChartContainer').innerHTML = barChartSvg;

        const scoreKeys = Object.keys(localStorage).filter(key => key.startsWith('score-')).slice(-5);
        if (scoreKeys.length === 0) {
            document.getElementById('svgTrendChartContainer').innerHTML = `
                <div class="text-xs text-slate-400 text-center font-medium italic">
                    <i class="fas fa-chart-line text-2xl mb-1.5 block text-slate-300"></i>
                    Complete a quiz to plot performance graphs.
                </div>
            `;
            return;
        }

        const scores = scoreKeys.map(k => parseInt(localStorage.getItem(k) || '0'));
        while (scores.length < 5) {
            scores.unshift(0);
        }

        const points = [];
        const xStep = 45;
        const xStart = 30;
        scores.forEach((s, idx) => {
            const x = xStart + (idx * xStep);
            const y = 110 - Math.round(s * 0.9);
            points.push({ x, y, score: s });
        });

        let lineD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            lineD += ` L ${points[i].x} ${points[i].y}`;
        }

        let trendSvg = `
            <svg class="w-full h-full" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg">
                <line x1="20" y1="110" x2="220" y2="110" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="20" y1="65" x2="220" y2="65" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="20" y1="20" x2="220" y2="20" stroke="#f1f5f9" stroke-width="1"/>

                <line x1="20" y1="110" x2="220" y2="110" stroke="#cbd5e1" stroke-width="2"/>
                <line x1="20" y1="10" x2="20" y2="110" stroke="#cbd5e1" stroke-width="2"/>

                <path d="${lineD}" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        `;

        points.forEach((p, idx) => {
            trendSvg += `
                <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="#0ea5e9" stroke-width="2"/>
                <text x="${p.x}" y="${p.y - 8}" font-size="7" font-weight="extrabold" fill="#0369a1" text-anchor="middle">${p.score}%</text>
                <text x="${p.x}" y="124" font-size="7" font-weight="bold" fill="#94a3b8" text-anchor="middle">Qz ${idx+1}</text>
            `;
        });

        trendSvg += `</svg>`;
        document.getElementById('svgTrendChartContainer').innerHTML = trendSvg;
    }

    /* --- NATIONAL & REGIONAL LEADERBOARD SYSTEM (Expanded V10) --- */
    function renderLeaderboard() {
        const studentName = localStorage.getItem('userName') || 'Scholar Learner';
        const completedCount = Object.keys(localStorage).filter(key => key.startsWith('completed-')).length;
        const certCount = Object.keys(localStorage).filter(key => key.startsWith('cert-')).length;
        
        const points = (completedCount * 100) + (certCount * 250) + (streak * 50);
        document.getElementById('userPoints').textContent = points;

        const region = document.getElementById('leaderboardStateFilter').value;

        // Base regional competitor database
        let competitors = [];

        if (region === 'national') {
            competitors = [
                { name: "Chinedu Okafor", location: "Lagos, NG", pts: 8400 },
                { name: "Amina Yusuf", location: "Abuja, NG", pts: 7950 },
                { name: "Funke Adebayo", location: "Ibadan, NG", pts: 6900 },
                { name: "Emeka Obi", location: "Enugu, NG", pts: 4800 },
                { name: "Aisha Bello", location: "Kano, NG", pts: 3900 }
            ];
        } else if (region === 'lagos') {
            competitors = [
                { name: "Chinedu Okafor", location: "Ikeja, LG", pts: 8400 },
                { name: "Tunde Alao", location: "Lekki, LG", pts: 6200 },
                { name: "Chioma Nze", location: "Surulere, LG", pts: 4100 }
            ];
        } else if (region === 'abuja') {
            competitors = [
                { name: "Amina Yusuf", location: "Garki, AB", pts: 7950 },
                { name: "Zainab Umar", location: "Wuse, AB", pts: 5500 },
                { name: "Philip Johnson", location: "Maitama, AB", pts: 3800 }
            ];
        } else if (region === 'oyo') {
            competitors = [
                { name: "Funke Adebayo", location: "Bodija, OY", pts: 6900 },
                { name: "Kayode Solarin", location: "RingRoad, OY", pts: 5100 },
                { name: "Bayo Adeniran", location: "Ogbomoso, OY", pts: 3100 }
            ];
        }

        // Add user dynamically
        const userLoc = region === 'national' ? "Virtual Cohort" : `${region.toUpperCase()} Cohort`;
        competitors.push({ name: `${studentName} (You)`, location: userLoc, pts: points, isUser: true });
        competitors.sort((a, b) => b.pts - a.pts);

        const body = document.getElementById('leaderboardBody');
        body.innerHTML = "";

        competitors.forEach((c, idx) => {
            const row = document.createElement('tr');
            row.className = `border-b border-slate-100 font-semibold ${c.isUser ? 'bg-orange-50/50 text-orange-800 border-l-4 border-l-orange-500' : 'text-slate-600'}`;
            row.innerHTML = `
                <td class="p-3 font-extrabold text-slate-800">${idx + 1}</td>
                <td class="p-3 flex items-center gap-2">
                    ${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '👤'))}
                    <span>${c.name}</span>
                </td>
                <td class="p-3 text-[10px] text-slate-400 uppercase font-bold">${c.location}</td>
                <td class="p-3 font-extrabold text-slate-800">${c.pts.toLocaleString()} Pts</td>
            `;
            body.appendChild(row);
        });
    }

    /* --- PWA OFFLINE SELF-DIAGNOSTICS PANEL (New V10 Feature!) --- */
    window.runPwaSelfDiagnostics = (silent = false) => {
        const dNetwork = document.getElementById('diagNetwork');
        const dCache = document.getElementById('diagCache');
        const dBuffer = document.getElementById('diagBuffer');

        const isOnline = navigator.onLine;
        dNetwork.textContent = isOnline ? "ONLINE 🟢" : "OFFLINE 🔴";
        dNetwork.className = isOnline ? "text-green-400 font-bold" : "text-red-400 font-bold";

        const hasSW = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
        dCache.textContent = hasSW ? "READY ✔" : "UNREGISTERED ⏳";
        dCache.className = hasSW ? "text-green-400 font-bold" : "text-yellow-400 font-bold";

        // Local storage buffer task size
        const tasksBuffer = JSON.parse(localStorage.getItem('hmg_planner_tasks') || '[]').length;
        dBuffer.textContent = `${tasksBuffer} Task(s)`;
        dBuffer.className = tasksBuffer > 0 ? "text-teal-400 font-bold" : "text-slate-400 font-bold";

        if (!silent) {
            alert(`HMG Learnhub Self-Audit Report:\n--------------------------\n1. Connection state: ${isOnline ? 'Online 🟢' : 'Offline 🔴 (Fallback Active)'}\n2. Service worker offline cache: ${hasSW ? 'Ready ✔' : 'Registering...'}\n3. Study Planner schedule: ${tasksBuffer} task(s) active.`);
        }
    };

    /* --- DIGITAL CERTIFICATE DECRYPTION VERIFIER --- */
    window.openVerificationModal = () => {
        document.getElementById('verificationResult').classList.add('hidden');
        document.getElementById('certSerialInput').value = "";
        document.getElementById('verificationModal').classList.remove('hidden');
    };
    window.closeVerificationModal = () => {
        document.getElementById('verificationModal').classList.add('hidden');
    };
    
    window.verifyCertificateCode = (codeOverride) => {
        const input = codeOverride || document.getElementById('certSerialInput').value.trim();
        const res = document.getElementById('verificationResult');
        res.classList.remove('hidden');
        res.innerHTML = "";

        if (!input.startsWith("HMG-CERT-")) {
            res.innerHTML = `
                <div class="text-red-600 font-bold flex items-center gap-1">
                    <i class="fas fa-times-circle"></i> VERIFICATION FAILED
                </div>
                <p class="text-slate-500 mt-1">Legitimate HMG Academy certificate signatures must start with 'HMG-CERT-'. Please check the code formatting and re-submit.</p>
            `;
            res.className = "p-4 rounded-xl border border-red-200 bg-red-50 text-xs leading-relaxed";
            return;
        }

        try {
            const parts = input.split('-');
            const hash = parts[parts.length - 1];
            const topicId = parts.slice(2, -1).join('-');

            const decoded = atob(hash);
            const [name, score, date] = decoded.split('|');

            if (!name || !score || !date) throw new Error("Format Corrupted");

            res.innerHTML = `
                <div class="text-green-600 font-bold flex items-center gap-1 mb-2">
                    <i class="fas fa-check-circle"></i> OFFICIAL CREDENTIAL VERIFIED
                </div>
                <div class="space-y-1.5 text-slate-700">
                    <div><strong class="text-slate-400">Awarded Scholar:</strong> ${name}</div>
                    <div><strong class="text-slate-400">Mastery Grade Score:</strong> ${score}% (HONOURS)</div>
                    <div><strong class="text-slate-400">Subject Course Code:</strong> ${topicId.toUpperCase()}</div>
                    <div><strong class="text-slate-400">Official Date Issued:</strong> ${date}</div>
                </div>
                <div class="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-2 mt-2">
                    Verified Digital Signature • HMG concepts Academic Board
                </div>
            `;
            res.className = "p-4 rounded-xl border border-green-200 bg-green-50 text-xs leading-relaxed";
            
            document.getElementById('verificationModal').classList.remove('hidden');
            document.getElementById('certSerialInput').value = input;
        } catch (e) {
            res.innerHTML = `
                <div class="text-red-600 font-bold flex items-center gap-1">
                    <i class="fas fa-exclamation-triangle"></i> CORRUPTED SECURITY HASH
                </div>
                <p class="text-slate-500 mt-1">The security hash attached to this certificate is corrupt, invalid, or has been manually altered. Credential status is unverified.</p>
            `;
            res.className = "p-4 rounded-xl border border-red-200 bg-red-50 text-xs leading-relaxed";
        }
    };

    /* --- MOCK EXAM SIMULATOR SYSTEM (Parallel Static Fetch with Review Panel) --- */
    let mockQuestions = [];
    let currentMockIdx = 0;
    let mockAnswers = [];
    let examTimerInterval = null;
    let secondsLeft = 900;

    window.openMockExamModal = () => {
        clearInterval(examTimerInterval);
        document.getElementById('mockIntroScreen').classList.remove('hidden');
        document.getElementById('mockExamScreen').classList.add('hidden');
        document.getElementById('mockResultsScreen').classList.add('hidden');
        document.getElementById('mockExamCloseBtn').classList.remove('hidden');
        document.getElementById('reportCardModal').classList.add('hidden');
        document.getElementById('mockExamModal').classList.remove('hidden');
    };

    window.closeMockExamModal = () => {
        clearInterval(examTimerInterval);
        document.getElementById('mockExamModal').classList.add('hidden');
    };

    window.startMockExam = async () => {
        const intro = document.getElementById('mockIntroScreen');
        intro.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-slate-600 font-bold">Assembling random curriculum questions...</p>
                <span class="text-xs text-slate-400 block mt-1">Parallel fetching high-fidelity topics</span>
            </div>
        `;

        try {
            const ids = [];
            for (const cl in curriculumData.classes) {
                const subjects = curriculumData.classes[cl].subjects;
                for (const sub in subjects) {
                    const terms = subjects[sub].terms;
                    for (const t in terms) {
                        terms[t].topics.forEach(topic => {
                            ids.push({ id: topic.id, subName: subjects[sub].name, clName: curriculumData.classes[cl].name });
                        });
                    }
                }
            }

            const picked = ids.sort(() => 0.5 - Math.random()).slice(0, 15);

            const loadedData = await Promise.all(picked.map(item => 
                fetch(`data/curriculum/topics/${item.id}.json`).then(r => r.json())
            ));

            mockQuestions = loadedData.map((data, idx) => {
                const questionsList = data.assessment.questions;
                const pickedQuestion = questionsList[Math.floor(Math.random() * questionsList.length)];
                return {
                    question: pickedQuestion.question,
                    subAndCl: `${picked[idx].subName} - ${picked[idx].clName}`,
                    options: pickedQuestion.options,
                    answer: pickedQuestion.answer,
                    objectives: data.learning_objectives || [],
                    explanation: pickedQuestion.explanation || `The correct option represents the mathematically and scientifically proven value matching HMG Concepts core curriculum guidelines.`
                };
            });

            currentMockIdx = 0;
            mockAnswers = Array(15).fill(undefined);
            secondsLeft = 900;

            intro.classList.add('hidden');
            document.getElementById('mockExamScreen').classList.remove('hidden');
            document.getElementById('mockExamCloseBtn').classList.add('hidden');

            renderMockQuestion();
            startMockTimer();

        } catch (e) {
            console.error(e);
            alert("Error initializing mock exam questions.");
            openMockExamModal();
        }
    };

    function startMockTimer() {
        const timerText = document.getElementById('mockTimer');
        examTimerInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
                clearInterval(examTimerInterval);
                alert("Time has officially expired! Auto-submitting your examination script.");
                submitMockExam();
                return;
            }

            const m = Math.floor(secondsLeft / 60);
            const s = secondsLeft % 60;
            timerText.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function renderMockQuestion() {
        const q = mockQuestions[currentMockIdx];
        document.getElementById('mockQuestionTracker').textContent = `Question ${currentMockIdx + 1}/15`;
        document.getElementById('mockQuestionText').textContent = `[${q.subAndCl}] ${q.question}`;

        const grid = document.getElementById('mockOptionsGrid');
        grid.innerHTML = "";

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `p-4 text-left border rounded-2xl transition font-semibold text-sm ${mockAnswers[currentMockIdx] === idx ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-700'}`;
            btn.textContent = opt;
            btn.onclick = () => {
                mockAnswers[currentMockIdx] = idx;
                renderMockQuestion();
            };
            grid.appendChild(btn);
        });

        document.getElementById('mockPrevBtn').classList.toggle('invisible', currentMockIdx === 0);
        document.getElementById('mockNextBtn').innerHTML = currentMockIdx === 14 ? 'Submit Exam <i class="fas fa-flag"></i>' : 'Next <i class="fas fa-chevron-right"></i>';
    }

    window.nextMockQuestion = () => {
        if (mockAnswers[currentMockIdx] === undefined) {
            alert("Please pick an option before moving forward.");
            return;
        }
        if (currentMockIdx < 14) {
            currentMockIdx++;
            renderMockQuestion();
        } else {
            submitMockExam();
        }
    };

    window.prevMockQuestion = () => {
        if (currentMockIdx > 0) {
            currentMockIdx--;
            renderMockQuestion();
        }
    };

    function submitMockExam() {
        clearInterval(examTimerInterval);
        document.getElementById('mockExamScreen').classList.add('hidden');
        const results = document.getElementById('mockResultsScreen');
        results.classList.remove('hidden');
        document.getElementById('mockExamCloseBtn').classList.remove('hidden');

        let correct = 0;
        mockQuestions.forEach((q, idx) => {
            if (mockAnswers[idx] === q.answer) correct++;
        });

        const percent = Math.round((correct / 15) * 100);
        document.getElementById('mockScoreText').textContent = `Score: ${percent}%`;

        const icon = document.getElementById('mockScoreIcon');
        const msg = document.getElementById('mockScoreMsg');

        if (percent >= 90) {
            icon.textContent = "🏆";
            msg.textContent = "Exemplary performance! You have passed the global mock exam with absolute honors. Excellent versatility across subjects.";
        } else if (percent >= 70) {
            icon.textContent = "🌟";
            msg.textContent = "Successful pass! You are well-positioned for national examinations. Keep polishing minor topics.";
        } else {
            icon.textContent = "📚";
            msg.textContent = "Pass threshold missed. We suggest reviewing study notebooks, running active recall cards, and retrying again.";
        }

        const reviewsContainer = document.getElementById('mockReviewsContainer');
        reviewsContainer.innerHTML = "";
        
        mockQuestions.forEach((q, idx) => {
            const isCorrect = mockAnswers[idx] === q.answer;
            const reviewRow = document.createElement('div');
            reviewRow.className = `p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-100'}`;
            reviewRow.innerHTML = `
                <div class="flex justify-between items-center font-bold">
                    <span class="${isCorrect ? 'text-green-800' : 'text-red-800'}">Question ${idx + 1} (${q.subAndCl})</span>
                    <span class="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                <p class="font-semibold text-slate-800">${q.question}</p>
                <div class="space-y-1">
                    <div><strong>Your choice:</strong> <span class="${isCorrect ? 'text-green-600' : 'text-red-500'}">${q.options[mockAnswers[idx]]}</span></div>
                    ${!isCorrect ? `<div><strong>Correct answer:</strong> <span class="text-green-600 font-bold">${q.options[q.answer]}</span></div>` : ''}
                </div>
                <div class="border-t border-dashed mt-2 pt-2 text-[10px] text-slate-500 italic">
                    <strong>Review Lesson Guidance:</strong> ${q.explanation}
                </div>
            `;
            reviewsContainer.appendChild(reviewRow);
        });
    }

    /* --- CURRICULUM SYLLABUS PERFORMANCE LEDGER EXPORT --- */
    window.exportCompleteSyllabusProgress = () => {
        const studentName = localStorage.getItem('userName') || 'Scholar Learner';
        let printWindow = window.open('', '_blank');
        
        let html = `
            <html>
            <head>
                <title>HMG Academy Syllabus Progress Report</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
                    h1 { color: #1e3a8a; margin: 0 0 5px 0; }
                    .header { border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .student-info { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #f1f5f9; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                    th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; }
                    .badge { padding: 3px 8px; border-radius: 9999px; font-size: 9px; font-weight: bold; }
                    .badge-done { background-color: #dcfce7; color: #15803d; }
                    .badge-todo { background-color: #f1f5f9; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>HMG ACADEMY</h1>
                        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Ecosystem of Learning Excellence</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin:0; font-weight:bold;">Syllabus Performance Ledger</p>
                        <p style="margin:0; font-size: 11px; color:#64748b;">Issued: ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="student-info">
                    <p style="margin: 0 0 5px 0;"><strong>Student Name:</strong> ${studentName}</p>
                    <p style="margin: 0;"><strong>Institution:</strong> HMG Academy Virtual Cohort</p>
                </div>

                <h2>Full 54-Topic Syllabus Audit</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Class Level</th>
                            <th>Subject</th>
                            <th>Term</th>
                            <th>Topic Title</th>
                            <th>Status</th>
                            <th>Highest Quiz Score</th>
                            <th>Certificate</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (const classId in curriculumData.classes) {
            const classObj = curriculumData.classes[classId];
            for (const subId in classObj.subjects) {
                const subObj = classObj.subjects[subId];
                for (const termId in subObj.terms) {
                    const termObj = subObj.terms[termId];
                    termObj.topics.forEach(topic => {
                        const isCompleted = localStorage.getItem(`completed-${topic.id}`) === 'true';
                        const score = localStorage.getItem(`score-${topic.id}`) || '-';
                        const hasCert = localStorage.getItem(`cert-${topic.id}`) === 'true';
                        
                        html += `
                            <tr>
                                <td>${classObj.name}</td>
                                <td>${subObj.name}</td>
                                <td>${termObj.name}</td>
                                <td><strong>${topic.title}</strong></td>
                                <td>
                                    <span class="badge ${isCompleted ? 'badge-done' : 'badge-todo'}">
                                        ${isCompleted ? 'Completed ✔' : 'Not Started'}
                                    </span>
                                </td>
                                <td><strong>${score !== '-' ? score + '%' : '-'}</strong></td>
                                <td>${hasCert ? 'Earned 🎖' : '-'}</td>
                            </tr>
                        `;
                    });
                }
            }
        }

        html += `
                    </tbody>
                </table>
                <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    Accredited Syllabus Progress Sheet • HMG Concepts EdTech Concepts 2026
                </div>
                <script>window.print();<\/script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Check if URL parameters have verification requests
    const urlParams = new URLSearchParams(window.location.search);
    const verifyCode = urlParams.get('verify');
    if (verifyCode) {
        verifyCertificateCode(verifyCode);
    }

    // Monitor online/offline state change dynamically!
    window.addEventListener('online', () => runPwaSelfDiagnostics(true));
    window.addEventListener('offline', () => runPwaSelfDiagnostics(true));

    updateProfileUI();
    updateAnalytics();
}

document.addEventListener('DOMContentLoaded', loadDashboard);
