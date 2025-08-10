// CrescitaX Habit Tracker Application
class CrescitaXApp {
    constructor() {
        this.data = {
            habits: [],
            reflections: [],
            points: 0,
            badges: [],
            lastLevel: 1,
            backupVersion: 1
        };
        
        this.currentDate = new Date();
        this.currentEditingHabit = null;
        this.charts = {};
        this.showPercentages = false;
        this.progressCharts = {};
        this.initialized = false;
        
        this.levels = [
            { level: 1, minPoints: 0, title: "Principiante" },
            { level: 2, minPoints: 250, title: "Appassionato" },
            { level: 3, minPoints: 1000, title: "Esperto" },
            { level: 4, minPoints: 2500, title: "Maestro" },
            { level: 5, minPoints: 5000, title: "Leggenda" }
        ];
        
        this.badgeDefinitions = [
            { id: "first_habit", name: "Prima Abitudine", description: "Hai creato la tua prima abitudine", emoji: "🌱" },
            { id: "week_streak", name: "Settimana Perfetta", description: "7 giorni consecutivi", emoji: "🔥" },
            { id: "month_streak", name: "Mese Completo", description: "30 giorni consecutivi", emoji: "💯" },
            { id: "level_up", name: "Salita di Livello", description: "Hai raggiunto un nuovo livello", emoji: "⭐" }
        ];
        
        this.habitColors = [
            { name: "Verde", value: "#10b981" },
            { name: "Blu", value: "#3b82f6" },
            { name: "Rosso", value: "#ef4444" },
            { name: "Arancione", value: "#f97316" },
            { name: "Viola", value: "#8b5cf6" },
            { name: "Rosa", value: "#ec4899" },
            { name: "Teal", value: "#14b8a6" },
            { name: "Giallo", value: "#eab308" }
        ];
    }
    
