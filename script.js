document.addEventListener('DOMContentLoaded', () => {
    console.log("LABX System Initializing...");
    
    // Initialize all systems in correct order
    initThemeSystem();
    initPreloader();
    initAudioSystem();
    initMobileMenu();
    initInputValidation();
    initFingerprintScanners();
    initResultsSystem(); // Must be before scan system
    initScanSystem();
    loadSavedResults();
    
    // Set current year in footer
    document.querySelector('.copyright').textContent = document.querySelector('.copyright').textContent.replace('2024', new Date().getFullYear());
    
    console.log("LABX System Ready!");
});

// ====================
// THEME SYSTEM
// ====================
function initThemeSystem() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themePanel = document.getElementById('themePanel');
    const closeThemePanel = document.getElementById('closeThemePanel');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Get saved theme or default to blue
    const savedTheme = localStorage.getItem('labxTheme') || 'blue';
    
    // Apply saved theme
    applyTheme(savedTheme);
    
    // Set active theme option
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            
            // Update active theme option
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Close theme panel
            themePanel.classList.remove('active');
            
            // Save to localStorage
            localStorage.setItem('labxTheme', theme);
            
            playSound('clickSound');
        });
    });
    
    // Toggle theme panel
    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePanel.classList.toggle('active');
        playSound('clickSound');
    });
    
    closeThemePanel.addEventListener('click', () => {
        themePanel.classList.remove('active');
        playSound('clickSound');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!themePanel.contains(e.target) && !themeToggleBtn.contains(e.target)) {
            themePanel.classList.remove('active');
        }
    });
}

function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith('theme-')));
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
}

// ====================
// PRELOADER SYSTEM
// ====================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const logoLetters = document.querySelectorAll('.logo-letter');
    const logoSubtitle = document.querySelector('.logo-subtitle');
    
    // Initialize letters position
    logoLetters.forEach(letter => {
        letter.style.opacity = '0';
        letter.style.transform = 'translateY(-150px) scale(0.7)';
    });
    
    logoSubtitle.style.opacity = '0';
    logoSubtitle.style.transform = 'translateX(-150px)';
    
    // Start preloader animation sequence
    setTimeout(() => {
        // Animate letters falling and bouncing
        logoLetters.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.animation = `bounceLetter 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
                letter.style.animationDelay = `${index * 0.25}s`;
            }, index * 250);
        });
        
        // Animate subtitle slide-in after letters
        setTimeout(() => {
            logoSubtitle.style.animation = `slideInSubtitle 1s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
            logoSubtitle.style.animationDelay = '0.3s';
        }, logoLetters.length * 250 + 600);
        
        // Complete preloader and transition to main content
        setTimeout(() => {
            // Fade out preloader
            preloader.classList.add('fade-out');
            
            // Fade in main content
            setTimeout(() => {
                mainContent.classList.add('loaded');
                
                // Remove preloader from DOM after transition
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1000);
            }, 500);
        }, 3500);
    }, 500);
}

// ====================
// AUDIO SYSTEM
// ====================
function initAudioSystem() {
    // Initialize audio elements
    document.querySelectorAll('audio').forEach(audio => {
        audio.volume = 0.3;
        audio.muted = false;
        
        // Try to play to unlock audio (required for some browsers)
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {
            // Audio may be blocked by browser policy
            console.log('Audio autoplay may be blocked by browser policy');
        });
    });
}

function playSound(soundId, loop = false) {
    const audio = document.getElementById(soundId);
    if (!audio) return null;
    
    try {
        // Clone audio element to allow multiple plays
        const audioClone = audio.cloneNode();
        audioClone.loop = loop;
        audioClone.volume = 0.3;
        
        // Play the clone
        audioClone.play().catch(e => {
            console.log('Audio play failed:', e.message);
        });
        
        // Remove clone when done (if not looping)
        if (!loop) {
            audioClone.onended = () => {
                audioClone.remove();
            };
        }
        
        return audioClone;
    } catch (e) {
        console.log('Error playing sound:', e);
        return null;
    }
}

