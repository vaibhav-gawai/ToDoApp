// app.js - Main application logic

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const currentDateEl = document.querySelector('.current-date');
const progressText = document.querySelector('.progress-text');
const progressFill = document.querySelector('.progress-fill');

// Today's date and day
const today = new Date();
const todayName = Utils.getDayName(today).toLowerCase();

// Add these variables at the top
let currentViewDay = Utils.getDayName(today).toLowerCase();
let currentViewDate = today;
// Initialize the application
async function init() {
    // Initialize tasks in localStorage
    await Storage.initializeTasks();
    
    // Load today's tasks
    loadDayTasks(todayName);
    
    // Set up event listeners
    setupEventListeners();
    
    // Update current date display
    updateCurrentDate();

    setupSettings();
}

// Load tasks for a specific day
async function loadDayTasks(day) {
    const tasks = await Storage.getDayTasks(day);
    renderTasks(tasks);
    updateProgress(tasks);
}



// Add this function to update the day view
function updateDayView(dayName) {
  currentViewDay = dayName;
  currentViewDate = Utils.getDateForDay(dayName);
  loadDayTasks(dayName);
  updateCurrentDate();
}

// Modify updateCurrentDate function
function updateCurrentDate() {
  if (currentDateEl) {
    const dayTitle = currentViewDay === todayName.toLowerCase() ? 'Today' : Utils.formatDate(currentViewDate);
    currentDateEl.textContent = dayTitle;
  }
}

// Add these handlers
function handleNextDay() {
  const nextDay = Utils.getNextDay(currentViewDay);
  if (nextDay) {
    updateDayView(nextDay);
  }
}

function handlePrevDay() {
  const prevDay = Utils.getPrevDay(currentViewDay);
  if (prevDay) {
    updateDayView(prevDay);
  }
}


// Render tasks to the DOM
function renderTasks(tasks) {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        if (emptyState) emptyState.classList.add('visible');
        return;
    }
    
    if (emptyState) emptyState.classList.remove('visible');
    
    // Sort tasks: incomplete first, completed last
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
    });
    
    sortedTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        taskItem.style.animationDelay = `${index * 0.05}s`;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="action-btn tomorrow-btn" title="Move to tomorrow">→</button>
                <button class="action-btn day-after-btn" title="Move to day after">→→</button>
                <button class="action-btn delete-btn" title="Delete">×</button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
        
        // Add event listeners to the new task
        const checkbox = taskItem.querySelector('.task-checkbox');
        const tomorrowBtn = taskItem.querySelector('.tomorrow-btn');
        const dayAfterBtn = taskItem.querySelector('.day-after-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => handleTaskToggle(task.id));
        tomorrowBtn.addEventListener('click', () => handleMoveTask(task.id, 1));
        dayAfterBtn.addEventListener('click', () => handleMoveTask(task.id, 2));
        deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));
    });
}

// Update progress display
function updateProgress(tasks) {
    if (!progressText || !progressFill) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    progressText.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
    progressFill.style.width = `${progress}%`;
}


// Handle adding a new task
async function handleAddTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const newTask = await Storage.addTask(todayName, text);
    if (newTask) {
        await loadDayTasks(todayName);
        taskInput.value = '';
        taskInput.focus();
    }
}

// Handle task toggle (complete/incomplete)
async function handleTaskToggle(taskId) {
    const toggled = await Storage.toggleTask(todayName, taskId);
    if (toggled) {
        await loadDayTasks(todayName);
    }
}

// Handle moving a task to another day
async function handleMoveTask(taskId, offset) {
    const moved = await Storage.moveTask(todayName, taskId, offset);
    if (moved) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.classList.add('exiting');
            setTimeout(() => {
                loadDayTasks(todayName);
            }, 300);
        }
    }
}

// Handle deleting a task
async function handleDeleteTask(taskId) {
    const deleted = await Storage.deleteTask(todayName, taskId);
    if (deleted) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.classList.add('exiting');
            setTimeout(() => {
                loadDayTasks(todayName);
            }, 300);
        }
    }
}

// Set up event listeners
async function setupEventListeners() {
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', await handleAddTask);
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddTask();
            }
        });
    }
    
    // Debounce resize events for performance
    window.addEventListener('resize', Utils.debounce(() => {
        // Handle any responsive behavior
    }, 100));
    const nextDayBtn = document.querySelector('.next-day');
    const prevDayBtn = document.querySelector('.prev-day');

    if (nextDayBtn) nextDayBtn.addEventListener('click', handleNextDay);
  if (prevDayBtn) prevDayBtn.addEventListener('click', handlePrevDay);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Week view rendering function
function renderWeekView() {
    const weekGrid = document.getElementById('week-grid');
    if (!weekGrid) return;
    
    weekGrid.innerHTML = '';
    
    const weekDates = Utils.getWeekDates();
    const weekTasks = Storage.getWeekTasks();
    
    weekDates.forEach((date, index) => {
        const dayName = Utils.getDayName(date).toLowerCase();
        const shortDayName = Utils.getShortDayName(date);
        const tasks = weekTasks[dayName] || [];
        
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.day = dayName;
        
        dayCard.innerHTML = `
            <div class="day-card-header">
                <div class="day-card-title">${shortDayName}</div>
                <div class="day-card-count">${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <ul class="day-card-tasks">
                ${tasks.slice(0, 3).map(task => `
                    <li class="day-card-task ${task.completed ? 'completed' : ''}">
                        <span class="day-card-task-checkbox">${task.completed ? '✓' : '○'}</span>
                        ${task.text}
                    </li>
                `).join('')}
                ${totalTasks > 3 ? `<li class="day-card-task">+${totalTasks - 3} more</li>` : ''}
                ${totalTasks === 0 ? `<li class="day-card-task">No tasks</li>` : ''}
            </ul>
        `;
        
        weekGrid.appendChild(dayCard);
    });
}

// Expose renderWeekView for week.html
if (typeof window !== 'undefined') {
    window.renderWeekView = renderWeekView;
}

// Add these functions
function setupSettings() {
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.querySelector('.close-settings');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const colorOptions = document.querySelectorAll('.color-option');
    const secondaryColorOptions = document.querySelectorAll('.secondary-color-option');
    
    
    // Load saved settings
    loadSettings();
    
    // Toggle modal
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
      });
    }
    
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('active');
      });
    }
    
    // Dark mode toggle
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
      });
    }
    
    // Color theme selection
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const color = option.dataset.color;
        document.documentElement.style.setProperty('--primary', color);
        localStorage.setItem('themeColor', color);
        
        // Update active state
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });

    // secondary color options
    secondaryColorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const color = option.dataset.color;
                    document.documentElement.style.setProperty('--secondary', color);
                    localStorage.setItem('secondaryColor', color);
                    
                    // Update active state
                    secondaryColorOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                });
            });
}
  
function loadSettings() {
    // Dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
      const toggle = document.getElementById('dark-mode-toggle');
      if (toggle) toggle.checked = true;
    }
    
    // Theme color
    const savedColor = localStorage.getItem('themeColor') || '#5e60ce';
    document.documentElement.style.setProperty('--primary', savedColor);
    
    // Set active color option
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      if (option.dataset.color === savedColor) {
        option.classList.add('active');
      }
    });
}

