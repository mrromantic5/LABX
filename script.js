document.addEventListener('DOMContentLoaded', () => {
    console.log("LABX System Initializing...");
    initThemeSystem();
    initPreloader();
    initAudioSystem();
    initMobileMenu();
    initInputValidation();
    initFingerprintScanners();
    initResultsSystem(); 
    initScanSystem();
    loadSavedResults();
    
    document.querySelector('.copyright').textContent = document.querySelector('.copyright').textContent.replace('2024', new Date().getFullYear());
    
    console.log("LABX System Ready!");
});

function initThemeSystem() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themePanel = document.getElementById('themePanel');
    const closeThemePanel = document.getElementById('closeThemePanel');
    const themeOptions = document.querySelectorAll('.theme-option');
    const savedTheme = localStorage.getItem('labxTheme') || 'blue';
    
    applyTheme(savedTheme);
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            themePanel.classList.remove('active');
            
            localStorage.setItem('labxTheme', theme);
            
            playSound('clickSound');
        });
    });
    
    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePanel.classList.toggle('active');
        playSound('clickSound');
    });
    
    closeThemePanel.addEventListener('click', () => {
        themePanel.classList.remove('active');
        playSound('clickSound');
    });
    document.addEventListener('click', (e) => {
        if (!themePanel.contains(e.target) && !themeToggleBtn.contains(e.target)) {
            themePanel.classList.remove('active');
        }
    });
}

function applyTheme(theme) {
    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith('theme-')));
    document.body.classList.add(`theme-${theme}`);
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');
    const logoLetters = document.querySelectorAll('.logo-letter');
    const logoSubtitle = document.querySelector('.logo-subtitle');
    
    logoLetters.forEach(letter => {
        letter.style.opacity = '0';
        letter.style.transform = 'translateY(-150px) scale(0.7)';
    });
    
    logoSubtitle.style.opacity = '0';
    logoSubtitle.style.transform = 'translateX(-150px)';
    
    setTimeout(() => {
        logoLetters.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.animation = `bounceLetter 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
                letter.style.animationDelay = `${index * 0.25}s`;
            }, index * 250);
        });
        
        setTimeout(() => {
            logoSubtitle.style.animation = `slideInSubtitle 1s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
            logoSubtitle.style.animationDelay = '0.3s';
        }, logoLetters.length * 250 + 600);
        
        setTimeout(() => {
            preloader.classList.add('fade-out');
            
            setTimeout(() => {
                mainContent.classList.add('loaded');
                
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1000);
            }, 500);
        }, 3500);
    }, 500);
}

function initAudioSystem() {
    document.querySelectorAll('audio').forEach(audio => {
        audio.volume = 0.3;
        audio.muted = false;
        
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(() => {
            console.log('Audio autoplay may be blocked by browser policy');
        });
    });
}

function playSound(soundId, loop = false) {
    const audio = document.getElementById(soundId);
    if (!audio) return null;
    
    try {
        const audioClone = audio.cloneNode();
        audioClone.loop = loop;
        audioClone.volume = 0.3;
        audioClone.play().catch(e => {
            console.log('Audio play failed:', e.message);
        });
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
       
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
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
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

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
        
        if (femaleValid && maleValid) {
            validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Names Validated';
            validateBtn.disabled = false;
            validateBtn.classList.add('validated');
            
            enableFingerprints();
        } else {
            validateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Validate Names';
            validateBtn.disabled = false;
            validateBtn.classList.remove('validated');
            
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
        
        document.getElementById('startScanBtn').disabled = true;
        
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
        
        document.getElementById('leftName').textContent = 'Female';
        document.getElementById('rightName').textContent = 'Male';
        
        disableFingerprints();
        
        updateStatusMessage('Awaiting name validation...', 'info');
        
        playSound('clickSound');
    });
    
    updateValidationButton();
}