    init() {
        console.log('Initializing CrescitaX app...');
        this.loadData();
        this.attachEventListeners();
        this.renderAll();
        this.initialized = true;
        
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
        });
    }
    
    loadData() {
        try {
            const savedData = localStorage.getItem('crescitax-data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.data, ...parsed };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('crescitax-data', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    attachEventListeners() {
        console.log('Attaching event listeners...');
        
        // Navigation setup
        this.setupNavigation();
        
        // Mobile menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebar = document.getElementById('sidebar');
        if (hamburgerBtn && sidebar) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hamburger menu clicked');
                sidebar.classList.toggle('active');
            });
        }
        
        // Close sidebar on backdrop click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && sidebar && !sidebar.contains(e.target) && !hamburgerBtn?.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
        
        // Dashboard events
        this.setupDashboardEvents();
        
        // Habit modal events
        this.setupModalEvents();
        
        // Color picker events
        this.setupColorPicker();
        
        // Calendar events
        this.setupCalendarEvents();
        
        // Day modal events
        this.setupDayModalEvents();
        
        // Charts events
        const numbersFilter = document.getElementById('numbersFilter');
        const percentagesFilter = document.getElementById('percentagesFilter');
        if (numbersFilter) numbersFilter.addEventListener('click', (e) => { e.preventDefault(); this.switchChartView(false); });
        if (percentagesFilter) percentagesFilter.addEventListener('click', (e) => { e.preventDefault(); this.switchChartView(true); });
        
        // Reflections events
        const saveReflectionBtn = document.getElementById('saveReflectionBtn');
        if (saveReflectionBtn) saveReflectionBtn.addEventListener('click', (e) => { e.preventDefault(); this.saveReflection(); });
        
        // Backup events
        this.setupBackupEvents();
        
        // FIXED: Set date constraints to prevent future dates
        this.setDateConstraints();
        
        console.log('Event listeners attached successfully');
    }
    
    // FIXED: Set date constraints to prevent future dates
    setDateConstraints() {
        const today = this.formatDate(new Date());
        const startDateInput = document.getElementById('habitStartDate');
        if (startDateInput) {
            startDateInput.value = today;
            startDateInput.max = today; // Prevent future dates
        }
    }
    
    // FIXED: Better navigation setup with proper event handling
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        console.log('Setting up navigation, found items:', navItems.length);
        
        navItems.forEach((item, index) => {
            const section = item.dataset.section;
            console.log(`Setting up nav item ${index}:`, section);
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Navigation clicked:', section);
                this.navigateToSection(section);
            });
        });
    }
    
    // FIXED: Dedicated dashboard events setup
    setupDashboardEvents() {
        const addHabitBtn = document.getElementById('addHabitBtn');
        if (addHabitBtn) {
            console.log('Add habit button found, attaching listener');
            addHabitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add habit button clicked');
                this.openHabitModal();
            });
        } else {
            console.error('Add habit button not found!');
        }
    }
    
    // FIXED: Dedicated calendar events setup
    setupCalendarEvents() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', (e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                console.log('Previous month clicked');
                this.changeMonth(-1); 
            });
        }
        if (nextMonth) {
            nextMonth.addEventListener('click', (e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                console.log('Next month clicked');
                this.changeMonth(1); 
            });
        }
    }
    
    setupModalEvents() {
        const habitModalClose = document.getElementById('habitModalClose');
        const habitModalBackdrop = document.getElementById('habitModalBackdrop');
        const cancelHabitBtn = document.getElementById('cancelHabitBtn');
        const saveHabitBtn = document.getElementById('saveHabitBtn');
        const deleteHabitBtn = document.getElementById('deleteHabitBtn');
        const habitForm = document.getElementById('habitForm');
        
        if (habitModalClose) habitModalClose.addEventListener('click', (e) => { e.preventDefault(); this.closeHabitModal(); });
        if (habitModalBackdrop) habitModalBackdrop.addEventListener('click', (e) => { e.preventDefault(); this.closeHabitModal(); });
        if (cancelHabitBtn) cancelHabitBtn.addEventListener('click', (e) => { e.preventDefault(); this.closeHabitModal(); });
        if (saveHabitBtn) saveHabitBtn.addEventListener('click', (e) => { e.preventDefault(); this.saveHabit(); });
        if (deleteHabitBtn) deleteHabitBtn.addEventListener('click', (e) => { e.preventDefault(); this.deleteHabit(); });
        if (habitForm) habitForm.addEventListener('submit', (e) => { e.preventDefault(); this.saveHabit(); });
    }
    
    setupDayModalEvents() {
        const dayModalClose = document.getElementById('dayModalClose');
        const dayModalBackdrop = document.getElementById('dayModalBackdrop');
        const closeDayModalBtn = document.getElementById('closeDayModalBtn');
        
        if (dayModalClose) dayModalClose.addEventListener('click', (e) => { e.preventDefault(); this.closeDayModal(); });
        if (dayModalBackdrop) dayModalBackdrop.addEventListener('click', (e) => { e.preventDefault(); this.closeDayModal(); });
        if (closeDayModalBtn) closeDayModalBtn.addEventListener('click', (e) => { e.preventDefault(); this.closeDayModal(); });
    }
    
    setupBackupEvents() {
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        
        if (exportBtn) exportBtn.addEventListener('click', (e) => { e.preventDefault(); this.exportData(); });
        if (importBtn) importBtn.addEventListener('click', (e) => { e.preventDefault(); importFile?.click(); });
        if (importFile) importFile.addEventListener('change', (e) => this.importData(e));
    }
    
    setupColorPicker() {
        const colorOptions = document.querySelectorAll('.color-option');
        console.log('Setting up color picker, found options:', colorOptions.length);
        
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedColor = e.currentTarget.dataset.color;
                const colorInput = document.getElementById('habitColor');
                
                console.log('Color selected:', selectedColor);
                
                // Remove selected class from all options
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                e.currentTarget.classList.add('selected');
                
                // Update hidden input
                if (colorInput) colorInput.value = selectedColor;
            });
        });
    }
    
    renderAll() {
        console.log('Rendering all components...');
        this.renderDashboard();
        this.renderCalendar();
        this.renderStatistics();
        this.renderCharts();
        this.renderStatus();
        this.renderReflections();
        this.renderBadges();
    }
    
    // FIXED: Better navigation with proper section management
    navigateToSection(sectionId) {
        console.log('Navigating to:', sectionId);
        
        // Prevent navigation loops
        const currentActive = document.querySelector('.section.active');
        if (currentActive && currentActive.id === sectionId) {
            console.log('Already on section:', sectionId);
            return;
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error('Section not found:', sectionId);
            return;
        }
        
        // Close mobile menu
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
        
        // Refresh section-specific data
        setTimeout(() => {
            if (sectionId === 'dashboard') this.renderDashboard();
            if (sectionId === 'calendario') this.renderCalendar();
            if (sectionId === 'statistiche') this.renderStatistics();
            if (sectionId === 'grafici') this.renderCharts();
            if (sectionId === 'status') this.renderStatus();
            if (sectionId === 'riflessioni') this.renderReflections();
        }, 10);
    }
    
    // Habit Management
    openHabitModal(habit = null) {
        console.log('Opening habit modal', habit);
        
        this.currentEditingHabit = habit;
        const modal = document.getElementById('habitModal');
        const title = document.getElementById('habitModalTitle');
        const nameInput = document.getElementById('habitName');
        const descriptionInput = document.getElementById('habitDescription');
        const colorInput = document.getElementById('habitColor');
        const startDateInput = document.getElementById('habitStartDate');
        const deleteBtn = document.getElementById('deleteHabitBtn');
        
        if (!modal) {
            console.error('Habit modal not found');
            return;
        }
        
        // FIXED: Set date constraints every time modal opens
        const today = this.formatDate(new Date());
        if (startDateInput) {
            startDateInput.max = today; // Always prevent future dates
        }
        
        if (habit) {
            if (title) title.textContent = 'Modifica Abitudine';
            if (nameInput) nameInput.value = habit.name;
            if (descriptionInput) descriptionInput.value = habit.description || '';
            if (colorInput) colorInput.value = habit.color || '#10b981';
            if (startDateInput) startDateInput.value = habit.startDate;
            if (deleteBtn) deleteBtn.style.display = 'inline-block';
            
            // Update color picker selection
            setTimeout(() => {
                const colorOptions = document.querySelectorAll('.color-option');
                colorOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === (habit.color || '#10b981')) {
                        option.classList.add('selected');
                    }
                });
            }, 50);
        } else {
            if (title) title.textContent = 'Aggiungi Nuova Abitudine';
            if (nameInput) nameInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            if (colorInput) colorInput.value = '#10b981';
            if (startDateInput) startDateInput.value = today; // Set to today by default
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            // Set default color selection
            setTimeout(() => {
                const colorOptions = document.querySelectorAll('.color-option');
                colorOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color === '#10b981') {
                        option.classList.add('selected');
                    }
                });
            }, 50);
        }
        
        // Show modal
        modal.classList.remove('hidden');
        console.log('Modal opened successfully');
    }
    
    closeHabitModal() {
        console.log('Closing habit modal');
        const modal = document.getElementById('habitModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditingHabit = null;
    }
    
    saveHabit() {
        console.log('Saving habit');
        
        const nameInput = document.getElementById('habitName');
        const descriptionInput = document.getElementById('habitDescription');
        const colorInput = document.getElementById('habitColor');
        const startDateInput = document.getElementById('habitStartDate');
        
        const name = nameInput?.value?.trim();
        const description = descriptionInput?.value?.trim() || '';
        const color = colorInput?.value || '#10b981';
        const startDate = startDateInput?.value;
        
        if (!name || !startDate) {
            alert('Per favore compila tutti i campi obbligatori.');
            return;
        }
        
        // FIXED: Validate start date is not in the future
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today for comparison
        const selectedDate = new Date(startDate);
        
        if (selectedDate > today) {
            alert('La data di inizio non può essere futura. Seleziona una data di oggi o precedente.');
            return;
        }
        
        if (this.currentEditingHabit) {
            // Edit existing habit
            const habit = this.data.habits.find(h => h.id === this.currentEditingHabit.id);
            if (habit) {
                habit.name = name;
                habit.description = description;
                habit.color = color;
                habit.startDate = startDate;
                console.log('Habit updated:', habit);
            }
        } else {
            // Add new habit
            const habit = {
                id: Date.now().toString(),
                name,
                description,
                color,
                startDate,
                completions: {},
                currentStreak: 0,
                bestStreak: 0,
                createdAt: new Date().toISOString()
            };
            this.data.habits.push(habit);
            console.log('New habit created:', habit);
            
            // Award first habit badge
            if (this.data.habits.length === 1) {
                this.awardBadge('first_habit');
            }
        }
        
        this.saveData();
        this.renderDashboard();
        this.closeHabitModal();
    }
    
    deleteHabit() {
        if (!this.currentEditingHabit) return;
        
        if (confirm('Sei sicuro di voler eliminare questa abitudine?')) {
            this.data.habits = this.data.habits.filter(h => h.id !== this.currentEditingHabit.id);
            
            // Destroy progress chart
            if (this.progressCharts[this.currentEditingHabit.id]) {
                this.progressCharts[this.currentEditingHabit.id].destroy();
                delete this.progressCharts[this.currentEditingHabit.id];
            }
            
            this.saveData();
            this.renderDashboard();
            this.closeHabitModal();
        }
    }
    
    calculateHabitStats(habit) {
        // Use local-midnight dates to avoid UTC off-by-one
        const startDate = new Date(habit.startDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate total days (inclusive) from start date to today
        const msDay = 1000 * 60 * 60 * 24;
        let totalDays = Math.floor((today - startDate) / msDay) + 1;
        
        // Calculate completed days
        const completedDays = Object.keys(habit.completions).length;
        
        // Calculate percentage
        const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
        
        return {
            totalDays: Math.max(totalDays, 1),
            completedDays,
            percentage,
            currentStreak: habit.currentStreak || 0,
            bestStreak: habit.bestStreak || 0
        };
    }
    
    
toggleHabitCompletion(habitId, date = null) {
        console.log('Toggling habit completion for:', habitId);
        // Block toggling for future dates
        const todayMid = new Date(); todayMid.setHours(0,0,0,0);
        if (date) {
            const target = new Date(date + 'T00:00:00');
            if (target > todayMid) {
                console.warn('Attempt to toggle completion on a future date blocked:', date);
                return false;
            }
        }
const targetDate = date || this.formatDate(new Date());
        const habit = this.data.habits.find(h => h.id === habitId);
        
        if (!habit) return;
        
        const wasCompleted = habit.completions[targetDate];
        
        if (wasCompleted) {
            // Remove completion
            delete habit.completions[targetDate];
            this.data.points = Math.max(0, this.data.points - 10);
        } else {
            // Add completion
            habit.completions[targetDate] = true;
            this.data.points += 10;
            
            // Show points animation if it's today
            if (!date) {
                this.showPointsAnimation(10);
            }
        }
        
        // Update streaks
        this.updateHabitStreaks(habit);
        
        // Check for streak bonus
        if (!wasCompleted && habit.currentStreak % 7 === 0 && habit.currentStreak > 0) {
            this.data.points += 50;
            this.awardBadge('week_streak');
            if (!date) {
                setTimeout(() => this.showPointsAnimation(50, 'Bonus Streak!'), 500);
            }
        }
        
        // Check for month streak badge
        if (habit.currentStreak >= 30) {
            this.awardBadge('month_streak');
        }
        
        this.saveData();
        this.renderDashboard();
        this.renderCalendar();
        this.renderStatistics();
        this.renderStatus();
        
        return !wasCompleted;
    }
    
    updateHabitStreaks(habit) {
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date();
        const startDate = new Date(habit.startDate);
        
        // Calculate best streak by checking all completion dates
        const completionDates = Object.keys(habit.completions).sort();
        let prevDate = null;
        
        for (const dateStr of completionDates) {
            const currentDate = new Date(dateStr);
            
            if (prevDate) {
                const daysDiff = Math.ceil((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                if (daysDiff === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            } else {
                tempStreak = 1;
            }
            
            bestStreak = Math.max(bestStreak, tempStreak);
            prevDate = currentDate;
        }
        
        // Calculate current streak from today backwards
        for (let d = new Date(today); d >= startDate; d.setDate(d.getDate() - 1)) {
            const dateStr = this.formatDate(d);
            if (habit.completions[dateStr]) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        habit.currentStreak = currentStreak;
        habit.bestStreak = Math.max(bestStreak, currentStreak);
    }
    
    showPointsAnimation(points, text = null) {
        const animation = document.getElementById('floatingAnimation');
        if (!animation) return;
        
        animation.textContent = text || `+${points} punti!`;
        animation.classList.remove('hidden');
        
        // Position near the center of the screen
        animation.style.left = '50%';
        animation.style.top = '40%';
        animation.style.transform = 'translateX(-50%)';
        
        setTimeout(() => {
            animation.classList.add('hidden');
        }, 2000);
    }
    
    awardBadge(badgeId) {
        if (!this.data.badges.includes(badgeId)) {
            this.data.badges.push(badgeId);
            this.renderBadges();
        }
    }
    
    // Render Methods
    renderDashboard() {
        console.log('Rendering dashboard...');
        
        const habitsGrid = document.getElementById('habitsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!habitsGrid || !emptyState) {
            console.error('Dashboard elements not found');
            return;
        }
        
        if (this.data.habits.length === 0) {
            emptyState.style.display = 'block';
            // Remove any existing habit cards
            const existingCards = habitsGrid.querySelectorAll('.habit-card');
            existingCards.forEach(card => card.remove());
        } else {
            emptyState.style.display = 'none';
            
            // Remove existing habit cards
            const existingCards = habitsGrid.querySelectorAll('.habit-card');
            existingCards.forEach(card => card.remove());
            
            // Add habit cards
            this.data.habits.forEach(habit => {
                const card = this.createHabitCard(habit);
                habitsGrid.appendChild(card);
            });
            
            // Render progress charts after cards are added to DOM
            setTimeout(() => {
                this.data.habits.forEach(habit => {
                    this.renderProgressChart(habit);
                });
            }, 100);
        }
    }
    
    createHabitCard(habit) {
        const today = this.formatDate(new Date());
        const isCompletedToday = habit.completions[today] || false;
        const stats = this.calculateHabitStats(habit);
        
        const card = document.createElement('div');
        card.className = `card habit-card`;
        card.style.borderColor = habit.color || '#10b981';
        
        card.innerHTML = `
            <div class="habit-menu">
                <button class="habit-menu-btn" onclick="window.app.toggleHabitMenu('${habit.id}')">⋮</button>
                <div class="habit-dropdown hidden" id="menu-${habit.id}">
                    <button onclick="window.app.openHabitModal(window.app.data.habits.find(h => h.id === '${habit.id}'))">Modifica</button>
                    <button onclick="window.app.deleteHabitConfirm('${habit.id}')">Elimina</button>
                </div>
            </div>
            <div class="habit-header">
                <h3 class="habit-name">${habit.name}</h3>
                ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ''}
            </div>
            <div class="habit-progress" id="progress-${habit.id}">
                <canvas id="chart-${habit.id}"></canvas>
                <div class="habit-progress-text">${stats.percentage}%</div>
            </div>
            <div class="habit-stats">
                <div class="habit-stat">
                    <div class="habit-stat-label">Totale</div>
                    <div class="habit-stat-value">${stats.totalDays}</div>
                </div>
                <div class="habit-stat">
                    <div class="habit-stat-label">Completato</div>
                    <div class="habit-stat-value">${stats.completedDays}</div>
                </div>
                <div class="habit-stat">
                    <div class="habit-stat-label">Streak</div>
                    <div class="habit-stat-value">${stats.currentStreak}</div>
                </div>
                <div class="habit-stat">
                    <div class="habit-stat-label">Record</div>
                    <div class="habit-stat-value">${stats.bestStreak}</div>
                </div>
            </div>
            <div class="habit-actions">
                <button class="btn ${isCompletedToday ? 'btn--undo' : 'btn--primary'}" onclick="window.app.toggleHabitCompletion('${habit.id}')">
                    ${isCompletedToday ? 'Annulla Completamento' : 'Completa Oggi'}
                </button>
            </div>
        `;
        
        return card;
    }
    
    renderProgressChart(habit) {
        const canvas = document.getElementById(`chart-${habit.id}`);
        if (!canvas) return;
        
        const stats = this.calculateHabitStats(habit);
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.progressCharts[habit.id]) {
            this.progressCharts[habit.id].destroy();
        }
        
        this.progressCharts[habit.id] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [stats.percentage, 100 - stats.percentage],
                    backgroundColor: [
                        habit.color || '#10b981',
                        'rgba(0, 0, 0, 0.1)'
                    ],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }
    
    toggleHabitMenu(habitId) {
        const menu = document.getElementById(`menu-${habitId}`);
        const allMenus = document.querySelectorAll('.habit-dropdown');
        
        allMenus.forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });
        
        if (menu) menu.classList.toggle('hidden');
    }
    
    deleteHabitConfirm(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (habit && confirm(`Sei sicuro di voler eliminare "${habit.name}"?`)) {
            this.data.habits = this.data.habits.filter(h => h.id !== habitId);
            
            // Destroy progress chart
            if (this.progressCharts[habitId]) {
                this.progressCharts[habitId].destroy();
                delete this.progressCharts[habitId];
            }
            
            this.saveData();
            this.renderDashboard();
        }
    }
    
    // Calendar methods
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');
        
        if (!calendarGrid || !currentMonth) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        currentMonth.textContent = new Intl.DateTimeFormat('it-IT', { 
            month: 'long', 
            year: 'numeric' 
        }).format(this.currentDate);
        
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header-day';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        
        // Get the first Monday of the calendar grid
        const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        startDate.setDate(1 - dayOfWeek);
        
        // Create the 6x7 calendar grid
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('button');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDay.getDate();
            
            if (currentDay.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(currentDay.getDate(), currentDay.getMonth(), currentDay.getFullYear())) {
                dayElement.classList.add('today');
            }
            
            // FIXED: Create proper date object for this specific day and format it correctly
            const dateForModal = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
            const dateStr = this.formatDate(dateForModal);
            
            // Check completion status
            const dayStatus = this.getDayStatus(dateStr);
            
            if (dayStatus === 'completed') {
                dayElement.classList.add('completed');
            } else if (dayStatus === 'missed') {
                dayElement.classList.add('missed');
            }
            
            
// Store the correct date and disable future days
dayElement.dataset.dateStr = dateStr;
if (dayStatus === 'future') {
    dayElement.classList.add('future');
    dayElement.disabled = true;
} else {
    dayElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clickedDateStr = e.currentTarget.dataset.dateStr;
        console.log('Day clicked, date string:', clickedDateStr);
        this.handleDayClick(clickedDateStr);
    });
}
calendarGrid.appendChild(dayElement);
        }
        
        console.log('Calendar rendered for:', year, month);
    }
    
    isToday(day, month, year) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    }
    
    // FIXED: Simplified handleDayClick to accept dateStr directly
    
