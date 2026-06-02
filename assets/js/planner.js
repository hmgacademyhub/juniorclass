function loadPlanner() {
    const plannerList = document.getElementById('plannerList');
    let tasks = JSON.parse(localStorage.getItem('hmg_planner_tasks') || '[]');

    function render() {
        plannerList.innerHTML = '';
        if (tasks.length === 0) {
            plannerList.innerHTML = `
                <div class="text-center py-12 text-slate-400">
                    <i class="fas fa-calendar-alt text-4xl mb-4 block"></i>
                    <p>Your plan is empty. Start by adding a topic you want to study!</p>
                </div>
            `;
            return;
        }
        tasks.forEach((task, idx) => {
            const item = document.createElement('div');
            item.className = `flex items-center justify-between p-5 rounded-2xl border transition-all ${task.done ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`;
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <button onclick="toggleTask(${idx})" class="w-6 h-6 rounded-full border-2 ${task.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'} flex items-center justify-center transition">
                        ${task.done ? '<i class="fas fa-check text-xs"></i>' : ''}
                    </button>
                    <span class="font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}">${task.text}</span>
                </div>
                <button onclick="deleteTask(${idx})" class="text-slate-300 hover:text-red-500 transition">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            plannerList.appendChild(item);
        });
    }

    window.addTask = () => {
        const input = document.getElementById('taskInput');
        if (!input.value.trim()) return;
        tasks.push({ text: input.value.trim(), done: false });
        localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
        input.value = '';
        render();
    };

    window.toggleTask = (idx) => {
        tasks[idx].done = !tasks[idx].done;
        localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
        render();
    };

    window.deleteTask = (idx) => {
        tasks.splice(idx, 1);
        localStorage.setItem('hmg_planner_tasks', JSON.stringify(tasks));
        render();
    };

    render();
}

document.addEventListener('DOMContentLoaded', loadPlanner);
