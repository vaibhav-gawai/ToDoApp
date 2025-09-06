// storage.js - Using Utils from utils.js

const Storage = (function() {
    const STORAGE_KEY = 'luminous-planner-tasks';

    // Initialize tasks for the current week
    function initializeTasks() {
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());
        
        let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        
        // Ensure all days have an array
        dayNames.forEach(day => {
            if (!tasks[day]) {
                tasks[day] = [];
            }
        });
        
        // Clean up old days not in current week
        Object.keys(tasks).forEach(day => {
            if (!dayNames.includes(day)) {
                delete tasks[day];
            }
        });
        
        saveTasks(tasks);
        return tasks;
    }

    // Save tasks to localStorage
    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Get tasks for a specific day
    function getDayTasks(day) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        return tasks[day] || [];
    }

    // Get all tasks for the week
    function getWeekTasks() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());
        
        const weekTasks = {};
        dayNames.forEach(day => {
            weekTasks[day] = tasks[day] || [];
        });
        
        return weekTasks;
    }

    // Add a new task
    function addTask(day, text) {
        if (!text.trim()) return;
        
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        if (!tasks[day]) tasks[day] = [];
        
        const newTask = {
            id: Utils.generateId(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks[day].push(newTask);
        saveTasks(tasks);
        return newTask;
    }

    // Toggle task completion status
    function toggleTask(day, taskId) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        if (!tasks[day]) return false;
        
        const taskIndex = tasks[day].findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;
        
        tasks[day][taskIndex].completed = !tasks[day][taskIndex].completed;
        saveTasks(tasks);
        return true;
    }

    // Delete a task
    function deleteTask(day, taskId) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        if (!tasks[day]) return false;
        
        const initialLength = tasks[day].length;
        tasks[day] = tasks[day].filter(task => task.id !== taskId);
        
        if (tasks[day].length !== initialLength) {
            saveTasks(tasks);
            return true;
        }
        
        return false;
    }

    // Move task to another day
    function moveTask(currentDay, taskId, offset) {
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());
        const currentDayIndex = dayNames.indexOf(currentDay);
        
        if (currentDayIndex === -1 || currentDayIndex + offset >= dayNames.length) {
            return false;
        }
        
        const targetDay = dayNames[currentDayIndex + offset];
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        
        if (!tasks[currentDay]) return false;
        
        const taskIndex = tasks[currentDay].findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;
        
        const task = tasks[currentDay][taskIndex];
        task.completed = false; // Reset completion when moving
        
        // Remove from current day
        tasks[currentDay].splice(taskIndex, 1);
        
        // Add to target day
        if (!tasks[targetDay]) tasks[targetDay] = [];
        tasks[targetDay].push(task);
        
        saveTasks(tasks);
        return true;
    }

    return {
        initializeTasks,
        getDayTasks,
        getWeekTasks,
        addTask,
        toggleTask,
        deleteTask,
        moveTask
    };
})();