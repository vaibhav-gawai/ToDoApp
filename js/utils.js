// utils.js - No export needed since we'll use IIFE pattern

const Utils = (function() {
    // Format date as "Monday, June 10"
    function formatDate(date) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Get day name from date (Monday, Tuesday, etc.)
    function getDayName(date) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Add to Utils object in utils.js
    function getNextDay(currentDay) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday','saturday','sunday'];
        const currentIndex = days.indexOf(currentDay.toLowerCase());
        if (currentIndex === -1 || currentIndex === days.length - 1) return null;
        return days[currentIndex + 1];
    }
  
  function getPrevDay(currentDay) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday','saturday','sunday'];
    const currentIndex = days.indexOf(currentDay.toLowerCase());
    if (currentIndex <= 0) return null;
    return days[currentIndex - 1];
  }
  
   function getDateForDay(dayName) {
    const weekDates = this.getWeekDates();
    const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday','saturday','sunday'].indexOf(dayName.toLowerCase());
    return weekDates[dayIndex];
  }
    // Get short day name (Mon, Tue, etc.)
    function getShortDayName(date) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Get dates for the current week (Monday to Friday)
    function getWeekDates() {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        
        // Adjust to Monday (if today is Sunday, go back 6 days)
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        
        return weekDates;
    }

    // Generate a unique ID for tasks
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Debounce function to limit how often a function can fire
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    return {
        formatDate,
        getDayName,
        getShortDayName,
        getWeekDates,
        generateId,
        debounce,
        getPrevDay,
        getNextDay,
        getDateForDay
    };
})();
