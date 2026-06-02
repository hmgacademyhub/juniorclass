let tasks = [];
let currentDate = new Date(2026, 5, 2); // default lock to June 2, 2026

async function loadPlanner() {
    tasks = JSON.parse(localStorage.getItem('hmg_planner_tasks') || '[]');

    // Set default Date picker input to today's locked calendar date (2026-06-02)
    document.getElementById('taskDate').value = "2026-06-02";

    // 1. Load curriculum map to populate topics selector dropdown (54 Topics!)
    try {
        const response = await fetch('data/curriculum/map.json');
        const data = await response.json();
        const select = document.getElementById('curriculumTopicSelect');
        
        for (const classId in data.classes) {
            const className = data.classes[classId].name;
            const subjects = data.classes[classId].subjects;
            for (const subId in subjects) {
                const subjectName = subjects[subId].name;
                for (const termId in subjects[subId].terms) {
                    const topicsList = subjects[subId].terms[termId].topics;
                    topicsList.forEach(topic => {
                        const opt = document.createElement('option');
                        opt.value = `Study Concept: ${topic.title} (${subjectName} - ${className})`;
                        opt.textContent = `[${className.split(' ')[0]} - ${subjectName}] ${topic.title}`;
                        select.appendChild(opt);
                    });
                }
            }
        }
    } catch (e) {
        console.error("Error populating curriculum dropdown:", e);
    }

    // 2. Render Calendar Grid & Task lists
    renderCalendar();
    renderTaskList();
}

/* --- programmatic visual MONTH CALENDAR GENERATOR --- */
function renderCalendar() {
    const grid = document.getElementById('calendarDaysGrid');
    const monthLabel = document.getElementById('calendarMonthLabel');
    grid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set header month/year label
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthLabel.textContent = `${months[month]} ${year}`;

    // Get first day of the month and total days
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Get total days in previous month for padded prefix cells
    const prevTotalDays = new Date(year, month, 0).getDate();

    // Draw prefix day cells from previous month (disabled)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.className = "calendar-day day-empty text-slate-300 bg-slate-50 border border-transparent";
        cell.innerHTML = `<span>${prevTotalDays - i}</span>`;
        grid.appendChild(cell);
    }

    // Draw actual active month days
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        const cellDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Check if this day has tasks scheduled
        const hasTask = tasks.some(t => t.date === cellDateStr);

        cell.className = `calendar-day day-active ${hasTask ? 'day-has-task' : ''}`;
        cell.innerHTML = `
            <span class="block">${day}</span>
            ${hasTask ? '<span class="w-1.5 h-1.5 rounded-full bg-blue-500 self-end"></span>' : ''}
        `;
        cell.onclick = () => showDayDetails(cellDateStr, day, months[month], year);
        grid.appendChild(cell);
    }
}

window.changeMonth = (step) => {
    currentDate.setMonth(currentDate.getMonth() + step);
    renderCalendar();
};

function showDayDetails(dateStr, dayNum, monthName, year) {
    const card = document.getElementById('dayDetailsCard');
    const label = document.getElementById('detailsDateLabel');
    const container = document.getElementById('dayTasksContainer');

    label.textContent = `${monthName} ${dayNum}, ${year}`;
    
    // Filter tasks for that day
    const dayTasks = tasks.filter(t => t.date === dateStr);
    container.innerHTML = "";

    if (dayTasks.length === 0) {
        container.innerHTML = `<p class="text-slate-400 font-normal italic">No academic tasks scheduled for this day.</p>`;
    } else {
        dayTasks.forEach(t => {
            container.innerHTML += `
                <div class="flex items-center gap-2">
                    <i class="fas ${t.done ? 'fa-check-circle text-green-500' : 'fa-hourglass-half text-blue-500'}"></i>
                    <span class="${t.done ? 'line-through text-slate-400' : 'font-semibold'}">${t.text}</span>
                </div>
            `;
        });
    }
    card.classList.remove('hidden');
}

/* --- STANDARD TASK SCHEDULER ACTIONS --- */
window.addTask = () => {
    const select = document.getElementById('curriculumTopicSelect');
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskDate');

    let text = "";
    if (select.value) {
        text = select.value;
    } else if (input.value.trim()) {
        text = input.value.trim();
    } else {
        alert("Please select a syllabus topic or enter a custom task description!");
        return;
    }

    if (!dateInput.value) {
        alert("Please choose a valid calendar date!");
        return;
    }

    tasks.push({
        text: text,
        date: dateInput.value,
        done: false
    });

    localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
    localStorage.setItem('badge-planner-scheduled', 'true'); // Badge unlocked

    // Reset inputs
    select.value = "";
    input.value = "";
    
    renderCalendar();
    renderTaskList();
    
    // Smooth check
    const parts = dateInput.value.split('-');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    showDayDetails(dateInput.value, parseInt(parts[2]), months[parseInt(parts[1]) - 1], parseInt(parts[0]));
};

function renderTaskList() {
    const list = document.getElementById('plannerList');
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        list.innerHTML = `
            <div class="text-center py-8 text-slate-400 text-xs">
                <i class="fas fa-calendar-alt text-2xl mb-2 block"></i>
                <p>Your scheduled backlog is empty.</p>
            </div>
        `;
        return;
    }

    tasks.forEach((task, idx) => {
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-3.5 rounded-2xl border text-xs ${task.done ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`;
        item.innerHTML = `
            <div class="flex items-center gap-3 w-4/5">
                <button onclick="toggleTask(${idx})" class="w-5 h-5 rounded-full border-2 ${task.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'} flex items-center justify-center transition flex-shrink-0">
                    ${task.done ? '<i class="fas fa-check text-[9px]"></i>' : ''}
                </button>
                <div class="truncate">
                    <span class="font-extrabold ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}">${task.text}</span>
                    <span class="block text-[9px] text-slate-400 mt-0.5"><i class="fas fa-calendar-day mr-1"></i>${task.date}</span>
                </div>
            </div>
            <button onclick="deleteTask(${idx})" class="text-slate-300 hover:text-red-500 transition">
                <i class="fas fa-trash text-sm"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

window.toggleTask = (idx) => {
    tasks[idx].done = !tasks[idx].done;
    localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
    renderCalendar();
    renderTaskList();
};

window.deleteTask = (idx) => {
    tasks.splice(idx, 1);
    localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
    renderCalendar();
    renderTaskList();
    document.getElementById('dayDetailsCard').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', loadPlanner);
