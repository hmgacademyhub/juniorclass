async function loadLesson() {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('id');
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

    try {
        const response = await fetch(`data/curriculum/topics/${topicId}.json`);
        if (!response.ok) throw new Error('Lesson not found');
        const data = await response.json();

        breadcrumb.textContent = `${data.class} | ${data.subject} | ${data.term}`;
        lessonTitle.textContent = data.title;

        if (data.learning_objectives) {
            objectivesSection.classList.remove('hidden');
            objectivesList.innerHTML = data.learning_objectives.map(obj => 
                `<li class="flex items-start gap-3"><i class="fas fa-check-circle mt-1"></i> ${obj}</li>`
            ).join('');
        }

        if (data.key_vocabulary) {
            vocabSection.classList.remove('hidden');
            vocabGrid.innerHTML = data.key_vocabulary.map(item => `
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
                    <span class="block font-extrabold text-blue-600 mb-1">${item.term}</span>
                    <span class="text-slate-600 text-sm">${item.definition}</span>
                </div>
            `).join('');
        }

        lessonContent.innerHTML = '';
        data.content.forEach(block => {
            const element = document.createElement('div');
            element.className = 'mb-10';

            if (block.type === 'heading') {
                element.innerHTML = `<h2 class="text-3xl font-extrabold text-slate-800 mb-6">${block.text}</h2>`;
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
                            <i class="fas fa-arrow-right text-blue-500 mt-1"></i> ${item}
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
                                <button onclick="checkKC(this, ${idx === block.answer})" class="text-left p-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition font-medium">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                        <div id="kc-feedback" class="hidden mt-6 p-4 rounded-xl bg-blue-500/20 text-blue-300 italic text-sm">
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
    }

    window.checkKC = (btn, isCorrect) => {
        const parent = btn.parentElement;
        const buttons = parent.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);
        if (isCorrect) btn.classList.add('bg-green-600', 'border-green-600', 'text-white');
        else btn.classList.add('bg-red-600', 'border-red-600', 'text-white');
        const feedback = parent.nextElementSibling;
        if (feedback && feedback.id === 'kc-feedback') feedback.classList.remove('hidden');
    };

    function updateCompleteButtonState() {
        markCompleteBtn.innerHTML = `<i class="fas fa-check-double mr-2"></i> Completed`;
        markCompleteBtn.className = 'bg-green-100 text-green-700 px-8 py-3 rounded-full font-bold border border-green-200 cursor-default shadow-sm';
        markCompleteBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', loadLesson);
