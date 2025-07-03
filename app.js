// ===== CONFIGURAZIONE E COSTANTI =====
console.log('CrescitaX v4.0 - Status Chiaro + Citazioni Motivazionali');

const APP_CONFIG = {
  storageKey: 'crescitax_data_v4',
  colors: ['#2563eb', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#06b6d4'],
  challenges: [],
  levels: [
    { threshold: 0, name: 'Novizio', badge: '🌱', color: '#22c55e' },
    { threshold: 100, name: 'Apprendista', badge: '🌿', color: '#16a34a' },
    { threshold: 250, name: 'Praticante', badge: '⭐', color: '#fbbf24' },
    { threshold: 750, name: 'Costante', badge: '🔥', color: '#f97316' },
    { threshold: 2000, name: 'Guru', badge: '👑', color: '#8b5cf6' }
  ],
  pointsSystem: {
    habitCompletion: 10,
    streak7Days: 50,
    reflection: 25
  }
};

// Database Citazioni


// ===== GESTIONE ERRORI GLOBALE =====
window.addEventListener('error', (e) => {
    console.error("Critical error:", e);
    alert("Si è verificato un errore. Ricarica la pagina.");
});

// ===== VALIDAZIONE DATI =====
function validateData(data) {
    if (!data.habits) data.habits = [];
    if (!data.challenges) data.challenges = [];
    if (!data.reflections) data.reflections = [];
    if (!data.userStats) data.userStats = { points: 0 };
    if (!data.challengeStats) data.challengeStats = {};
    if (!data.favoriteQuotes) data.favoriteQuotes = [];
    return data;
}

// ===== GESTIONE DATI =====
function loadAppData() {
    try {
        const saved = localStorage.getItem(APP_CONFIG.storageKey);
        if (saved) {
            return validateData(JSON.parse(saved));
        }
        return initializeWithTestData();
    } catch (error) {
        console.error('Error loading data:', error);
        return initializeWithTestData();
    }
}

function saveAppData(data) {
    try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(validateData(data)));
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Errore nel salvataggio dei dati');
    }
}

function initializeWithTestData() {
    const today = new Date();
    const completions1 = {};
    const completions2 = {};
    
    // Simula 10 giorni di completamenti per la prima abitudine (9/10 giorni)
    for (let i = 9; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        completions1[dateStr] = { 
            completed: i !== 2, // Salta il giorno 2 (quindi 9/10 completati)
            timestamp: date.toISOString() 
        };
    }
    
    // Simula 8 giorni di completamenti per la seconda abitudine (7/8 giorni)
    for (let i = 7; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        completions2[dateStr] = { 
            completed: i !== 2, // Salta il giorno 2 (quindi 7/8 completati)
            timestamp: date.toISOString() 
        };
    }

    return {
        habits: [
            {
                id: generateId(),
                name: "Lettura quotidiana",
                description: "Leggo almeno 20 pagine di un libro ogni giorno per migliorare le mie conoscenze",
                color: "#10b981",
                startDate: formatDate(new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000)),
                completions: completions1
            },
            {
                id: generateId(),
                name: "Esercizio fisico",
                description: "30 minuti di attività fisica quotidiana per mantenermi in forma",
                color: "#f97316",
                startDate: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
                completions: completions2
            }
        ],
        challenges: [],
        reflections: [
            {
                id: generateId(),
                date: formatDate(today),
                text: "Oggi ho capito quanto sia importante mantenere una routine mattutina costante"
            },
            {
                id: generateId(),
                date: formatDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
                text: "La meditazione mi sta aiutando a essere più concentrato durante il giorno"
            }
        ],
        userStats: { points: 350 },
        challengeStats: {},
        favoriteQuotes: [
            {text: "La motivazione ti fa iniziare. L'abitudine ti fa continuare.", author: "Jim Ryun"},
            {text: "Le abitudini sono l'interruttore della produttività.", author: "James Clear"},
            {text: "La disciplina è il ponte tra gli obiettivi e il successo.", author: "Jim Rohn"}
        ]
    };
}

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    if (typeof date === 'string') return date;
    return getCETDate(date).toISOString().split('T')[0];
}

function getCETDate(date = new Date()) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = date.getTimezoneOffset() < stdOffset;
    const cetOffset = isDST ? 2 : 1;

    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * cetOffset);
}


function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getTodayString() {
    return formatDate(getCETDate());
}

// ===== SISTEMA LIVELLI E PUNTI =====
function calculateLevel(points) {
  for (let i = APP_CONFIG.levels.length - 1; i >= 0; i--) {
    if (points >= APP_CONFIG.levels[i].threshold) {
      return i + 1;
    }
  }
  return 1;
}
function getLevelInfo(level) {
  const index = Math.min(level - 1, APP_CONFIG.levels.length - 1);
  return APP_CONFIG.levels[index];
}
function getNextLevelThreshold(level) {
  if (level >= APP_CONFIG.levels.length) {
    return APP_CONFIG.levels[APP_CONFIG.levels.length - 1].threshold;
  }
  return APP_CONFIG.levels[level].threshold;
}
function calculateTotalPoints(data) {
  let points = 0;
  data.habits.forEach(habit => {
    const metrics = calculateHabitMetrics(habit);
    points += metrics.completedDays * APP_CONFIG.pointsSystem.habitCompletion;
    const streakPoints = Math.floor(metrics.longestStreak / 7) * APP_CONFIG.pointsSystem.streak7Days;
    points += streakPoints;
  });
  points += data.reflections.length * APP_CONFIG.pointsSystem.reflection;
  return points;
}

