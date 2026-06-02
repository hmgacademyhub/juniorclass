async function loadLibrary() {
    const libraryGrid = document.getElementById('libraryGrid');
    const librarySearch = document.getElementById('librarySearch');
    let curriculumData = null;

    try {
        const response = await fetch('data/curriculum/map.json');
        curriculumData = await response.json();
        renderLibrary(curriculumData);
    } catch (error) {
        console.error('Error loading library:', error);
    }

    function renderLibrary(data, filter = '') {
        libraryGrid.innerHTML = '';
        const query = filter.toLowerCase();

        for (const classId in data.classes) {
            const className = data.classes[classId].name;
            for (const subId in data.classes[classId].subjects) {
                const subjectName = data.classes[classId].subjects[subId].name;
                for (const termId in data.classes[classId].subjects[subId].terms) {
                    const topics = data.classes[classId].subjects[subId].terms[termId].topics;
                    topics.forEach(topic => {
                        if (topic.title.toLowerCase().includes(query) || subjectName.toLowerCase().includes(query)) {
                            const card = document.createElement('div');
                            card.className = 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group cursor-pointer';
                            card.innerHTML = `
                                <div class="flex items-start justify-between mb-4">
                                    <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">${className} | ${subjectName}</span>
                                    <i class="fas fa-book-open text-slate-300 group-hover:text-blue-500 transition"></i>
                                </div>
                                <h4 class="text-lg font-bold text-slate-800 mb-2">${topic.title}</h4>
                                <p class="text-sm text-slate-500 mb-6 line-clamp-2">${topic.description}</p>
                                <a href="lesson.html?id=${topic.id}" class="block text-center bg-slate-100 text-slate-700 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition">
                                    Study Now <i class="fas fa-arrow-right ml-1"></i>
                                </a>
                            `;
                            libraryGrid.appendChild(card);
                        }
                    });
                }
            }
        }
    }

    librarySearch.addEventListener('input', (e) => renderLibrary(curriculumData, e.target.value));
}

document.addEventListener('DOMContentLoaded', loadLibrary);