function stopSound(soundId) {
    const audio = document.getElementById(soundId);
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Try to use a nice voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Daniel')
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// ====================
// MOBILE MENU
// ====================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        menuToggle.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
        
        playSound('clickSound');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// ====================
// INPUT VALIDATION SYSTEM
// ====================
function initInputValidation() {
    const femaleInput = document.getElementById('femaleName');
    const maleInput = document.getElementById('maleName');
    const femaleValidation = document.getElementById('femaleValidation');
    const maleValidation = document.getElementById('maleValidation');
    const validateBtn = document.getElementById('validateBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let femaleValid = false;
    let maleValid = false;
    
    function validateInput(input, validationElement, fieldName, isFemale) {
        const value = input.value.trim();
        
        if (!value) {
            validationElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${fieldName} name is required`;
            validationElement.className = 'input-validation error';
            return false;
        } else if (value.length < 2) {
            validationElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${fieldName} name must be at least 2 characters`;
            validationElement.className = 'input-validation error';
            return false;
        } else if (!/^[A-Za-z\s\-']+$/.test(value)) {
            validationElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${fieldName} name can only contain letters, spaces, hyphens, and apostrophes`;
            validationElement.className = 'input-validation error';
            return false;
        } else {
            validationElement.innerHTML = `<i class="fas fa-check-circle"></i> Valid`;
            validationElement.className = 'input-validation success';
            
            // Update scanner label
            const scannerLabel = isFemale ? 
                document.getElementById('leftName') : 
                document.getElementById('rightName');
            scannerLabel.textContent = value;
            
            return true;
        }
    }
    
    function updateValidationButton() {
        femaleValid = validateInput(femaleInput, femaleValidation, 'Female', true);
        maleValid = validateInput(maleInput, maleValidation, 'Male', false);
        
        // Update validate button text
        if (femaleValid && maleValid) {
            validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Names Validated';
            validateBtn.disabled = false;
            validateBtn.classList.add('validated');
            
            // Enable fingerprints
            enableFingerprints();
        } else {
            validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Validate Names';
            validateBtn.disabled = false;
            validateBtn.classList.remove('validated');
            
            // Disable fingerprints
            disableFingerprints();
        }
    }
    
    function enableFingerprints() {
        const leftScanner = document.getElementById('leftScanner');
        const rightScanner = document.getElementById('rightScanner');
        
        leftScanner.classList.remove('locked');
        rightScanner.classList.remove('locked');
        
        document.getElementById('leftInstruction').textContent = 'Tap to activate';
        document.getElementById('rightInstruction').textContent = 'Tap to activate';
        
        // Update status message
        updateStatusMessage('Tap both fingerprints to begin scan', 'info');
    }
    
    function disableFingerprints() {
        const leftScanner = document.getElementById('leftScanner');
        const rightScanner = document.getElementById('rightScanner');
        
        leftScanner.classList.add('locked');
        rightScanner.classList.add('locked');
        leftScanner.classList.remove('active');
        rightScanner.classList.remove('active');
        
        document.querySelectorAll('.scan-line').forEach(line => line.classList.remove('active'));
        document.getElementById('leftInstruction').textContent = 'Validate names first';
        document.getElementById('rightInstruction').textContent = 'Validate names first';
        
        // Disable start scan button
        document.getElementById('startScanBtn').disabled = true;
        
        // Update status message
        updateStatusMessage('Validate names to enable scanning', 'info');
    }
    
    function updateStatusMessage(message, icon = 'info') {
        const iconMap = {
            'info': 'fa-info-circle',
            'scan': 'fa-sync-alt',
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle'
        };
        
        const statusText = document.getElementById('statusText');
        const statusIcon = document.querySelector('#statusMessage i');
        
        statusText.textContent = message;
        statusIcon.className = `fas ${iconMap[icon]}`;
        
        if (icon === 'scan') {
            statusIcon.classList.add('scanning');
        } else {
            statusIcon.classList.remove('scanning');
        }
    }
    
    // Event listeners
    femaleInput.addEventListener('input', () => {
        femaleValid = validateInput(femaleInput, femaleValidation, 'Female', true);
        updateValidationButton();
    });
    
    maleInput.addEventListener('input', () => {
        maleValid = validateInput(maleInput, maleValidation, 'Male', false);
        updateValidationButton();
    });
    
    femaleInput.addEventListener('blur', () => validateInput(femaleInput, femaleValidation, 'Female', true));
    maleInput.addEventListener('blur', () => validateInput(maleInput, maleValidation, 'Male', false));
    
    validateBtn.addEventListener('click', () => {
        updateValidationButton();
        if (femaleValid && maleValid) {
            playSound('clickSound');
            
            // Scroll to scan section
            setTimeout(() => {
                document.querySelector('.scan-section').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        } else {
            playSound('errorSound');
        }
    });
    
    clearBtn.addEventListener('click', () => {
        femaleInput.value = '';
        maleInput.value = '';
        femaleValidation.innerHTML = '';
        maleValidation.innerHTML = '';
        femaleValidation.className = 'input-validation';
        maleValidation.className = 'input-validation';
        validateBtn.classList.remove('validated');
        femaleValid = false;
        maleValid = false;
        
        // Reset scanner labels
        document.getElementById('leftName').textContent = 'Female';
        document.getElementById('rightName').textContent = 'Male';
        
        // Disable fingerprints
        disableFingerprints();
        
        // Reset status message
        updateStatusMessage('Awaiting name validation...', 'info');
        
        playSound('clickSound');
    });
    
    // Initialize validation
    updateValidationButton();
}

// ====================
// FINGERPRINT SCANNER SYSTEM
// ====================
function initFingerprintScanners() {
    const leftScanner = document.getElementById('leftScanner');
    const rightScanner = document.getElementById('rightScanner');
    const leftScanLine = document.getElementById('leftScanLine');
    const rightScanLine = document.getElementById('rightScanLine');
    const startScanBtn = document.getElementById('startScanBtn');
    
    // Global state variables
    window.leftActive = false;
    window.rightActive = false;
    
    function toggleScanner(scanner, scanLine, isLeft) {
        // Don't allow activation if names aren't validated
        const validateBtn = document.getElementById('validateBtn');
        if (!validateBtn.classList.contains('validated')) {
            playSound('errorSound');
            return;
        }
        
        // Don't allow activation if scan is in progress
        if (document.getElementById('scanStatus').classList.contains('scanning')) {
            return;
        }
        
        if (isLeft ? window.leftActive : window.rightActive) {
            // Deactivate scanner
            scanner.classList.remove('active');
            scanLine.classList.remove('active');
            if (isLeft) window.leftActive = false;
            else window.rightActive = false;
        } else {
            // Activate scanner
            scanner.classList.add('active');
            scanLine.classList.add('active');
            if (isLeft) window.leftActive = true;
            else window.rightActive = true;
            
            // Play activation sound
            playSound('clickSound');
        }
        
        // Update start scan button state
        startScanBtn.disabled = !(window.leftActive && window.rightActive);
        
        if (window.leftActive && window.rightActive) {
            updateStatusMessage('Ready to scan! Click "Begin Analysis"', 'success');
        } else if (window.leftActive || window.rightActive) {
            updateStatusMessage('Activate both fingerprints to begin', 'info');
        } else {
            updateStatusMessage('Tap both fingerprints to begin scan', 'info');
        }
    }
    
    // Event listeners
    leftScanner.addEventListener('click', (e) => {
        if (!leftScanner.classList.contains('locked')) {
            toggleScanner(leftScanner, leftScanLine, true);
        }
    });
    
    rightScanner.addEventListener('click', (e) => {
        if (!rightScanner.classList.contains('locked')) {
            toggleScanner(rightScanner, rightScanLine, false);
        }
    });
    
    // Touch support for mobile
    leftScanner.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!leftScanner.classList.contains('locked')) {
            toggleScanner(leftScanner, leftScanLine, true);
        }
    });
    
    rightScanner.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!rightScanner.classList.contains('locked')) {
            toggleScanner(rightScanner, rightScanLine, false);
        }
    });
}

// ====================
// RESULTS SYSTEM (MUST BE DEFINED BEFORE SCAN SYSTEM)
// ====================
function initResultsSystem() {
    const copyResultsBtn = document.getElementById('copyResultsBtn');
    const shareResultsBtn = document.getElementById('shareResultsBtn');
    const saveResultsBtn = document.getElementById('saveResultsBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Generate deterministic hash from names
    function generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    
    // Generate seeded random number between min and max
    function seededRandom(seed, min, max) {
        const x = Math.sin(seed++) * 10000;
        const random = x - Math.floor(x);
        return Math.floor(random * (max - min + 1)) + min;
    }
    
    // Generate results based on names (deterministic) - MUST BE GLOBAL
    window.generateResults = function(femaleName, maleName) {
        console.log("Generating results for:", femaleName, maleName);
        
        const pairString = `${femaleName.toLowerCase().trim()}|${maleName.toLowerCase().trim()}`;
        const hash = generateHash(pairString);
        
        // Use hash as seed for deterministic random generation
        let seed = hash;
        
        // Generate metrics (70-99% range for good matches)
        const results = {
            femaleName: femaleName,
            maleName: maleName,
            timestamp: new Date().toISOString(),
            
            // Generate metrics
            loveCompatibility: seededRandom(seed++, 70, 99),
            trustLevel: seededRandom(seed++, 70, 98),
            emotionalSync: seededRandom(seed++, 65, 97),
            longTermPotential: seededRandom(seed++, 68, 96),
            passionIndex: seededRandom(seed++, 72, 99),
            
            // Calculate overall score (weighted average)
            get overallScore() {
                const weights = { 
                    love: 0.25, 
                    trust: 0.25, 
                    emotion: 0.2, 
                    longterm: 0.15, 
                    passion: 0.15 
                };
                return Math.round(
                    this.loveCompatibility * weights.love +
                    this.trustLevel * weights.trust +
                    this.emotionalSync * weights.emotion +
                    this.longTermPotential * weights.longterm +
                    this.passionIndex * weights.passion
                );
            }
        };
        
        // Generate insights based on scores
        results.insights = generateInsights(results);
        
        return results;
    };
    
    function generateInsights(results) {
        const insights = [];
        const overall = results.overallScore;
        
        // Overall assessment
        if (overall >= 90) {
            insights.push(`${results.femaleName} and ${results.maleName} demonstrate extraordinary compatibility with nearly perfect alignment across all key relationship dimensions.`);
            insights.push(`The neural and emotional resonance between you is exceptional, indicating a partnership with profound mutual understanding and long-term fulfillment potential.`);
            insights.push(`Your communication patterns show remarkable harmony, and trust indicators suggest a bond built on solid foundations with exceptional growth potential.`);
        } else if (overall >= 80) {
            insights.push(`${results.femaleName} and ${results.maleName} share an exceptionally strong connection with excellent emotional intelligence and communication compatibility.`);
            insights.push(`The trust metrics indicate a reliable foundation for long-term partnership, with emotional synchronization patterns that typically lead to deeply fulfilling relationships.`);
            insights.push(`Your passion index suggests strong romantic chemistry, while mental alignment indicators show excellent problem-solving compatibility.`);
        } else if (overall >= 70) {
            insights.push(`${results.femaleName} and ${results.maleName} have a solid foundation for a meaningful connection with good compatibility across most important relationship dimensions.`);
            insights.push(`The emotional resonance between you is positive, with trust indicators suggesting a partnership that can develop strong stability over time with mutual effort.`);
            insights.push(`Your communication styles show good alignment, and shared values in key areas provide excellent potential for relationship growth.`);
        } else if (overall >= 60) {
            insights.push(`${results.femaleName} and ${results.maleName} have several areas of notable compatibility that could form the basis of a meaningful connection.`);
            insights.push(`While not a perfect match, the relationship shows promising emotional resonance that can be nurtured into a stronger bond with conscious attention to communication patterns.`);
            insights.push(`Focusing on shared interests and values while maintaining realistic expectations about differences could lead to a satisfying partnership.`);
        } else {
            insights.push(`${results.femaleName} and ${results.maleName} have some compatibility areas that could form the basis of connection with mindful attention to differences.`);
            insights.push(`The relationship may require more intentional effort in communication and understanding to build lasting compatibility, but shared values in certain areas provide connection points worth exploring.`);
            insights.push(`Focusing on friendship foundations and shared activities could help build stronger emotional bonds over time.`);
        }
        
        return insights;
    }
    
    window.displayResults = function(results) {
        console.log("Displaying results:", results);
        
        const resultsCard = document.getElementById('resultsCard');
        const noResults = document.getElementById('noResults');
        const metricsGrid = document.getElementById('metricsGrid');
        const insightsContent = document.getElementById('insightsContent');
        
        // Show results card, hide "no results" message
        noResults.style.display = 'none';
        resultsCard.style.display = 'block';
        
        // Update basic info
        document.getElementById('resultsPairNames').textContent = `${results.femaleName} & ${results.maleName}`;
        document.getElementById('overallScore').textContent = `${results.overallScore}%`;
        
        // Format date nicely
        const date = new Date(results.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('resultsDate').textContent = formattedDate;
        
        // Update score description with first insight
        document.getElementById('scoreDescription').textContent = results.insights[0];
        
        // Clear and regenerate metrics grid
        metricsGrid.innerHTML = '';
        
        const metrics = [
            { name: '❤️ Love Compatibility', value: results.loveCompatibility, icon: 'fas fa-heart' },
            { name: '🤝 Trust Level', value: results.trustLevel, icon: 'fas fa-handshake' },
            { name: '⚡ Emotional Sync', value: results.emotionalSync, icon: 'fas fa-bolt' },
            { name: '📈 Long-Term Potential', value: results.longTermPotential, icon: 'fas fa-chart-line' },
            { name: '🔥 Passion Index', value: results.passionIndex, icon: 'fas fa-fire' }
        ];
        
        metrics.forEach(metric => {
            const metricElement = document.createElement('div');
            metricElement.className = 'metric-item';
            metricElement.innerHTML = `
                <div class="metric-header">
                    <i class="${metric.icon} metric-icon"></i>
                    <div class="metric-name">${metric.name}</div>
                </div>
                <div class="metric-value">${metric.value}%</div>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${metric.value}%"></div>
                </div>
            `;
            metricsGrid.appendChild(metricElement);
        });
        
        // Update insights
        insightsContent.innerHTML = '';
        results.insights.slice(1).forEach(insight => {
            const p = document.createElement('p');
            p.textContent = insight;
            insightsContent.appendChild(p);
        });
        
        // Animate metric bars with delay
        setTimeout(() => {
            document.querySelectorAll('.metric-fill').forEach((fill, index) => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, index * 200);
            });
        }, 500);
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 800);
    };
    
    window.saveResultToHistory = function(results) {
        // Get existing history
        let history = JSON.parse(localStorage.getItem('labxScanHistory') || '[]');
        
        // Check if this exact pair already exists in history
        const existingIndex = history.findIndex(item => 
            item.femaleName.toLowerCase() === results.femaleName.toLowerCase() &&
            item.maleName.toLowerCase() === results.maleName.toLowerCase()
        );
        
        // If exists, remove it (we'll add it back at the beginning)
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }
        
        // Add new result at beginning
        history.unshift({
            femaleName: results.femaleName,
            maleName: results.maleName,
            overallScore: results.overallScore,
            timestamp: results.timestamp,
            results: results
        });
        
        // Keep only last 15 results
        if (history.length > 15) {
            history = history.slice(0, 15);
        }
        
        // Save to localStorage
        localStorage.setItem('labxScanHistory', JSON.stringify(history));
        
        // Update displayed history
        loadSavedResults();
    };
    
    function loadSavedResults() {
        const savedList = document.getElementById('savedResultsList');
        const history = JSON.parse(localStorage.getItem('labxScanHistory') || '[]');
        
        savedList.innerHTML = '';
        
        if (history.length === 0) {
            savedList.innerHTML = `
                <div class="saved-item" style="justify-content: center; opacity: 0.7; text-align: center;">
                    <div>No previous scans found<br><small>Complete your first scan to see history</small></div>
                </div>
            `;
            return;
        }
        
        history.forEach((item, index) => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const savedItem = document.createElement('div');
            savedItem.className = 'saved-item';
            savedItem.dataset.index = index;
            savedItem.innerHTML = `
                <div>
                    <div class="saved-pair">${item.femaleName} & ${item.maleName}</div>
                    <div class="saved-date">${formattedDate}</div>
                </div>
                <div class="saved-score">${item.overallScore}%</div>
            `;
            
            // Click to load result
            savedItem.addEventListener('click', () => {
                displayResults(item.results);
                playSound('clickSound');
                
                // Scroll to results
                setTimeout(() => {
                    document.getElementById('results').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            });
            
            savedList.appendChild(savedItem);
        });
    }
    
    // Event listeners for result actions
    copyResultsBtn.addEventListener('click', () => {
        const pairNames = document.getElementById('resultsPairNames').textContent;
        const overallScore = document.getElementById('overallScore').textContent;
        const date = document.getElementById('resultsDate').textContent;
        
        const textToCopy = `LABX Compatibility Results\n${pairNames}\nOverall Match: ${overallScore}\nDate: ${date}\n\nView full results at: ${window.location.href}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Show feedback
            const originalHTML = copyResultsBtn.innerHTML;
            copyResultsBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyResultsBtn.style.color = 'var(--color-success)';
            
            setTimeout(() => {
                copyResultsBtn.innerHTML = originalHTML;
                copyResultsBtn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy results. Please try again.');
        });
        
        playSound('clickSound');
    });
    
    shareResultsBtn.addEventListener('click', () => {
        const pairNames = document.getElementById('resultsPairNames').textContent;
        const overallScore = document.getElementById('overallScore').textContent;
        
        if (navigator.share) {
            navigator.share({
                title: 'LABX Compatibility Results',
                text: `Check out our LABX compatibility results: ${pairNames} are a ${overallScore} match!`,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
            });
        } else {
            // Fallback: copy to clipboard
            const textToCopy = `Check out our LABX compatibility results: ${pairNames} are a ${overallScore} match!\n${window.location.href}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('Results link copied to clipboard! You can paste it to share.');
            });
        }
        
        playSound('clickSound');
    });
    
    saveResultsBtn.addEventListener('click', () => {
        // This happens automatically when results are generated
        // Just provide visual feedback
        const originalHTML = saveResultsBtn.innerHTML;
        saveResultsBtn.innerHTML = '<i class="fas fa-check"></i>';
        saveResultsBtn.style.color = 'var(--color-success)';
        
        setTimeout(() => {
            saveResultsBtn.innerHTML = originalHTML;
            saveResultsBtn.style.color = '';
        }, 2000);
        
        playSound('clickSound');
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved scan results? This action cannot be undone.')) {
            localStorage.removeItem('labxScanHistory');
            loadSavedResults();
            playSound('clickSound');
        }
    });
    
    // Load saved results on init
    loadSavedResults();
}

// ====================
// SCAN SYSTEM - FINAL FIX
// ====================
function initScanSystem() {
    const startScanBtn = document.getElementById('startScanBtn');
    const cancelScanBtn = document.getElementById('cancelScanBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const scanStatus = document.getElementById('scanStatus');
    const connectorPulse = document.querySelector('.connector-pulse');
    
    // Global scan state
    window.scanInProgress = false;
    window.scanProgress = 0;
    const scanDuration = 10000; // 10 seconds
    window.scanInterval = null;
    window.currentMessageIndex = 0;
    window.scanAudio = null;
    
    // Professional scan messages
    const scanMessages = [
        "Initializing biometric trust engine…",
        "Synchronizing emotional signals…",
        "Measuring heart-rate resonance…",
        "Analyzing neural compatibility patterns…",
        "Processing trust algorithms…",
        "Evaluating emotional intelligence metrics…",
        "Calibrating compatibility matrix…",
        "Computing relationship longevity…",
        "Finalizing compatibility analysis…",
        "Generating comprehensive results…"
    ];
    
    function startScan() {
        console.log("Start scan button clicked");
        
        if (window.scanInProgress) {
            console.log("Scan already in progress");
            return;
        }
        
        const femaleName = document.getElementById('femaleName').value.trim();
        const maleName = document.getElementById('maleName').value.trim();
        
        if (!femaleName || !maleName) {
            alert('Please validate both names before scanning.');
            playSound('errorSound');
            return;
        }
        
        if (!window.leftActive || !window.rightActive) {
            alert('Please activate both fingerprint scanners before starting the scan.');
            playSound('errorSound');
            return;
        }
        
        console.log("Starting scan for:", femaleName, "&", maleName);
        
        // Initialize scan
        window.scanInProgress = true;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        // Update UI
        scanStatus.classList.add('scanning');
        if (connectorPulse) connectorPulse.classList.add('scanning');
        startScanBtn.disabled = true;
        cancelScanBtn.disabled = false;
        document.getElementById('leftScanner').classList.add('locked');
        document.getElementById('rightScanner').classList.add('locked');
        
        // Start scan audio
        window.scanAudio = playSound('scanSound', true);
        
        // Update initial message
        updateStatusMessage(scanMessages[0], 'scan');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        // Start progress updates
        const startTime = Date.now();
        const updateInterval = 100; // Update every 100ms
        
        window.scanInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            window.scanProgress = Math.min((elapsed / scanDuration) * 100, 100);
            
            console.log("Scan progress:", window.scanProgress.toFixed(1), "%");
            
            // Update progress bar
            progressFill.style.width = `${window.scanProgress}%`;
            progressText.textContent = `${Math.floor(window.scanProgress)}%`;
            
            // Update message based on progress
            const messageIndex = Math.floor((window.scanProgress / 100) * (scanMessages.length - 1));
            if (messageIndex !== window.currentMessageIndex) {
                window.currentMessageIndex = messageIndex;
                updateStatusMessage(scanMessages[messageIndex], 'scan');
            }
            
            // Check if scan is complete
            if (window.scanProgress >= 100) {
                console.log("Scan complete!");
                completeScan(femaleName, maleName);
            }
        }, updateInterval);
    }
    
    function completeScan(femaleName, maleName) {
        console.log("Completing scan...");
        
        // Clear interval immediately
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        
        // Update UI for completion
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
        updateStatusMessage('Scan complete! Generating results...', 'success');
        
        // Stop scan audio immediately
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        // Play completion sound
        playSound('completeSound');
        
        // Use text-to-speech for completion message
        speakText('Scanning complete. Thanks for using LAB X.');
        
        // Generate and display results IMMEDIATELY
        setTimeout(() => {
            console.log("Generating results...");
            
            // Use the global generateResults function
            const results = window.generateResults(femaleName, maleName);
            
            if (results && window.displayResults) {
                window.displayResults(results);
                
                // Save to history
                if (window.saveResultToHistory) {
                    window.saveResultToHistory(results);
                }
                
                // RESET THE SCANNING SYSTEM (but keep results visible)
                resetScanSystem();
            } else {
                console.error("Results generation failed!");
                alert("Error generating results. Please try again.");
                resetScanSystem();
            }
        }, 500);
    }
    
    function resetScanSystem() {
        console.log("Resetting scan system...");
        
        // Stop all animations and intervals
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        
        // Stop any playing audio
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        // Reset scan flags
        window.scanInProgress = false;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        // Reset UI elements
        scanStatus.classList.remove('scanning');
        if (connectorPulse) connectorPulse.classList.remove('scanning');
        startScanBtn.disabled = true; // Will be re-enabled when fingerprints are activated
        cancelScanBtn.disabled = true;
        
        // Reset fingerprints
        const leftScanner = document.getElementById('leftScanner');
        const rightScanner = document.getElementById('rightScanner');
        
        if (leftScanner) leftScanner.classList.remove('active', 'locked');
        if (rightScanner) rightScanner.classList.remove('active', 'locked');
        
        // Reset scan lines
        document.querySelectorAll('.scan-line').forEach(line => line.classList.remove('active'));
        
        // Reset fingerprint states
        window.leftActive = false;
        window.rightActive = false;
        
        // Reset progress bar with animation
        setTimeout(() => {
            progressFill.style.transition = 'width 0.5s ease-out';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            
            // Reset status message
            setTimeout(() => {
                updateStatusMessage('Validate names to start new scan', 'info');
                progressFill.style.transition = ''; // Reset transition
            }, 500);
        }, 1000);
        
        // Re-enable inputs
        document.getElementById('femaleName').disabled = false;
        document.getElementById('maleName').disabled = false;
        document.getElementById('validateBtn').disabled = false;
        document.getElementById('clearBtn').disabled = false;
        
        // Reset instructions
        document.getElementById('leftInstruction').textContent = 'Validate names first';
        document.getElementById('rightInstruction').textContent = 'Validate names first';
    }
    
    function cancelScan() {
        console.log("Cancelling scan...");
        
        if (!window.scanInProgress) return;
        
        // Clear intervals
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        
        // Stop scan audio
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        // Reset UI
        scanStatus.classList.remove('scanning');
        if (connectorPulse) connectorPulse.classList.remove('scanning');
        startScanBtn.disabled = true;
        cancelScanBtn.disabled = true;
        document.getElementById('leftScanner').classList.remove('locked');
        document.getElementById('rightScanner').classList.remove('locked');
        
        // Reset progress
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        updateStatusMessage('Scan cancelled. Validate names to restart.', 'error');
        
        // Reset scan flags
        window.scanInProgress = false;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        // Play error sound
        playSound('errorSound');
    }
    
    // Event listeners
    startScanBtn.addEventListener('click', startScan);
    cancelScanBtn.addEventListener('click', cancelScan);
}

// ====================
// UTILITY FUNCTIONS
// ====================
function updateStatusMessage(message, icon = 'info') {
    const statusText = document.getElementById('statusText');
    const statusIcon = document.querySelector('#statusMessage i');
    
    if (!statusText || !statusIcon) {
        console.error("Status elements not found!");
        return;
    }
    
    const iconMap = {
        'info': 'fa-info-circle',
        'scan': 'fa-sync-alt',
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle'
    };
    
    statusText.textContent = message;
    statusIcon.className = `fas ${iconMap[icon] || iconMap['info']}`;
    
    if (icon === 'scan') {
        statusIcon.classList.add('scanning');
    } else {
        statusIcon.classList.remove('scanning');
    }
}

// Initialize speech synthesis voices
if ('speechSynthesis' in window) {
    speechSynthesis.getVoices(); // Trigger voice loading
}

// Debug helper
window.debugLABX = function() {
    console.log("=== LABX DEBUG INFO ===");
    console.log("scanInProgress:", window.scanInProgress);
    console.log("scanProgress:", window.scanProgress);
    console.log("leftActive:", window.leftActive);
    console.log("rightActive:", window.rightActive);
    console.log("generateResults:", typeof window.generateResults);
    console.log("displayResults:", typeof window.displayResults);
    console.log("saveResultToHistory:", typeof window.saveResultToHistory);
    console.log("======================");
};