// ===== GESTIONE CITAZIONI =====
function addToFavorites(quote) {
    const data = loadAppData();
    
    // Controlla se la citazione è già nei preferiti
    const exists = data.favoriteQuotes.some(fq => 
        fq.text === quote.text && fq.author === quote.author
    );
    
    if (!exists) {
        data.favoriteQuotes.push({
            id: generateId(),
            text: quote.text,
            author: quote.author,
            dateAdded: new Date().toISOString()
        });
        saveAppData(data);
        return true;
    }
    return false;
}

function removeFromFavorites(quoteId) {
    const data = loadAppData();
    data.favoriteQuotes = data.favoriteQuotes.filter(fq => fq.id !== quoteId);
    saveAppData(data);
}

// ===== ANIMAZIONI PUNTI =====
function showPointAnimation(points, type, sourceElement) {
    const container = document.getElementById('pointAnimationContainer');
    const animation = document.createElement('div');
    animation.className = `floating-point ${type}`;
    animation.textContent = `+${points}`;
    
    if (sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        animation.style.left = `${rect.left + rect.width / 2}px`;
        animation.style.top = `${rect.top}px`;
    } else {
        animation.style.left = '50%';
        animation.style.top = '50%';
    }
    
    container.appendChild(animation);
    
    // Rimuovi l'animazione dopo 1.5 secondi
    setTimeout(() => {
        if (animation.parentNode) {
            animation.parentNode.removeChild(animation);
        }
    }, 1500);
}

// ===== GESTIONE SFIDE AVANZATA =====
function getActiveChallengeKey(challengeId) {
    return `challenge_active_${challengeId}`;
}

function getChallengeHistoryKey(challengeId) {
    return `challenge_history_${challengeId}`;
}

function saveActiveChallenge(challengeId, challengeData) {
    const key = getActiveChallengeKey(challengeId);
    localStorage.setItem(key, JSON.stringify(challengeData));
}