handleDayClick(dateStr) {
        console.log('handleDayClick called with:', dateStr);
        const today = new Date(); today.setHours(0,0,0,0);
        const clicked = new Date(dateStr + 'T00:00:00');
        if (clicked > today) {
            alert('Non puoi modificare date future.');
            return;
        }
this.openDayModal(dateStr);
    }
    
    getDayStatus(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) return 'future';
        
        let hasActiveHabits = false;
        let hasCompletions = false;
        
        this.data.habits.forEach(habit => {
            const startDate = new Date(habit.startDate + 'T00:00:00');
            if (date >= startDate) {
                hasActiveHabits = true;
                if (habit.completions[dateStr]) {
                    hasCompletions = true;
                }
            }
        });
        
        if (!hasActiveHabits) return 'neutral';
        return hasCompletions ? 'completed' : 'missed';
    }
    
    changeMonth(direction) {
        console.log('changeMonth called with direction:', direction);
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        console.log('New current date:', this.currentDate);
        this.renderCalendar();
    }
    
    // FIXED: Use the dateStr directly and ensure proper date formatting in modal
    
openDayModal(dateStr) {
        console.log('openDayModal called with:', dateStr);
        // Safety guard: do not open modal for future dates
        const __todayGuard = new Date(); __todayGuard.setHours(0,0,0,0);
        const __checkDate = new Date(dateStr + 'T00:00:00');
        if (__checkDate > __todayGuard) {
            alert('Non puoi modificare date future.');
            return;
        }
const modal = document.getElementById('dayModal');
        const title = document.getElementById('dayModalTitle');
        const body = document.getElementById('dayModalBody');
        
        if (!modal || !title || !body) return;
        
        // FIXED: Create date object and format properly for display
        const date = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone issues
        const displayDate = new Intl.DateTimeFormat('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Europe/Rome' // Ensure Italian timezone
        }).format(date);
        
        title.textContent = `Modifica - ${displayDate}`;
        
        body.innerHTML = '';
        
        const relevantHabits = this.data.habits.filter(habit => 
            new Date(habit.startDate + 'T00:00:00') <= date
        );
        
        if (relevantHabits.length === 0) {
            body.innerHTML = '<p>Nessuna abitudine attiva per questa data.</p>';
        } else {
            relevantHabits.forEach(habit => {
                const isCompleted = habit.completions[dateStr] || false;
                
                const item = document.createElement('div');
                item.className = 'day-habit-item';
                item.innerHTML = `
                    <div class="day-habit-info">
                        <span style="color: ${habit.color}">●</span>
                        <span>${habit.name}</span>
                    </div>
                    <button class="btn btn--sm ${isCompleted ? 'btn--outline' : 'btn--primary'}" 
                            onclick="window.app.toggleHabitCompletion('${habit.id}', '${dateStr}'); window.app.updateDayModal('${dateStr}');">
                        ${isCompleted ? 'Completata' : 'Completa'}
                    </button>
                `;
                body.appendChild(item);
            });
        }
        
        modal.classList.remove('hidden');
    }
    
    updateDayModal(dateStr) {
        setTimeout(() => {
            this.openDayModal(dateStr);
            this.renderCalendar();
        }, 100);
    }
    
    closeDayModal() {
        const modal = document.getElementById('dayModal');
        if (modal) modal.classList.add('hidden');
    }
    
    renderStatistics() {
        const totalHabits = document.getElementById('totalHabits');
        const todayCompletions = document.getElementById('todayCompletions');
        const averagePercentage = document.getElementById('averagePercentage');
        const tableBody = document.querySelector('#statsTable tbody');
        
        if (!totalHabits || !todayCompletions || !averagePercentage || !tableBody) return;
        
        // Calculate stats
        const today = this.formatDate(new Date());
        const todayCount = this.data.habits.filter(h => h.completions[today]).length;
        
        let totalPercentage = 0;
        this.data.habits.forEach(habit => {
            const stats = this.calculateHabitStats(habit);
            totalPercentage += stats.percentage;
        });
        
        const avgPercentage = this.data.habits.length > 0 ? totalPercentage / this.data.habits.length : 0;
        
        // Update cards
        totalHabits.textContent = this.data.habits.length;
        todayCompletions.textContent = todayCount;
        averagePercentage.textContent = Math.round(avgPercentage) + '%';
        
        // Update table
        tableBody.innerHTML = '';
        this.data.habits.forEach(habit => {
            const stats = this.calculateHabitStats(habit);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${habit.name}</td>
                <td>${stats.totalDays}</td>
                <td>${stats.completedDays}</td>
                <td>${stats.percentage}%</td>
                <td>${stats.currentStreak}</td>
                <td>${stats.bestStreak}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    renderCharts() {
        this.destroyCharts();
        setTimeout(() => {
            this.createTrendChart();
            this.createFrequencyChart();
            this.createStreakChart();
            this.createDistributionChart();
        }, 100);
    }
    
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
    
    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        const last30Days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(date);
        }
        
        const data = last30Days.map(date => {
            const dateStr = this.formatDate(date);
            if (this.showPercentages) {
                const activeHabits = this.data.habits.filter(h => new Date(h.startDate) <= date).length;
                const completions = this.data.habits.filter(h => h.completions[dateStr]).length;
                return activeHabits > 0 ? (completions / activeHabits) * 100 : 0;
            } else {
                return this.data.habits.filter(h => h.completions[dateStr]).length;
            }
        });
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last30Days.map(date => date.getDate()),
                datasets: [{
                    label: this.showPercentages ? 'Percentuale Completamento' : 'Completamenti',
                    data: data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.showPercentages ? 100 : undefined
                    }
                }
            }
        });
    }
    
    createFrequencyChart() {
        const ctx = document.getElementById('frequencyChart');
        if (!ctx || this.data.habits.length === 0) return;
        
        const habitData = this.data.habits.map(habit => {
            const stats = this.calculateHabitStats(habit);
            return this.showPercentages ? stats.percentage : stats.completedDays;
        });
        
        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.habits.map(h => h.name),
                datasets: [{
                    label: this.showPercentages ? 'Percentuale' : 'Completamenti',
                    data: habitData,
                    backgroundColor: this.data.habits.map(h => h.color || '#1FB8CD')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.showPercentages ? 100 : undefined
                    }
                }
            }
        });
    }
    
    createStreakChart() {
        const ctx = document.getElementById('streakChart');
        if (!ctx || this.data.habits.length === 0) return;
        
        this.charts.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.habits.map(h => h.name),
                datasets: [
                    {
                        label: 'Streak Attuale',
                        data: this.data.habits.map(h => h.currentStreak),
                        backgroundColor: '#1FB8CD'
                    },
                    {
                        label: 'Record',
                        data: this.data.habits.map(h => h.bestStreak),
                        backgroundColor: '#FFC185'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    createDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;
        
        const weekdays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        const weekdayData = new Array(7).fill(0);
        
        this.data.habits.forEach(habit => {
            Object.keys(habit.completions).forEach(dateStr => {
                const date = new Date(dateStr);
                weekdayData[date.getDay()]++;
            });
        });
        
        if (this.showPercentages) {
            const total = weekdayData.reduce((sum, count) => sum + count, 0);
            if (total > 0) {
                weekdayData.forEach((count, index) => {
                    weekdayData[index] = (count / total) * 100;
                });
            }
        }
        
        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: weekdays,
                datasets: [{
                    data: weekdayData,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    switchChartView(showPercentages) {
        this.showPercentages = showPercentages;
        
        // Update filter buttons
        const numbersFilter = document.getElementById('numbersFilter');
        const percentagesFilter = document.getElementById('percentagesFilter');
        
        if (numbersFilter) numbersFilter.classList.toggle('active', !showPercentages);
        if (percentagesFilter) percentagesFilter.classList.toggle('active', showPercentages);
        
        this.renderCharts();
    }
    
    renderStatus() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.levels[currentLevel.level] || null;
        
        // Update level info
        const currentLevelTitle = document.getElementById('currentLevelTitle');
        const currentPoints = document.getElementById('currentPoints');
        
        if (currentLevelTitle) currentLevelTitle.textContent = `Livello ${currentLevel.level} - ${currentLevel.title}`;
        if (currentPoints) currentPoints.textContent = this.data.points;
        
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            if (nextLevel) {
                const progress = ((this.data.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100;
                progressFill.style.width = Math.min(progress, 100) + '%';
                progressText.textContent = `${this.data.points - currentLevel.minPoints} / ${nextLevel.minPoints - currentLevel.minPoints}`;
            } else {
                progressFill.style.width = '100%';
                progressText.textContent = 'Livello Massimo';
            }
        }
        
        // Check for level up
        if (this.data.lastLevel !== currentLevel.level) {
            this.data.lastLevel = currentLevel.level;
            if (currentLevel.level > 1) {
                this.awardBadge('level_up');
                this.showPointsAnimation(0, `Livello ${currentLevel.level}!`);
            }
            this.saveData();
        }
    }
    
    getCurrentLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.data.points >= this.levels[i].minPoints) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }
    
    renderBadges() {
        const badgesGrid = document.getElementById('badgesGrid');
        if (!badgesGrid) return;
        
        badgesGrid.innerHTML = '';
        
        this.badgeDefinitions.forEach(badge => {
            const isEarned = this.data.badges.includes(badge.id);
            
            const badgeElement = document.createElement('div');
            badgeElement.className = `badge ${isEarned ? 'earned' : ''}`;
            badgeElement.innerHTML = `
                <div class="badge-emoji">${badge.emoji}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
            `;
            
            badgesGrid.appendChild(badgeElement);
        });
    }
    
    saveReflection() {
        const textArea = document.getElementById('reflectionText');
        if (!textArea) return;
        
        const text = textArea.value.trim();
        
        if (!text) {
            alert('Per favore scrivi una riflessione prima di salvare.');
            return;
        }
        
        const reflection = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            text: text
        };
        
        this.data.reflections.unshift(reflection);
        this.data.points += 25;
        
        textArea.value = '';
        this.showPointsAnimation(25, '+25 punti!');
        this.saveData();
        this.renderReflections();
        this.renderStatus();
    }
    
    renderReflections() {
        const reflectionsList = document.getElementById('reflectionsList');
        if (!reflectionsList) return;
        
        reflectionsList.innerHTML = '';
        
        this.data.reflections.forEach(reflection => {
            const item = document.createElement('div');
            item.className = 'card reflection-item';
            
            const date = new Date(reflection.date);
            const dateStr = new Intl.DateTimeFormat('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
            
            item.innerHTML = `
                <div class="reflection-header" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div class="reflection-date">${dateStr}</div>
                    <button class="btn btn--outline btn--sm" onclick="window.app.deleteReflection('${reflection.id}')">Elimina</button>
                </div>
                <div class="reflection-text">${reflection.text}</div>
            `;
            
            reflectionsList.appendChild(item);
        });
    }
    

deleteReflection(id) {
    const idx = this.data.reflections.findIndex(r => r.id === id);
    if (idx === -1) return;
    const ref = this.data.reflections[idx];
    if (confirm('Sei sicuro di voler eliminare questa riflessione?')) {
        // Remove the reflection
        this.data.reflections.splice(idx, 1);
        // Adjust points awarded for this reflection
        this.data.points = Math.max(0, this.data.points - 25);
        this.saveData();
        this.renderReflections();
        this.renderStatus();
    }
}

        exportData() {
        const dataToExport = {
            ...this.data,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        const filename = `crescitax-backup-${dateStr}.json`;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.backupVersion || importedData.backupVersion !== 1) {
                    alert('Formato di backup non compatibile. Assicurati di importare un file di backup valido.');
                    return;
                }
                
                if (confirm('Importare questi dati sostituirà tutti i dati attuali. Continuare?')) {
                    this.data = {
                        habits: importedData.habits || [],
                        reflections: importedData.reflections || [],
                        points: importedData.points || 0,
                        badges: importedData.badges || [],
                        lastLevel: importedData.lastLevel || 1,
                        backupVersion: 1
                    };
                    
                    this.saveData();
                    location.reload();
                }
            } catch (error) {
                alert('Errore durante l\'importazione. Il file potrebbe essere corrotto.');
            }
        };
        
        reader.readAsText(file);
        event.target.value = '';
    }
    
    // FIXED: Utility method to ensure proper date formatting without timezone issues
    formatDate(date) {
        // Ensure we get YYYY-MM-DD format in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    isSameDate(date1, date2) {
        return this.formatDate(date1) === this.formatDate(date2);
    }
}

// Initialize the app
const app = new CrescitaXApp();
window.app = app; // Make app globally available for onclick handlers

// FIXED: Improved initialization with proper DOM ready detection
function initializeApp() {
    console.log('Initializing CrescitaX app...');
    try {
        app.init();
    } catch (error) {
        console.error('Error initializing app:', error);
        // Retry after a short delay
        setTimeout(() => {
            console.log('Retrying app initialization...');
            app.init();
        }, 1000);
    }
}

// Multiple initialization methods for better reliability
document.addEventListener('DOMContentLoaded', initializeApp);

// Fallback for cases where DOMContentLoaded has already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeApp, 50);
}

// Final fallback initialization
window.addEventListener('load', () => {
    if (!window.app.initialized) {
        console.log('Final fallback initialization');
        setTimeout(initializeApp, 100);
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.habit-menu')) {
        document.querySelectorAll('.habit-dropdown').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
});