function initFingerprintScanners() {
    const leftScanner = document.getElementById('leftScanner');
    const rightScanner = document.getElementById('rightScanner');
    const leftScanLine = document.getElementById('leftScanLine');
    const rightScanLine = document.getElementById('rightScanLine');
    const startScanBtn = document.getElementById('startScanBtn');
    
    window.leftActive = false;
    window.rightActive = false;
    
    function toggleScanner(scanner, scanLine, isLeft) {
        const validateBtn = document.getElementById('validateBtn');
        if (!validateBtn.classList.contains('validated')) {
            playSound('errorSound');
            return;
        }
        if (document.getElementById('scanStatus').classList.contains('scanning')) {
            return;
        }
        
        if (isLeft ? window.leftActive : window.rightActive) {
            scanner.classList.remove('active');
            scanLine.classList.remove('active');
            if (isLeft) window.leftActive = false;
            else window.rightActive = false;
        } else {
            scanner.classList.add('active');
            scanLine.classList.add('active');
            if (isLeft) window.leftActive = true;
            else window.rightActive = true;
            
            playSound('clickSound');
        }
        
        startScanBtn.disabled = !(window.leftActive && window.rightActive);
        
        if (window.leftActive && window.rightActive) {
            updateStatusMessage('Ready to scan! Click "Begin Analysis"', 'success');
        } else if (window.leftActive || window.rightActive) {
            updateStatusMessage('Activate both fingerprints to begin', 'info');
        } else {
            updateStatusMessage('Tap both fingerprints to begin scan', 'info');
        }
    }
    
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

function initResultsSystem() {
    const copyResultsBtn = document.getElementById('copyResultsBtn');
    const shareResultsBtn = document.getElementById('shareResultsBtn');
    const saveResultsBtn = document.getElementById('saveResultsBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    window.resultMessages = {
        0: [
            "The compatibility analysis reveals fundamental incompatibilities across all critical dimensions. The neural resonance patterns show significant misalignment that may lead to constant relationship friction.",
            "Our algorithms detect minimal emotional synchronization and divergent life trajectories. The trust metrics indicate foundational issues that require substantial intervention to overcome.",
            "The biometric analysis shows conflicting core values and communication styles. Long-term partnership potential is severely limited without professional guidance and mutual transformation."
        ],
        
        21: [
            "The compatibility assessment reveals considerable challenges requiring deliberate effort to bridge fundamental differences in emotional needs and communication approaches.",
            "Neural patterns indicate divergent attachment styles and conflicting conflict resolution mechanisms. With conscious effort, some common ground can be established.",
            "Trust algorithms highlight significant gaps in reliability indicators. While not impossible, this relationship would require extraordinary commitment to overcome inherent incompatibilities."
        ],
        
        41: [
            "The analysis indicates moderate compatibility with specific areas of alignment that could form a foundation for connection with focused development.",
            "Emotional resonance shows pockets of synchronization interspersed with notable gaps. Strategic communication could enhance the existing compatibility foundation.",
            "Our algorithms detect compatible elements in values and life vision, though differences in emotional expression require intentional navigation."
        ],
        
        61: [
            "The compatibility matrix reveals strong foundational alignment with excellent potential for meaningful partnership development.",
            "Neural synchronization patterns indicate harmonious communication rhythms and compatible emotional intelligence levels.",
            "Trust metrics demonstrate reliable partnership potential with shared core values providing a solid foundation for relationship growth."
        ],
        
        76: [
            "The analysis reveals exceptional compatibility with near-perfect alignment in emotional intelligence and communication patterns.",
            "Biometric resonance indicates profound understanding and intuitive connection between partners, suggesting a highly fulfilling partnership.",
            "Our algorithms detect superior trust indicators and emotional synchronization that typically lead to deeply satisfying, long-lasting relationships."
        ],
        
        86: [
            "The compatibility assessment reveals extraordinary, near-perfect alignment across all neural, emotional, and psychological dimensions.",
            "Our advanced algorithms indicate exceptional emotional resonance and intellectual harmony rarely observed in compatibility analysis.",
            "The biometric synchronization demonstrates profound connection and intuitive understanding that suggests a potentially transformative partnership."
        ]
    };
    
    window.validBloodTypes = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];
    
    function getScoreCategory(score) {
        if (score <= 20) return 0;
        if (score <= 40) return 21;
        if (score <= 60) return 41;
        if (score <= 75) return 61;
        if (score <= 85) return 76;
        return 86;
    }
    
    function getRandomMessage(score) {
        const category = getScoreCategory(score);
        const messages = window.resultMessages[category];
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }
    
    function getScoreDescription(score) {
        if (score >= 90) {
            return "Exceptional match with extraordinary compatibility across all dimensions.";
        } else if (score >= 80) {
            return "Excellent match with strong compatibility and significant relationship potential.";
        } else if (score >= 70) {
            return "Very good match with solid foundation for meaningful connection.";
        } else if (score >= 60) {
            return "Good match with potential for growth and development.";
        } else if (score >= 50) {
            return "Moderate match with areas of compatibility requiring attention.";
        } else if (score >= 40) {
            return "Challenging match with significant differences to overcome.";
        } else if (score >= 30) {
            return "Difficult match requiring substantial effort and compromise.";
        } else if (score >= 20) {
            return "Limited compatibility with fundamental differences.";
        } else {
            return "Minimal compatibility with major incompatibilities identified.";
        }
    }
    
    function generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    
    function seededRandom(seed, min, max) {
        const x = Math.sin(seed++) * 10000;
        const random = x - Math.floor(x);
        return Math.floor(random * (max - min + 1)) + min;
    }
    
    window.getPersistentSeededRandom = function(namePair, metricName) {
        const pairKey = `${namePair.toLowerCase()}|${metricName}`;
        const hash = generateHash(pairKey);
        const seed = hash;
        
        const x = Math.sin(seed) * 10000;
        const random = x - Math.floor(x);
        return Math.floor(random * 101); 
    };
    
    window.generateBloodType = function(name) {
        const hash = generateHash(name.toLowerCase().trim());
        const bloodTypeIndex = hash % window.validBloodTypes.length;
        return window.validBloodTypes[bloodTypeIndex];
    };
    
    window.getStoredResults = function(femaleName, maleName) {
        const persistentResults = JSON.parse(localStorage.getItem('labxPersistentResults') || '{}');
        const pairKey = `${femaleName.toLowerCase().trim()}|${maleName.toLowerCase().trim()}`;
        
        if (persistentResults[pairKey]) {
            console.log("Found stored results for:", femaleName, "&", maleName);
            return persistentResults[pairKey];
        }
        
        return null;
    };
    
    window.storeResults = function(femaleName, maleName, results) {
        const persistentResults = JSON.parse(localStorage.getItem('labxPersistentResults') || '{}');
        const pairKey = `${femaleName.toLowerCase().trim()}|${maleName.toLowerCase().trim()}`;
        
        persistentResults[pairKey] = {
            femaleName: results.femaleName,
            maleName: results.maleName,
            femaleBloodType: results.femaleBloodType,
            maleBloodType: results.maleBloodType,
            overallScore: results.overallScore,
            loveCompatibility: results.loveCompatibility,
            trustLevel: results.trustLevel,
            emotionalSync: results.emotionalSync,
            longTermPotential: results.longTermPotential,
            passionIndex: results.passionIndex,
            seed: generateHash(`${femaleName}|${maleName}`)
        };
        
        localStorage.setItem('labxPersistentResults', JSON.stringify(persistentResults));
        console.log("Stored persistent results for:", femaleName, "&", maleName);
    };
    
    window.generateResults = function(femaleName, maleName) {
        console.log("Generating results for:", femaleName, maleName);
        
        const storedResults = window.getStoredResults(femaleName, maleName);
        
        if (storedResults) {
            console.log("Using stored results for consistent output");
            const pairString = `${femaleName.toLowerCase().trim()}|${maleName.toLowerCase().trim()}`;
            const hash = generateHash(pairString);
            let seed = hash;
            
            const results = {
                femaleName: storedResults.femaleName,
                maleName: storedResults.maleName,
                femaleBloodType: storedResults.femaleBloodType,
                maleBloodType: storedResults.maleBloodType,
                timestamp: new Date().toISOString(),
                
                loveCompatibility: storedResults.loveCompatibility,
                trustLevel: storedResults.trustLevel,
                emotionalSync: storedResults.emotionalSync,
                longTermPotential: storedResults.longTermPotential,
                passionIndex: storedResults.passionIndex,
                
                get overallScore() {
                    return storedResults.overallScore;
                }
            };
            
            results.insights = generateInsights(results);
            return results;
        }
        
        const pairString = `${femaleName.toLowerCase().trim()}|${maleName.toLowerCase().trim()}`;
        const hash = generateHash(pairString);
        
        let seed = hash;
        
        const overallScore = window.getPersistentSeededRandom(pairString, 'overall');
        
        const femaleBloodType = window.generateBloodType(femaleName);
        const maleBloodType = window.generateBloodType(maleName);
        
        const results = {
            femaleName: femaleName,
            maleName: maleName,
            femaleBloodType: femaleBloodType,
            maleBloodType: maleBloodType,
            timestamp: new Date().toISOString(),
            
            loveCompatibility: window.getPersistentSeededRandom(pairString, 'love'),
            trustLevel: window.getPersistentSeededRandom(pairString, 'trust'),
            emotionalSync: window.getPersistentSeededRandom(pairString, 'emotion'),
            longTermPotential: window.getPersistentSeededRandom(pairString, 'longterm'),
            passionIndex: window.getPersistentSeededRandom(pairString, 'passion'),
            
            get overallScore() {
                return overallScore;
            }
        };
        
        results.loveCompatibility = Math.max(0, Math.min(100, results.loveCompatibility));
        results.trustLevel = Math.max(0, Math.min(100, results.trustLevel));
        results.emotionalSync = Math.max(0, Math.min(100, results.emotionalSync));
        results.longTermPotential = Math.max(0, Math.min(100, results.longTermPotential));
        results.passionIndex = Math.max(0, Math.min(100, results.passionIndex));
        
        results.insights = generateInsights(results);
        
        window.storeResults(femaleName, maleName, results);
        
        return results;
    };
    
    function generateInsights(results) {
        const insights = [];
        const overall = results.overallScore;
        
        insights.push(getScoreDescription(overall));
        
        insights.push(getRandomMessage(overall));
        
        if (overall >= 90) {
            insights.push("The neural compatibility patterns suggest a partnership of exceptional depth, with emotional intelligence metrics indicating superior conflict resolution capabilities and mutual growth potential.");
        } else if (overall >= 80) {
            insights.push("Communication synchronization analysis reveals excellent listening patterns and mutual understanding. The trust algorithms indicate strong reliability and commitment indicators.");
        } else if (overall >= 70) {
            insights.push("The emotional resonance scan shows good alignment in core values with compatible life vision trajectories. Shared interests provide strong bonding potential.");
        } else if (overall >= 60) {
            insights.push("Compatibility markers indicate areas of strong connection balanced by differences that could complement each other with conscious effort and communication.");
        } else if (overall >= 50) {
            insights.push("While certain compatibility markers are present, the analysis suggests significant differences in emotional needs and communication styles requiring intentional navigation.");
        } else if (overall >= 40) {
            insights.push("The assessment reveals conflicting relationship patterns and divergent expectations that would require substantial compromise and professional guidance to bridge.");
        } else if (overall >= 30) {
            insights.push("Neural analysis indicates fundamental incompatibilities in attachment styles and conflict resolution approaches that pose significant challenges to relationship development.");
        } else {
            insights.push("The biometric assessment reveals minimal compatibility markers with conflicting core values and life objectives that suggest limited relationship potential.");
        }
        
        return insights;
    }
    
    function createBloodTypeDisplay(femaleName, femaleBloodType, maleName, maleBloodType) {
        const bloodTypeContainer = document.createElement('div');
        bloodTypeContainer.className = 'blood-type-display';
        bloodTypeContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin: 1.5rem 0;
            padding: 1.25rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(5px);
            animation: fadeIn 0.6s ease;
        `;
        
        const femaleDisplay = document.createElement('div');
        femaleDisplay.className = 'partner-blood-type';
        femaleDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-venus" style="color: var(--color-primary); font-size: 1.2rem;"></i>
                <div>
                    <div style="font-weight: 500; color: var(--color-text-primary);">${femaleName}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                        <span style="color: var(--color-text-secondary); font-size: 0.95rem;">Blood Type:</span>
                        <span style="color: var(--color-primary); font-weight: 600; font-size: 1.1rem; text-shadow: 0 0 8px var(--color-primary);">${femaleBloodType}</span>
                    </div>
                </div>
            </div>
        `;
        
        const maleDisplay = document.createElement('div');
        maleDisplay.className = 'partner-blood-type';
        maleDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-mars" style="color: var(--color-secondary); font-size: 1.2rem;"></i>
                <div>
                    <div style="font-weight: 500; color: var(--color-text-primary);">${maleName}</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                        <span style="color: var(--color-text-secondary); font-size: 0.95rem;">Blood Type:</span>
                        <span style="color: var(--color-secondary); font-weight: 600; font-size: 1.1rem; text-shadow: 0 0 8px var(--color-secondary);">${maleBloodType}</span>
                    </div>
                </div>
            </div>
        `;
        
        bloodTypeContainer.appendChild(femaleDisplay);
        bloodTypeContainer.appendChild(maleDisplay);
        
        return bloodTypeContainer;
    }
    
    window.displayResults = function(results) {
        console.log("Displaying results:", results);
        
        const resultsCard = document.getElementById('resultsCard');
        const noResults = document.getElementById('noResults');
        const metricsGrid = document.getElementById('metricsGrid');
        const insightsContent = document.getElementById('insightsContent');
        const resultsContent = document.querySelector('.results-content');
        
        noResults.style.display = 'none';
        resultsCard.style.display = 'block';
        
        document.getElementById('resultsPairNames').textContent = `${results.femaleName} & ${results.maleName}`;
        document.getElementById('overallScore').textContent = `${results.overallScore}%`;
        
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
        
        document.getElementById('scoreDescription').textContent = results.insights[0];
        
        const existingBloodTypeDisplay = document.querySelector('.blood-type-display');
        if (existingBloodTypeDisplay) {
            existingBloodTypeDisplay.remove();
        }
        
        const bloodTypeDisplay = createBloodTypeDisplay(
            results.femaleName,
            results.femaleBloodType,
            results.maleName,
            results.maleBloodType
        );
        
        const overallScoreElement = document.querySelector('.overall-score');
        if (overallScoreElement && overallScoreElement.parentNode) {
            overallScoreElement.parentNode.insertBefore(bloodTypeDisplay, overallScoreElement.nextSibling);
        }
        
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
        
        insightsContent.innerHTML = '';
        results.insights.slice(1).forEach(insight => {
            const p = document.createElement('p');
            p.textContent = insight;
            insightsContent.appendChild(p);
        });
        
        setTimeout(() => {
            document.querySelectorAll('.metric-fill').forEach((fill, index) => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, index * 200);
            });
        }, 500);
        
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 800);
    };
    
    window.saveResultToHistory = function(results) {
        let history = JSON.parse(localStorage.getItem('labxScanHistory') || '[]');
        
        const existingIndex = history.findIndex(item => 
            item.femaleName.toLowerCase() === results.femaleName.toLowerCase() &&
            item.maleName.toLowerCase() === results.maleName.toLowerCase()
        );
        
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }
        
        history.unshift({
            femaleName: results.femaleName,
            maleName: results.maleName,
            femaleBloodType: results.femaleBloodType,
            maleBloodType: results.maleBloodType,
            overallScore: results.overallScore,
            timestamp: results.timestamp,
            results: results
        });
        
        if (history.length > 15) {
            history = history.slice(0, 15);
        }
        
        localStorage.setItem('labxScanHistory', JSON.stringify(history));
        
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
            
            const bloodTypeInfo = item.femaleBloodType && item.maleBloodType 
                ? `<div style="font-size: 0.85rem; color: var(--color-text-tertiary); margin-top: 2px;">
                       <span style="color: var(--color-primary);">${item.femaleBloodType}</span> • 
                       <span style="color: var(--color-secondary);">${item.maleBloodType}</span>
                   </div>`
                : '';
            
            savedItem.innerHTML = `
                <div>
                    <div class="saved-pair">${item.femaleName} & ${item.maleName}</div>
                    ${bloodTypeInfo}
                    <div class="saved-date">${formattedDate}</div>
                </div>
                <div class="saved-score">${item.overallScore}%</div>
            `;
            
            savedItem.addEventListener('click', () => {
                if (item.results) {
                    displayResults(item.results);
                } else {
                    const regeneratedResults = window.generateResults(item.femaleName, item.maleName);
                    displayResults(regeneratedResults);
                }
                playSound('clickSound');
                
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
    
    copyResultsBtn.addEventListener('click', () => {
        const pairNames = document.getElementById('resultsPairNames').textContent;
        const overallScore = document.getElementById('overallScore').textContent;
        const date = document.getElementById('resultsDate').textContent;
        
        const bloodTypeElements = document.querySelectorAll('.partner-blood-type');
        let bloodTypeText = '';
        if (bloodTypeElements.length === 2) {
            const femaleInfo = bloodTypeElements[0].textContent;
            const maleInfo = bloodTypeElements[1].textContent;
            bloodTypeText = `\n${femaleInfo}\n${maleInfo}`;
        }
        
        const textToCopy = `LABX Compatibility Results\n${pairNames}\nOverall Match: ${overallScore}${bloodTypeText}\nDate: ${date}\n\nView full results at: ${window.location.href}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
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
            const textToCopy = `Check out our LABX compatibility results: ${pairNames} are a ${overallScore} match!\n${window.location.href}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('Results link copied to clipboard! You can paste it to share.');
            });
        }
        
        playSound('clickSound');
    });
    
    saveResultsBtn.addEventListener('click', () => {
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
            localStorage.removeItem('labxPersistentResults');
            loadSavedResults();
            playSound('clickSound');
        }
    });
    
    loadSavedResults();
}

function initScanSystem() {
    const startScanBtn = document.getElementById('startScanBtn');
    const cancelScanBtn = document.getElementById('cancelScanBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const scanStatus = document.getElementById('scanStatus');
    const connectorPulse = document.querySelector('.connector-pulse');
    
    window.scanInProgress = false;
    window.scanProgress = 0;
    const scanDuration = 20000;
    window.scanInterval = null;
    window.currentMessageIndex = 0;
    window.scanAudio = null;
    
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
        
        window.scanInProgress = true;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        scanStatus.classList.add('scanning');
        if (connectorPulse) connectorPulse.classList.add('scanning');
        startScanBtn.disabled = true;
        cancelScanBtn.disabled = false;
        document.getElementById('leftScanner').classList.add('locked');
        document.getElementById('rightScanner').classList.add('locked');
        
        window.scanAudio = playSound('scanSound', true);
        
        updateStatusMessage(scanMessages[0], 'scan');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        const startTime = Date.now();
        const updateInterval = 100; 
        
        window.scanInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            window.scanProgress = Math.min((elapsed / scanDuration) * 100, 100);
            
            console.log("Scan progress:", window.scanProgress.toFixed(1), "%");
            
            progressFill.style.width = `${window.scanProgress}%`;
            progressText.textContent = `${Math.floor(window.scanProgress)}%`;
            
            const messageIndex = Math.floor((window.scanProgress / 100) * (scanMessages.length - 1));
            if (messageIndex !== window.currentMessageIndex) {
                window.currentMessageIndex = messageIndex;
                updateStatusMessage(scanMessages[messageIndex], 'scan');
            }
            
            if (window.scanProgress >= 100) {
                console.log("Scan complete!");
                completeScan(femaleName, maleName);
            }
        }, updateInterval);
    }
    
    function completeScan(femaleName, maleName) {
        console.log("Completing scan...");
        
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
        updateStatusMessage('Scan complete! Generating results...', 'success');
        
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        playSound('completeSound');
        speakText('Scanning complete. Thanks for using LAB X.');
        setTimeout(() => {
            console.log("Generating results...");
            const results = window.generateResults(femaleName, maleName);
            
            if (results && window.displayResults) {
                window.displayResults(results);
                if (window.saveResultToHistory) {
                    window.saveResultToHistory(results);
                }
                
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
        
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        window.scanInProgress = false;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        scanStatus.classList.remove('scanning');
        if (connectorPulse) connectorPulse.classList.remove('scanning');
        startScanBtn.disabled = true;
        cancelScanBtn.disabled = true;
        
        const leftScanner = document.getElementById('leftScanner');
        const rightScanner = document.getElementById('rightScanner');
        
        if (leftScanner) leftScanner.classList.remove('active', 'locked');
        if (rightScanner) rightScanner.classList.remove('active', 'locked');
        
        document.querySelectorAll('.scan-line').forEach(line => line.classList.remove('active'));
        
        window.leftActive = false;
        window.rightActive = false;
        
        setTimeout(() => {
            progressFill.style.transition = 'width 0.5s ease-out';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            
            setTimeout(() => {
                updateStatusMessage('Validate names to start new scan', 'info');
                progressFill.style.transition = ''; // Reset transition
            }, 500);
        }, 1000);
        
        document.getElementById('femaleName').disabled = false;
        document.getElementById('maleName').disabled = false;
        document.getElementById('validateBtn').disabled = false;
        document.getElementById('clearBtn').disabled = false;
        
        document.getElementById('leftInstruction').textContent = 'Validate names first';
        document.getElementById('rightInstruction').textContent = 'Validate names first';
    }
    
    function cancelScan() {
        console.log("Cancelling scan...");
        
        if (!window.scanInProgress) return;
        
        if (window.scanInterval) {
            clearInterval(window.scanInterval);
            window.scanInterval = null;
        }
        if (window.scanAudio) {
            window.scanAudio.pause();
            window.scanAudio.currentTime = 0;
            window.scanAudio = null;
        }
        
        scanStatus.classList.remove('scanning');
        if (connectorPulse) connectorPulse.classList.remove('scanning');
        startScanBtn.disabled = true;
        cancelScanBtn.disabled = true;
        document.getElementById('leftScanner').classList.remove('locked');
        document.getElementById('rightScanner').classList.remove('locked');
        
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        updateStatusMessage('Scan cancelled. Validate names to restart.', 'error');
        
        window.scanInProgress = false;
        window.scanProgress = 0;
        window.currentMessageIndex = 0;
        
        playSound('errorSound');
    }
    
    startScanBtn.addEventListener('click', startScan);
    cancelScanBtn.addEventListener('click', cancelScan);
}

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

if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();   
}

window.debugLABX = function() {
    console.log("=== LABX DEBUG INFO ===");
    console.log("scanInProgress:", window.scanInProgress);
    console.log("scanProgress:", window.scanProgress);
    console.log("leftActive:", window.leftActive);
    console.log("rightActive:", window.rightActive);
    console.log("generateResults:", typeof window.generateResults);
    console.log("displayResults:", typeof window.displayResults);
    console.log("saveResultToHistory:", typeof window.saveResultToHistory);
    console.log("getStoredResults:", typeof window.getStoredResults);
    console.log("storeResults:", typeof window.storeResults);
    console.log("generateBloodType:", typeof window.generateBloodType);
    console.log("Valid blood types:", window.validBloodTypes);
    console.log("Persistent results stored:", localStorage.getItem('labxPersistentResults') ? "Yes" : "No");
    console.log("Result messages:", window.resultMessages ? "Available" : "Not available");
    console.log("======================");
};