function loadActiveChallenge(challengeId) {
    const key = getActiveChallengeKey(challengeId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
}

function saveChallengeHistory(challengeId, historyEntry) {
    const key = getChallengeHistoryKey(challengeId);
    const existing = localStorage.getItem(key);
    const history = existing ? JSON.parse(existing) : [];
    history.push(historyEntry);
    localStorage.setItem(key, JSON.stringify(history));
}

function getChallengeHistory(challengeId) {
    const key = getChallengeHistoryKey(challengeId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}

function calcolaStatisticheSfida(challengeId) {
    const history = getChallengeHistory(challengeId);
    const tentativi = history.length;
    const completate = history.filter(h => h.daysCompleted === 7).length;
    const successRate = tentativi > 0 ? Math.round((completate / tentativi) * 100) : 0;
    const bestStreak = Math.max(...history.map(h => h.maxConsecutiveDays || 0), 0);
    const lastCompleted = history.filter(h => h.daysCompleted === 7).pop();
    
    let badge = null;
    if (completate >= 5) badge = "🏆 Maestro";
    else if (successRate === 100 && tentativi >= 2) badge = "⭐ Perfetto";
    else if (bestStreak >= 10) badge = "🔥 Streak King";
    
    return {
        tentativi,
        completate,
        successRate,
        bestStreak,
        lastCompleted: lastCompleted ? lastCompleted.completedDate : null,
        badge
    };
}

// ===== CALCOLI METRICHE =====
function calculateHabitMetrics(habit) {
    const today = new Date();
    const startDate = new Date(habit.startDate);
    
    const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const completedDays = Object.values(habit.completions || {}).filter(c => c.completed).length;
    const percentage = Math.min(100, Math.round((completedDays / totalDays) * 100));
    const currentStreak = calculateCurrentStreak(habit);
    const longestStreak = calculateLongestStreak(habit);
    
    const todayString = formatDate(today);
    const todayCompletion = (habit.completions || {})[todayString];
    const completedToday = todayCompletion ? todayCompletion.completed : false;

    return {
        totalDays,
        completedDays,
        percentage,
        currentStreak,
        longestStreak,
        completedToday,
        habit
    };
}

function calculateCurrentStreak(habit) {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = formatDate(checkDate);
        
        const completion = (habit.completions || {})[dateStr];
        if (completion && completion.completed) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function calculateLongestStreak(habit) {
    const completions = Object.entries(habit.completions || {})
        .filter(([_, c]) => c.completed)
        .map(([date, _]) => new Date(date))
        .sort((a, b) => a - b);

    if (completions.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completions.length; i++) {
        const dayDiff = (completions[i] - completions[i - 1]) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

// ===== UI MANAGER =====
class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentMonth = new Date();
        this.selectedColor = APP_CONFIG.colors[0];
        this.selectedCalendarDate = null;
        this.isMobileMenuOpen = false;
        this.editingHabitId = null;
        this.chartInstances = {};
        this.currentChartMode = 'numbers';
        
        this.initializeEventListeners();
        this.initializeNavigation();
        this.renderCurrentSection();
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.currentTarget.dataset.section);
            });
        });

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Habit Modal
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            this.showHabitModal();
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideHabitModal();
        });
        
        document.getElementById('cancelModal').addEventListener('click', () => {
            this.hideHabitModal();
        });
        
        document.getElementById('saveHabit').addEventListener('click', () => {
            this.saveHabit();
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.target.dataset.color);
            });
        });

        // Calendar
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // Calendar Modal
        document.getElementById('closeCalendarModal').addEventListener('click', () => {
            this.hideCalendarModal();
        });
        document.getElementById('cancelCalendarModal').addEventListener('click', () => {
            this.hideCalendarModal();
        });
        document.getElementById('saveCalendarChanges').addEventListener('click', () => {
            this.saveCalendarChanges();
        });

        // Reflections
        document.getElementById('saveReflection').addEventListener('click', () => {
            this.saveReflection();
        });

        // Chart filters
        document.getElementById('chartFilterNumbers').addEventListener('click', () => {
            this.switchChartMode('numbers');
        });
        
        document.getElementById('chartFilterPercentages').addEventListener('click', () => {
            this.switchChartMode('percentages');
        });

        // Quote actions
        document.getElementById('shareQuote').addEventListener('click', () => {
            this.shareQuote();
        });
        
        document.getElementById('favoriteQuote').addEventListener('click', () => {
            this.favoriteQuote();
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && this.isMobileMenuOpen) {
                const sidebar = document.getElementById('sidebar');
                const toggle = document.getElementById('mobileMenuToggle');
                if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            sidebar.classList.add('mobile-open');
            this.isMobileMenuOpen = true;
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-open');
        this.isMobileMenuOpen = false;
    }

    initializeNavigation() {
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const sidebarItem = document.querySelector(`.sidebar-nav-item[data-section="${this.currentSection}"]`);
        const mobileBtn = document.querySelector(`.nav-btn[data-section="${this.currentSection}"]`);
        
        if (sidebarItem) sidebarItem.classList.add('active');
        if (mobileBtn) mobileBtn.classList.add('active');
    }

    switchSection(section) {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const sidebarItem = document.querySelector(`.sidebar-nav-item[data-section="${section}"]`);
        const mobileBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
        
        if (sidebarItem) sidebarItem.classList.add('active');
        if (mobileBtn) mobileBtn.classList.add('active');

        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        switch (this.currentSection) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'calendario':
                this.renderCalendar();
                break;
            case 'sfide':
                break;
            case 'statistiche':
                this.renderStatistics();
                break;
            case 'grafici':
                this.renderCharts();
                break;
            case 'status':
                this.renderStatus();
                break;
            case 'citazioni':
                break;
            case 'riflessioni':
                this.renderReflections();
                break;
        }
    }

    // ===== DASHBOARD =====
    renderDashboard() {
        const container = document.getElementById('habitsGrid');
        const data = loadAppData();

        if (data.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Benvenuto in CrescitaX!</h3>
                    <p>Inizia il tuo percorso di crescita personale aggiungendo la tua prima abitudine.</p>
                    <button class="btn btn--primary" onclick="document.getElementById('add-habit-btn').click()">Aggiungi Prima Abitudine</button>
                </div>
            `;
            return;
        }

        const habitsHtml = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return this.createHabitCard(metrics);
        }).join('');

        container.innerHTML = habitsHtml;

        // Add event listeners
        data.habits.forEach(habit => {
            const completeBtn = document.getElementById(`complete-${habit.id}`);
            const cancelBtn = document.getElementById(`cancel-${habit.id}`);
            const editBtn = document.getElementById(`edit-${habit.id}`);
            
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    this.toggleHabitCompletion(habit.id);
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.toggleHabitCompletion(habit.id);
                });
            }

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.editHabit(habit.id);
                });
            }
        });
    }

    createHabitCard(metrics) {
        const { habit, totalDays, completedDays, percentage, currentStreak, longestStreak, completedToday } = metrics;
        
        const circumference = 2 * Math.PI * 54;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        const description = habit.description || '';

        return `
            <div class="habit-card" style="border-color: ${habit.color}">
                <div class="habit-actions-top">
                    <div class="habit-action-icon" id="edit-${habit.id}" title="Modifica abitudine">⚙️</div>
                </div>
                
                <div class="habit-header">
                    <h3 class="habit-name">${habit.name}</h3>
                    <div class="habit-color" style="background-color: ${habit.color}"></div>
                </div>
                
                ${description ? `<div class="habit-description">${description}</div>` : ''}
                
                <div class="progress-section">
                    <div class="circular-progress">
                        <svg class="progress-ring" width="120" height="120">
                            <circle class="progress-ring-bg" cx="60" cy="60" r="54"/>
                            <circle class="progress-ring-fill" cx="60" cy="60" r="54"
                                stroke="${habit.color}"
                                stroke-dasharray="${strokeDasharray}"
                                stroke-dashoffset="${strokeDashoffset}"/>
                        </svg>
                        <div class="progress-text">${percentage}%</div>
                    </div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">📅 Totale</span>
                        <span class="metric-value">${totalDays}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">✅ Completato</span>
                        <span class="metric-value">${completedDays}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">🔥 Streak</span>
                        <span class="metric-value">${currentStreak}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">🏆 Record</span>
                        <span class="metric-value">${longestStreak}</span>
                    </div>
                </div>

                <div class="habit-actions">
                    ${completedToday ? 
                        `<button class="action-btn undo-btn" id="cancel-${habit.id}">❌ Annulla Completamento</button>` :
                        `<button class="action-btn action-btn--complete" id="complete-${habit.id}">🔄 Completa Oggi</button>`
                    }
                </div>
            </div>
        `;
    }

    toggleHabitCompletion(habitId) {
        const data = loadAppData();
        const habit = data.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = getTodayString();
        if (!habit.completions) habit.completions = {};

        const wasCompleted = habit.completions[today] && habit.completions[today].completed;

        if (habit.completions[today]) {
            habit.completions[today].completed = !habit.completions[today].completed;
        } else {
            habit.completions[today] = { completed: true, timestamp: new Date().toISOString() };
        }

        // Mostra animazione punti solo se è un nuovo completamento
        if (!wasCompleted && habit.completions[today].completed) {
            const buttonElement = document.getElementById(`complete-${habitId}`);
            showPointAnimation(APP_CONFIG.pointsSystem.habitCompletion, 'habit-completion', buttonElement);
            
            // Verifica streak bonus
            const metrics = calculateHabitMetrics(habit);
            if (metrics.currentStreak > 0 && metrics.currentStreak % 7 === 0) {
                setTimeout(() => {
                    showPointAnimation(APP_CONFIG.pointsSystem.streak7Days, 'streak-bonus', buttonElement);
                }, 500);
            }
        }

        saveAppData(data);
        this.renderDashboard();
        this.refreshRelatedSections();
    }

    editHabit(habitId) {
        const data = loadAppData();
        const habit = data.habits.find(h => h.id === habitId);
        if (!habit) return;

        this.editingHabitId = habitId;
        document.getElementById('habitModalTitle').textContent = 'Modifica Abitudine';
        document.getElementById('habitName').value = habit.name;
        document.getElementById('habit-description').value = habit.description || '';
        this.selectColor(habit.color);
        document.getElementById('habitModal').style.display = 'flex';
    }

    // ===== STATUS SECTION - ENHANCED =====
    renderStatus() {
        const data = loadAppData();
        const points = calculateTotalPoints(data);
        const level = calculateLevel(points);
        const levelInfo = getLevelInfo(level);
        const nextThreshold = getNextLevelThreshold(level);
        
        // Update data
        data.userStats.points = points;
        saveAppData(data);
        
        // Highlight current level in table
        this.highlightCurrentLevelInTable(level);
        
        // Update level display
        document.getElementById('currentLevel').textContent = level;
        document.getElementById('currentLevel').style.background = levelInfo.color;
        
        // Calculate progress to next level
        const currentLevelThreshold = level > 1 ? APP_CONFIG.levels[level - 2].threshold : 0;
        const progress = level >= APP_CONFIG.levels.length ? 100 : 
            ((points - currentLevelThreshold) / (nextThreshold - currentLevelThreshold)) * 100;
        
        const pointsToNext = Math.max(0, nextThreshold - points);
        
        document.getElementById('levelProgress').style.width = `${Math.min(100, progress)}%`;
        document.getElementById('pointsText').textContent = `${points} / ${nextThreshold} punti`;
        document.getElementById('nextLevelText').textContent = 
            level >= APP_CONFIG.levels.length ? 
            "Livello massimo raggiunto!" : 
            `Prossimo livello: ${pointsToNext} punti mancanti`;
        
        // Update badges
        this.updateStatusBadges(data, points);
    }

    highlightCurrentLevelInTable(currentLevel) {
        // Remove existing highlights
        document.querySelectorAll('.levels-table tr').forEach(row => {
            row.classList.remove('current-level');
        });
        
        // Add highlight to current level
        const currentRow = document.querySelector(`.levels-table tr[data-level="${currentLevel}"]`);
        if (currentRow) {
            currentRow.classList.add('current-level');
        }
    }

    updateStatusBadges(data, points) {
        const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid) return;
        
        let totalChallengesCompleted = 0;
        [].forEach((_, index) => {
            const stats = calcolaStatisticheSfida(index);
            totalChallengesCompleted += stats.completate;
        });
        
        const maxStreak = Math.max(...data.habits.map(h => calculateLongestStreak(h)), 0);
        
        const badges = [
            { 
                icon: '🌱', 
                name: 'Novizio', 
                unlocked: true,
                tooltip: 'Primo livello raggiunto'
            },
            { 
                icon: '🔥', 
                name: 'Costante', 
                unlocked: maxStreak >= 7,
                tooltip: 'Mantieni streak ≥7 giorni consecutivi'
            },
            { 
                icon: '🎯', 
                name: 'Sfida Master', 
                unlocked: totalChallengesCompleted >= 3,
                tooltip: 'Completa almeno 3 sfide al 100%'
            },
            { 
                icon: '👑', 
                name: 'Guru', 
                unlocked: points >= 2000 && maxStreak >= 30,
                tooltip: 'Raggiungi livello 5+ con streak ≥30 giorni'
            }
        ];
        
        badgesGrid.innerHTML = badges.map(b => `
            <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}" data-tooltip="${b.tooltip}">
                <span class="badge-icon">${b.icon}</span>
                <span class="badge-name">${b.name}</span>
            </div>
        `).join('');
    }

    // ===== QUOTES SECTION - NEW =====
    renderQuotes() {
        const dailyQuote = getDailyQuote();
        const data = loadAppData();
        
        // Update daily quote
        document.getElementById('dailyQuote').textContent = `"${dailyQuote.text}"`;
        document.getElementById('quoteAuthor').textContent = `— ${dailyQuote.author}`;
        
        // Store current quote for sharing/favoriting
        this.currentQuote = dailyQuote;
        
        // Render favorite quotes
        this.renderFavoriteQuotes(data.favoriteQuotes);
    }

    renderFavoriteQuotes(favoriteQuotes) {
        const container = document.getElementById('favoriteQuotesList');
        
        if (favoriteQuotes.length === 0) {
            container.innerHTML = '<div class="empty-favorites">Nessuna citazione preferita ancora salvata</div>';
            return;
        }
        
        container.innerHTML = favoriteQuotes.map(quote => `
            <div class="favorite-quote-item">
                <button class="remove-favorite-btn" data-quote-id="${quote.id}" title="Rimuovi dai preferiti">×</button>
                <div class="favorite-quote-text">"${quote.text}"</div>
                <div class="favorite-quote-author">— ${quote.author}</div>
            </div>
        `).join('');
        
        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quoteId = e.target.dataset.quoteId;
                if (confirm('Rimuovere questa citazione dai preferiti?')) {
                    removeFromFavorites(quoteId);
                    }
            });
        });
    }

    shareQuote() {
        if (this.currentQuote) {
            const text = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Citazione Motivazionale',
                    text: text
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(text).then(() => {
                    alert('Citazione copiata negli appunti!');
                }).catch(() => {
                    alert('Impossibile copiare la citazione');
                });
            }
        }
    }

    favoriteQuote() {
        if (this.currentQuote) {
            const added = addToFavorites(this.currentQuote);
            if (added) {
                alert('Citazione aggiunta ai preferiti!');
                } else {
                alert('Questa citazione è già nei tuoi preferiti!');
            }
        }
    }

    // ===== CALENDAR =====
    renderCalendar() {
        this.updateCalendarHeader();
        this.renderCalendarGrid();
    }

    updateCalendarHeader() {
        const monthName = this.currentMonth.toLocaleDateString('it-IT', { 
            month: 'long', 
            year: 'numeric' 
        });
        document.getElementById('currentMonth').textContent = 
            monthName.charAt(0).toUpperCase() + monthName.slice(1);
    }

    renderCalendarGrid() {
        const container = document.getElementById('calendarGrid');
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        let html = daysOfWeek.map(day => 
            `<div class="calendar-day-header">${day}</div>`
        ).join('');

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        const today = new Date();
        const todayStr = formatDate(today);
        const data = loadAppData();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            
            let className = 'calendar-day';
            if (dateStr === todayStr) className += ' today';
            
            const hasCompletions = data.habits.some(habit => 
                habit.completions && habit.completions[dateStr] && habit.completions[dateStr].completed
            );
            const hasMissed = data.habits.some(habit => {
                const startDate = new Date(habit.startDate);
                return date >= startDate && date < today && 
                       (!habit.completions || !habit.completions[dateStr] || !habit.completions[dateStr].completed);
            });

            if (hasCompletions) className += ' completed';
            else if (hasMissed && date < today) className += ' missed';

            html += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
        }

        const remainingCells = 42 - (startDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        container.innerHTML = html;

        // Add click event to calendar days
        container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                this.showCalendarModal(day.dataset.date);
            });
        });
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    showCalendarModal(dateStr) {
        this.selectedCalendarDate = dateStr;
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('calendarModalTitle').textContent = 
            `Modifica ${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}`;

        const form = document.getElementById('calendarHabitsForm');
        const data = loadAppData();
        const habits = data.habits.filter(habit => {
            const startDate = new Date(habit.startDate);
            return date >= startDate;
        });

        if (habits.length === 0) {
            form.innerHTML = '<p>Nessuna abitudine disponibile per questa data.</p>';
        } else {
            form.innerHTML = habits.map(habit => {
                const completion = habit.completions && habit.completions[dateStr];
                const isCompleted = completion ? completion.completed : false;
                
                return `
                    <div class="calendar-habit-item">
                        <div class="calendar-habit-name">
                            <div class="habit-color-dot" style="background-color: ${habit.color}"></div>
                            ${habit.name}
                        </div>
                        <div class="calendar-habit-toggle ${isCompleted ? 'completed' : ''}" 
                             data-habit-id="${habit.id}"></div>
                    </div>
                `;
            }).join('');

            form.querySelectorAll('.calendar-habit-toggle').forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.target.classList.toggle('completed');
                });
            });
        }

        document.getElementById('calendarModal').style.display = 'flex';
    }

    hideCalendarModal() {
        document.getElementById('calendarModal').style.display = 'none';
    }

    saveCalendarChanges() {
        const form = document.getElementById('calendarHabitsForm');
        const toggles = form.querySelectorAll('.calendar-habit-toggle');
        const data = loadAppData();
        
        toggles.forEach(toggle => {
            const habitId = toggle.dataset.habitId;
            const isCompleted = toggle.classList.contains('completed');
            const habit = data.habits.find(h => h.id === habitId);
            
            if (habit) {
                if (!habit.completions) habit.completions = {};
                habit.completions[this.selectedCalendarDate] = {
                    completed: isCompleted,
                    timestamp: new Date().toISOString()
                };
            }
        });

        saveAppData(data);
        this.hideCalendarModal();
        this.renderCalendar();
        this.refreshRelatedSections();
    }

    // ===== CHALLENGES =====
    renderChallenges() {
        const container = document.getElementById('challengesGrid');

        const challengesHtml = [].map((challengeName, index) => {
            const activeChallenge = loadActiveChallenge(index);
            const isActive = activeChallenge && activeChallenge.isActive;
            
            let progress = 0;
            if (isActive && activeChallenge.completions) {
                progress = activeChallenge.completions.filter(c => c).length;
            }
            
            return `
                <div class="challenge-card ${isActive ? 'active' : 'inactive'}">
                    <div class="challenge-header">
                        <h4 class="challenge-title">${challengeName}</h4>
                        <div class="challenge-status">
                            ${isActive ? '<span class="challenge-status-active">Attivata</span>' : '<span class="challenge-status-inactive">Inattiva</span>'}
                        </div>
                    </div>
                    ${isActive ? `
                        <div class="challenge-weekly-calendar">
                            <div class="challenge-days-grid">
                                ${[1,2,3,4,5,6,7].map(day => `
                                    <div class="challenge-day-item">
                                        <label class="challenge-day-label">
                                            <input type="checkbox" class="challenge-day-checkbox" 
                                                   data-challenge-id="${index}" data-day="${day-1}"
                                                   ${activeChallenge.completions[day-1] ? 'checked' : ''}>
                                            <span class="challenge-day-text">Giorno ${day}</span>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="challenge-progress">
                                <div class="challenge-progress-bar">
                                    <div class="challenge-progress-fill" style="width: ${(progress / 7) * 100}%"></div>
                                </div>
                                <div class="challenge-progress-text">${progress}/7 giorni completati</div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="challenge-actions">
                        <button class="btn ${isActive ? 'btn--secondary' : 'btn--primary'} challenge-activate-btn" 
                                data-challenge-id="${index}">
                            ${isActive ? 'Disattiva' : 'Attiva'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = challengesHtml;

        this.renderChallengeStatistics();

        // Add event listeners
        document.querySelectorAll('.challenge-activate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = parseInt(e.target.dataset.challengeId);
                this.toggleChallenge(challengeId);
            });
        });

        document.querySelectorAll('.challenge-day-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const challengeId = parseInt(e.target.dataset.challengeId);
                const day = parseInt(e.target.dataset.day);
                this.updateChallengeDay(challengeId, day, e.target.checked);
            });
        });
    }

    renderChallengeStatistics() {
        const statsContainer = document.getElementById('challengeStatsContainer');
        
        const statisticsData = [].map((challengeName, index) => {
            const stats = calcolaStatisticheSfida(index);
            return {
                id: index,
                name: challengeName,
                ...stats
            };
        }).filter(s => s.tentativi > 0);

        if (statisticsData.length === 0) {
            statsContainer.innerHTML = `
                <div class="challenge-stats-section">
                    <h3>📊 LE TUE STATISTICHE SFIDE</h3>
                    <div class="empty-stats">
                        <p>Nessuna sfida ancora tentata. Attiva una sfida per iniziare a tracciare le tue statistiche!</p>
                    </div>
                </div>
            `;
            return;
        }

        const tableRows = statisticsData.map(stat => {
            const successColor = stat.successRate >= 80 ? 'success' : 
                                stat.successRate >= 50 ? 'warning' : 'error';
            
            return `
                <tr class="stats-row-${successColor}">
                    <td class="stats-challenge-name">
                        ${stat.name}
                        ${stat.badge ? `<span class="challenge-badge">${stat.badge}</span>` : ''}
                    </td>
                    <td>${stat.tentativi}</td>
                    <td>${stat.completate}</td>
                    <td class="stats-success-rate">${stat.successRate}%</td>
                    <td>${stat.bestStreak}</td>
                    <td>${stat.lastCompleted ? new Date(stat.lastCompleted).toLocaleDateString('it-IT') : 'Mai'}</td>
                </tr>
            `;
        }).join('');

        statsContainer.innerHTML = `
            <div class="challenge-stats-section">
                <h3>📊 LE TUE STATISTICHE SFIDE</h3>
                <div class="challenge-stats-table-container">
                    <table class="challenge-stats-table">
                        <thead>
                            <tr>
                                <th>Sfida</th>
                                <th>Tentativi</th>
                                <th>Completate</th>
                                <th>Successo</th>
                                <th>Miglior Streak</th>
                                <th>Ultima Volta</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    toggleChallenge(challengeId) {
        const activeChallenge = loadActiveChallenge(challengeId);
        const isActive = activeChallenge && activeChallenge.isActive;

        if (isActive) {
            if (activeChallenge.completions.some(c => c)) {
                const completedDays = activeChallenge.completions.filter(c => c).length;
                const maxConsecutive = this.calculateMaxConsecutiveDays(activeChallenge.completions);
                
                const historyEntry = {
                    startDate: activeChallenge.startDate,
                    endDate: new Date().toISOString(),
                    daysCompleted: completedDays,
                    maxConsecutiveDays: maxConsecutive,
                    completedDate: completedDays === 7 ? new Date().toISOString() : null
                };
                
                saveChallengeHistory(challengeId, historyEntry);
            }
            
            localStorage.removeItem(getActiveChallengeKey(challengeId));
        } else {
            const newChallenge = {
                isActive: true,
                startDate: new Date().toISOString(),
                completions: new Array(7).fill(false)
            };
            
            saveActiveChallenge(challengeId, newChallenge);
        }

        }

    updateChallengeDay(challengeId, day, completed) {
        const activeChallenge = loadActiveChallenge(challengeId);
        if (!activeChallenge) return;

        activeChallenge.completions[day] = completed;
        saveActiveChallenge(challengeId, activeChallenge);

        const progress = activeChallenge.completions.filter(c => c).length;
        const progressBar = document.querySelector(`[data-challenge-id="${challengeId}"] .challenge-progress-fill`);
        const progressText = document.querySelector(`[data-challenge-id="${challengeId}"] .challenge-progress-text`);
        
        if (progressBar) progressBar.style.width = `${(progress / 7) * 100}%`;
        if (progressText) progressText.textContent = `${progress}/7 giorni completati`;

        if (progress === 7) {
            setTimeout(() => {
                alert('🎉 Complimenti! Hai completato la sfida!');
                showPointAnimation(APP_CONFIG.pointsSystem.challengeComplete, 'challenge-completion');
            }, 100);
        }
    }

    calculateMaxConsecutiveDays(completions) {
        let maxStreak = 0;
        let currentStreak = 0;
        
        for (let i = 0; i < completions.length; i++) {
            if (completions[i]) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        return maxStreak;
    }

    // ===== STATISTICS =====
    renderStatistics() {
        const data = loadAppData();
        const tableBody = document.getElementById('statsTableBody');
        
        if (data.habits.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-stats">Nessuna abitudine creata</td></tr>';
            
            document.getElementById('active-habits-count').textContent = '0';
            document.getElementById('week-success').textContent = '0%';
            document.getElementById('total-completions').textContent = '0';
            return;
        }

        const tableRows = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return `
                <tr>
                    <td>${habit.name}</td>
                    <td>${metrics.totalDays}</td>
                    <td>${metrics.completedDays}</td>
                    <td>${metrics.percentage}%</td>
                    <td>${metrics.currentStreak}</td>
                    <td>${metrics.longestStreak}</td>
                </tr>
            `;
        }).join('');
        
        tableBody.innerHTML = tableRows;
        
        const activeHabits = data.habits.length;
        document.getElementById('active-habits-count').textContent = activeHabits;
        
        const today = new Date();
        let weeklyCompletions = 0;
        let weeklyPossible = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = formatDate(date);
            
            data.habits.forEach(habit => {
                const startDate = new Date(habit.startDate);
                if (date >= startDate) {
                    weeklyPossible++;
                    const completion = habit.completions && habit.completions[dateStr];
                    if (completion && completion.completed) {
                        weeklyCompletions++;
                    }
                }
            });
        }
        
        const weekSuccess = weeklyPossible > 0 ? Math.round((weeklyCompletions / weeklyPossible) * 100) : 0;
        document.getElementById('week-success').textContent = `${weekSuccess}%`;
        
        const totalCompletions = data.habits.reduce((sum, habit) => {
            return sum + Object.values(habit.completions || {}).filter(c => c.completed).length;
        }, 0);
        
        document.getElementById('total-completions').textContent = totalCompletions;
    }

    // ===== CHARTS =====
    switchChartMode(mode) {
        this.currentChartMode = mode;
        
        document.getElementById('chartFilterNumbers').classList.toggle('active', mode === 'numbers');
        document.getElementById('chartFilterPercentages').classList.toggle('active', mode === 'percentages');
        
        this.renderCharts();
    }

    renderCharts() {
        const data = loadAppData();
        
        if (data.habits.length === 0) {
            document.getElementById('chartsContainer').innerHTML = `
                <div class="empty-state">
                    <h3>Nessun dato disponibile</h3>
                    <p>Aggiungi delle abitudini per visualizzare i grafici.</p>
                </div>
            `;
            return;
        }

        this.renderChart1();
        this.renderChart2();
        this.renderChart3();
        this.renderChart4();
    }

    renderChart1() {
        const data = loadAppData();
        const ctx = document.getElementById('chart1').getContext('2d');
        
        if (this.chartInstances.chart1) {
            this.chartInstances.chart1.destroy();
        }

        const labels = data.habits.map(h => h.name);
        const datasets = [];

        if (this.currentChartMode === 'numbers') {
            const completions = data.habits.map(habit => 
                Object.values(habit.completions || {}).filter(c => c.completed).length
            );
            datasets.push({
                label: 'Completamenti',
                data: completions,
                backgroundColor: '#1FB8CD',
                borderColor: '#1FB8CD'
            });
        } else {
            const percentages = data.habits.map(habit => {
                const metrics = calculateHabitMetrics(habit);
                return metrics.percentage;
            });
            datasets.push({
                label: 'Percentuale Successo',
                data: percentages,
                backgroundColor: '#FFC185',
                borderColor: '#FFC185'
            });
        }

        this.chartInstances.chart1 = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: this.currentChartMode === 'percentages' ? 100 : undefined
                    }
                }
            }
        });
    }

    renderChart2() {
        const data = loadAppData();
        const ctx = document.getElementById('chart2').getContext('2d');
        
        if (this.chartInstances.chart2) {
            this.chartInstances.chart2.destroy();
        }

        const labels = data.habits.map(h => h.name);
        const streaks = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return metrics.currentStreak;
        });

        this.chartInstances.chart2 = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Streak Attuale',
                    data: streaks,
                    backgroundColor: '#B4413C',
                    borderColor: '#B4413C',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderChart3() {
        const data = loadAppData();
        const ctx = document.getElementById('chart3').getContext('2d');
        
        if (this.chartInstances.chart3) {
            this.chartInstances.chart3.destroy();
        }

        const labels = data.habits.map(h => h.name);
        const currentStreaks = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return metrics.currentStreak;
        });
        const recordStreaks = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return metrics.longestStreak;
        });

        this.chartInstances.chart3 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Streak Attuale',
                        data: currentStreaks,
                        backgroundColor: '#ECEBD5',
                        borderColor: '#ECEBD5'
                    },
                    {
                        label: 'Record Streak',
                        data: recordStreaks,
                        backgroundColor: '#5D878F',
                        borderColor: '#5D878F'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderChart4() {
        const data = loadAppData();
        const ctx = document.getElementById('chart4').getContext('2d');
        
        if (this.chartInstances.chart4) {
            this.chartInstances.chart4.destroy();
        }

        const labels = data.habits.map(h => h.name);
        const percentages = data.habits.map(habit => {
            const metrics = calculateHabitMetrics(habit);
            return metrics.percentage;
        });

        this.chartInstances.chart4 = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: percentages,
                    backgroundColor: ['#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'].slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== REFLECTIONS =====
    renderReflections() {
        const data = loadAppData();
        const reflectionsList = document.getElementById('reflectionsList');
        
        if (data.reflections.length === 0) {
            reflectionsList.innerHTML = '<p class="empty-reflections">Nessuna riflessione ancora scritta</p>';
            return;
        }
        
        const sortedReflections = [...data.reflections].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        reflectionsList.innerHTML = sortedReflections.map(reflection => `
            <div class="reflection-item">
                <div class="reflection-header">
                    <span class="reflection-date">${new Date(reflection.date).toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                    <button class="reflection-delete" data-id="${reflection.id}">🗑️</button>
                </div>
                <p class="reflection-text">${reflection.text}</p>
            </div>
        `).join('');
        
        reflectionsList.querySelectorAll('.reflection-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Sei sicuro di voler eliminare questa riflessione?')) {
                    this.deleteReflection(btn.dataset.id);
                }
            });
        });
    }
    
    saveReflection() {
        const textArea = document.getElementById('reflectionText');
        const text = textArea.value.trim();
        
        if (!text) {
            alert('Per favore scrivi qualcosa prima di salvare.');
            return;
        }
        
        const data = loadAppData();
        const newReflection = {
            id: generateId(),
            date: new Date().toISOString(),
            text: text
        };
        
        data.reflections.push(newReflection);
        saveAppData(data);
        
        textArea.value = '';
        this.renderReflections();
        this.refreshRelatedSections();
        
        // Show points animation
        showPointAnimation(APP_CONFIG.pointsSystem.reflection, 'reflection-bonus', document.getElementById('saveReflection'));
    }
    
    deleteReflection(id) {
        const data = loadAppData();
        data.reflections = data.reflections.filter(r => r.id !== id);
        saveAppData(data);
        this.renderReflections();
        this.refreshRelatedSections();
    }

    // ===== MODALS =====
    showHabitModal() {
        this.editingHabitId = null;
        document.getElementById('habitModalTitle').textContent = 'Aggiungi Nuova Abitudine';
        document.getElementById('habitName').value = '';
        document.getElementById('habit-description').value = '';
        this.selectColor(APP_CONFIG.colors[0]);
        document.getElementById('habitModal').style.display = 'flex';
        document.getElementById('habitName').focus();
    }

    hideHabitModal() {
        document.getElementById('habitModal').style.display = 'none';
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
    }

    saveHabit() {
        const name = document.getElementById('habitName').value.trim();
        const description = document.getElementById('habit-description').value.trim();
        
        if (!name) {
            alert('Inserisci il nome dell\'abitudine');
            return;
        }

        const data = loadAppData();
        
        if (this.editingHabitId) {
            const habit = data.habits.find(h => h.id === this.editingHabitId);
            if (habit) {
                habit.name = name;
                habit.description = description;
                habit.color = this.selectedColor;
            }
        } else {
            const habit = {
                id: generateId(),
                name: name,
                description: description,
                color: this.selectedColor,
                startDate: getTodayString(),
                completions: {}
            };
            data.habits.push(habit);
        }

        saveAppData(data);
        this.hideHabitModal();
        this.renderDashboard();
        this.refreshRelatedSections();
    }
    
    refreshRelatedSections() {
        if (this.currentSection === 'statistiche') {
            this.renderStatistics();
        } else if (this.currentSection === 'grafici') {
            this.renderCharts();
        } else if (this.currentSection === 'status') {
            this.renderStatus();
        } else if (this.currentSection === 'calendario') {
            this.renderCalendar();
        } else if (this.currentSection === 'sfide') {
            } else if (this.currentSection === 'citazioni') {
            }
    }
}

// ===== INIZIALIZZAZIONE =====
let ui;

document.addEventListener('DOMContentLoaded', () => {
    ui = new UIManager();
    window.ui = ui;
    
    console.log('CrescitaX v4.0 - Status Chiaro + Citazioni Motivazionali');
    
    // Inizializza con badge Costante attivo per testare
    const data = loadAppData();
    const maxStreak = Math.max(...data.habits.map(h => calculateLongestStreak(h)), 0);
    console.log(`Test data loaded - Level 3 (⭐ Praticante), Points: ${data.userStats.points}, Max Streak: ${maxStreak}`);
});