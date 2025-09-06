// // storage.js - Using Utils from utils.js

const Storage = (function() {
    const DB_NAME = 'LuminousPlannerDB';
    const STORE_NAME = 'tasks';
    const DB_VERSION = 1;

    // --- IndexedDB helpers ---
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async function getAllTasks() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.get("weekData");

            request.onsuccess = () => {
                resolve(request.result || {});
            };
            request.onerror = () => reject(request.error);
        });
    }

    async function saveTasks(tasks) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put(tasks, "weekData");
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    // --- API methods (preserve original signatures) ---
    async function initializeTasks() {
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());

        let tasks = await getAllTasks();

        // Ensure all days exist
        dayNames.forEach(day => {
            if (!tasks[day]) {
                tasks[day] = [];
            }
        });

        // Clean old days
        Object.keys(tasks).forEach(day => {
            if (!dayNames.includes(day)) {
                delete tasks[day];
            }
        });

        await saveTasks(tasks);
        return tasks;
    }

    async function getDayTasks(day) {
        const tasks = await getAllTasks();
        return tasks[day] || [];
    }

    async function getWeekTasks() {
        const tasks = await getAllTasks();
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());

        const weekTasks = {};
        dayNames.forEach(day => {
            weekTasks[day] = tasks[day] || [];
        });

        return weekTasks;
    }

    async function addTask(day, text) {
        if (!text.trim()) return;

        const tasks = await getAllTasks();
        if (!tasks[day]) tasks[day] = [];

        const newTask = {
            id: Utils.generateId(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks[day].push(newTask);
        await saveTasks(tasks);
        return newTask;
    }

    async function toggleTask(day, taskId) {
        const tasks = await getAllTasks();
        if (!tasks[day]) return false;

        const taskIndex = tasks[day].findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;

        tasks[day][taskIndex].completed = !tasks[day][taskIndex].completed;
        await saveTasks(tasks);
        return true;
    }

    async function deleteTask(day, taskId) {
        const tasks = await getAllTasks();
        if (!tasks[day]) return false;

        const initialLength = tasks[day].length;
        tasks[day] = tasks[day].filter(task => task.id !== taskId);

        if (tasks[day].length !== initialLength) {
            await saveTasks(tasks);
            return true;
        }

        return false;
    }

    async function moveTask(currentDay, taskId, offset) {
        const weekDates = Utils.getWeekDates();
        const dayNames = weekDates.map(date => Utils.getDayName(date).toLowerCase());
        const currentDayIndex = dayNames.indexOf(currentDay);

        if (currentDayIndex === -1 || currentDayIndex + offset >= dayNames.length) {
            return false;
        }

        const targetDay = dayNames[currentDayIndex + offset];
        const tasks = await getAllTasks();

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

        await saveTasks(tasks);
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