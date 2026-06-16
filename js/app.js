        let playList = [];
        let currentMenuIndex = 0;
        let currentStepIndex = 0;
        let score = 0;
        let totalSteps = 0;
        let totalStepsCompleted = 0;
        let gameMode = 'choice'; 
        
        let timerInterval;
        let streak = 0;
        let timeElapsedSeconds = 0;

        // New feature variables
        let isTimeAttack = false;
        let stepTimer;
        let stepTimeLeft = 10;
        let weaknessData = JSON.parse(localStorage.getItem('baristaWeakness')) || {};
        let isCurrentCupFlawed = false;
        let perfectCupsServed = 0;

        function getIngredientVisuals(text) {
            if (text.includes('พักชา') || text.includes('วินาที')) return { color: 'rgba(200, 200, 200, 0.4)', icon: '⏱️' };
            if (text.includes('กาแฟ') || text.includes('คั่ว')) return { color: 'rgba(92, 58, 33, 0.9)', icon: '☕' };
            if (text.includes('ชาเขียว') || text.includes('มัทฉะ') || text.includes('ผงตรามือ')) return { color: 'rgba(77, 138, 74, 0.9)', icon: '🍵' };
            if (text.includes('ชาไทย') || text.includes('ผงชาตรามือ') || text.includes('ผงชา') || text.includes('ชากุหลาบ') || text.includes('ชา')) return { color: 'rgba(217, 119, 54, 0.9)', icon: '🧋' };
            if (text.includes('นมชมพู') || text.includes('น้ำแดง') || text.includes('ลิ้นจี่')) return { color: 'rgba(255, 143, 179, 0.9)', icon: '🍓' };
            if (text.includes('โกโก้')) return { color: 'rgba(74, 44, 17, 0.9)', icon: '🍫' };
            if (text.includes('ชาพีช') || text.includes('พีช') || text.includes('น้ำส้ม')) return { color: 'rgba(252, 165, 93, 0.9)', icon: '🍑' };
            if (text.includes('มะนาว') || text.includes('เลม่อน')) return { color: 'rgba(185, 247, 62, 0.8)', icon: '🍋' };
            if (text.includes('น้ำผึ้ง')) return { color: 'rgba(250, 214, 77, 0.9)', icon: '🍯' };
            if (text.includes('นม') || text.includes('วิป') || text.includes('ครีมเทียม')) return { color: 'rgba(255, 255, 255, 0.9)', icon: '🥛' };
            if (text.includes('น้ำ') || text.includes('โซดา')) return { color: 'rgba(173, 216, 230, 0.6)', icon: '💧' };
            if (text.includes('ไซรัป') || text.includes('คาราเมล')) return { color: 'rgba(230, 180, 230, 0.8)', icon: '🍯' };
            return { color: 'rgba(200, 200, 200, 0.6)', icon: '✨' };
        }

        function showCustomConfirm(message, onConfirm) {
            const modal = document.getElementById('custom-confirm-modal');
            const msgObj = document.getElementById('custom-confirm-message');
            const btnOk = document.getElementById('custom-confirm-ok');
            const btnCancel = document.getElementById('custom-confirm-cancel');
            
            msgObj.textContent = message;
            modal.classList.remove('hidden');
            
            btnOk.onclick = () => {
                modal.classList.add('hidden');
                if (onConfirm) onConfirm();
            };
            
            btnCancel.onclick = () => {
                modal.classList.add('hidden');
            };
        }

        function goToHome() {
            if (!document.getElementById('game-screen').classList.contains('hidden')) {
                showCustomConfirm("คุณต้องการยกเลิกการฝึกและกลับหน้าแรกหรือไม่?", () => {
                    clearInterval(timerInterval);
                    initGame();
                });
            } else {
                clearInterval(timerInterval);
                initGame();
            }
        }

        function initGame() {
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('flex');
            document.getElementById('result-screen').classList.add('hidden');
            document.getElementById('progress-container').classList.add('hidden');
            document.getElementById('game-stats').classList.add('hidden');
            
            // Check best stats on re-init
            checkBestStats();
        }

        function startGame(mode) {
            gameMode = mode;
            
            // Read Category
            const cat = document.getElementById('category-select') ? document.getElementById('category-select').value : 'all';
            let filteredDb = menuDatabase;
            if (cat === 'coffee') filteredDb = menuDatabase.filter(m => m.name.includes('อเมริกาโน่') || m.name.includes('ลาเต้') || m.name.includes('มัคคิอาโต') || m.name.includes('กาแฟ'));
            else if (cat === 'tea') filteredDb = menuDatabase.filter(m => (m.name.includes('ชา') || m.name.includes('มัทฉะ')) && !m.name.includes('กาแฟ'));
            else if (cat === 'milk') filteredDb = menuDatabase.filter(m => m.name.includes('นม') || m.name.includes('โกโก้'));
            else if (cat === 'coldfoam') filteredDb = menuDatabase.filter(m => m.name.includes('โคลด์โฟม'));
            
            // Play 5 random menus from category
            if (filteredDb.length < 5) playList = [...filteredDb].sort(() => 0.5 - Math.random());
            else playList = [...filteredDb].sort(() => 0.5 - Math.random()).slice(0, 5); 
            
            // Time Attack
            const taToggle = document.getElementById('time-attack-toggle');
            isTimeAttack = taToggle ? taToggle.checked : false;

            currentMenuIndex = 0;
            currentStepIndex = 0;
            score = 0;
            totalStepsCompleted = 0;
            perfectCupsServed = 0;
            streak = 0;
            timeElapsedSeconds = 0;
            totalSteps = playList.reduce((acc, menu) => acc + menu.steps.length, 0);
            
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            document.getElementById('game-screen').classList.add('flex');
            document.getElementById('progress-container').classList.remove('hidden');
            document.getElementById('game-stats').classList.remove('hidden');
            document.getElementById('progress-bar').style.width = '0%';
            
            document.getElementById('total-score').textContent = totalSteps;
            document.getElementById('current-score').textContent = score;
            updateStreak();
            
            startTimer();
            renderMenu();
        }

        function renderMenu() {
            if (currentMenuIndex >= playList.length) {
                endGame();
                return;
            }
            
            isCurrentCupFlawed = false;
            const menu = playList[currentMenuIndex];
            document.getElementById('menu-counter').textContent = currentMenuIndex + 1;
            document.getElementById('current-menu-name').textContent = menu.name;
            
            if (currentStepIndex === 0) {
                document.getElementById('glass-container').innerHTML = `
                    <div id="empty-glass-text" class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-medium tracking-wide z-10">รอรับออเดอร์...</div>
                `;
                const ingredientLog = document.getElementById('ingredient-log');
                if (ingredientLog) ingredientLog.innerHTML = '';
            }
            
            renderStep();
        }

        function renderStep() {
            const menu = playList[currentMenuIndex];
            const step = menu.steps[currentStepIndex];
            
            document.getElementById('step-instruction').textContent = `ขั้นตอนที่ ${currentStepIndex + 1}: ${step.instruction}`;
            
            const optionsContainer = document.getElementById('options-container');
            const typingContainer = document.getElementById('typing-container');
            const emptyText = document.getElementById('empty-glass-text');
            if (emptyText) emptyText.style.display = 'none';
            
            if (gameMode === 'choice') {
                optionsContainer.classList.remove('hidden');
                typingContainer.classList.add('hidden');
                
                optionsContainer.innerHTML = '';
                let options = [step.correct, ...step.wrong];
                
                // Smart Distractors: เลือกเฉพาะชอยส์ที่ instruction คล้ายกัน หรือ instruction เหมือนกัน
                let allOptions = [];
                menuDatabase.forEach(m => m.steps.forEach(s => {
                    if (s.instruction === step.instruction || 
                       (s.instruction.includes('หวาน') && step.instruction.includes('หวาน')) || 
                       (s.instruction.includes('นม') && step.instruction.includes('นม')) ||
                       (s.instruction.includes('สกัด') && step.instruction.includes('สกัด'))) {
                        allOptions.push(s.correct);
                        allOptions.push(...s.wrong);
                    }
                }));
                // เอาตัวเลือกที่ซ้ำและตัวที่มีอยู่แล้วออก
                allOptions = [...new Set(allOptions)].filter(opt => !options.includes(opt));
                
                // Fallback ถ้าน้อยเกินไป
                if (allOptions.length < 3) {
                    menuDatabase.forEach(m => m.steps.forEach(s => {
                        allOptions.push(s.correct);
                        allOptions.push(...s.wrong);
                    }));
                    allOptions = [...new Set(allOptions)].filter(opt => !options.includes(opt));
                }
                
                // สุ่มลำดับตัวเลือกหลอกทั้งหมด
                allOptions.sort(() => 0.5 - Math.random());
                
                // ดึงมาเติมให้ได้ 4 ตัวเลือก (หรือ 5 เพื่อความท้าทาย แต่ปกติ 4 กำลังดี)
                while (options.length < 4 && allOptions.length > 0) {
                    options.push(allOptions.pop());
                }

                const shuffledOptions = options.sort(() => 0.5 - Math.random());
                
                shuffledOptions.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'w-full text-left bg-white border border-gray-200 hover:border-brand-400 hover:bg-brand-50 p-4 rounded-xl transition-all shadow-sm font-medium text-sm flex items-center group';
                    btn.innerHTML = `<span class="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center group-hover:border-brand-500 group-hover:bg-brand-100 transition-colors"></span> ${opt}`;
                    btn.onclick = () => checkAnswer(opt);
                    optionsContainer.appendChild(btn);
                });
            } else {
                optionsContainer.classList.add('hidden');
                typingContainer.classList.remove('hidden');
                
                const input = document.getElementById('typing-input');
                input.value = '';
                input.focus();
                setTimeout(() => input.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                
                document.getElementById('typing-feedback').classList.add('hidden');
                document.getElementById('show-hint-btn').classList.remove('hidden');
                
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') submitTyping();
                };
            }

            if (isTimeAttack) {
                clearInterval(stepTimer);
                stepTimeLeft = 10;
                document.getElementById('step-instruction').innerHTML = `ขั้นตอนที่ ${currentStepIndex + 1}: ${step.instruction} <span class="text-red-500 font-bold ml-2">⏳ ${stepTimeLeft}s</span>`;
                stepTimer = setInterval(() => {
                    stepTimeLeft--;
                    document.getElementById('step-instruction').innerHTML = `ขั้นตอนที่ ${currentStepIndex + 1}: ${step.instruction} <span class="text-red-500 font-bold ml-2">⏳ ${stepTimeLeft}s</span>`;
                    if (stepTimeLeft <= 0) {
                        clearInterval(stepTimer);
                        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                        checkAnswer(null); // Time out = wrong
                    }
                }, 1000);
            }
        }

        function checkAnswer(selectedOption) {
            if (isTimeAttack) clearInterval(stepTimer);
            const menu = playList[currentMenuIndex];
            const step = menu.steps[currentStepIndex];
            
            if (selectedOption === step.correct) {
                if (window.AudioSystem) window.AudioSystem.playCorrect();
                score++;
                streak++;
                document.getElementById('current-score').textContent = score;
                updateStreak();
                
                addLiquidToGlass(step.correct);
                nextStep();
            } else {
                isCurrentCupFlawed = true;
                if (window.AudioSystem) window.AudioSystem.playWrong();
                if ('vibrate' in navigator) navigator.vibrate([200]); // Haptic feedback
                
                // Record weakness
                const key = `${menu.name} -> ${step.instruction}`;
                weaknessData[key] = (weaknessData[key] || 0) + 1;
                localStorage.setItem('baristaWeakness', JSON.stringify(weaknessData));
                
                streak = 0;
                updateStreak();
                
                document.body.classList.add('animate-shake');
                setTimeout(() => document.body.classList.remove('animate-shake'), 400);
                
                if (gameMode === 'choice') {
                    showCustomAlert(step.correct, () => {
                        addLiquidToGlass(step.correct);
                        nextStep();
                    });
                } else {
                    const feedback = document.getElementById('typing-feedback');
                    feedback.textContent = 'ยังไม่ถูกต้อง ลองอีกครั้ง!';
                    feedback.className = 'text-sm text-center text-red-500 font-bold block';
                }
            }
        }

        function submitTyping() {
            const input = document.getElementById('typing-input').value.trim();
            if (!input) return;
            const menu = playList[currentMenuIndex];
            const step = menu.steps[currentStepIndex];
            
            let nInput = input.toLowerCase().replace(/1\s*[½]|1\s*1\/2/g, '1.5').replace(/[½]|1\/2/g, '0.5');
            let nCorrect = step.correct.toLowerCase().replace(/1\s*[½]|1\s*1\/2/g, '1.5').replace(/[½]|1\/2/g, '0.5');
            
            let exactMatch = nInput.replace(/\s+/g, '') === nCorrect.replace(/\s+/g, '');
            let isSmartMatch = true;
            
            let inputNums = nInput.match(/\d+(\.\d+)?/g) || [];
            let correctNums = nCorrect.match(/\d+(\.\d+)?/g) || [];
            
            if (inputNums.length > 0) {
                let numsOk = inputNums.every(num => correctNums.includes(num));
                if (!numsOk) isSmartMatch = false;
            } else {
                if (correctNums.length > 0) isSmartMatch = false;
            }
            
            if (isSmartMatch) {
                const stripRegex = /\d+(\.\d+)?|ml\.?|oz\.?|g\.?|ช้อน(เล็ก)?|วินาที|%/g;
                let textInput = nInput.replace(stripRegex, ' ').trim();
                let textCorrect = nCorrect.replace(stripRegex, '').replace(/\s+/g, '');
                
                if (textInput.length > 0) {
                    let words = textInput.split(/\s+/).filter(w => w.length > 0);
                    for (let word of words) {
                        let i = 0, j = 0;
                        while (i < word.length && j < textCorrect.length) {
                            if (word[i] === textCorrect[j]) i++;
                            j++;
                        }
                        if (i !== word.length) {
                            isSmartMatch = false;
                            break;
                        }
                    }
                }
            }
            
            if (exactMatch || isSmartMatch) {
                 checkAnswer(step.correct);
            } else {
                 checkAnswer(input);
            }
        }

        function showCustomAlert(correctAnswer, callback) {
            const modal = document.getElementById('custom-alert-modal');
            const msgObj = document.getElementById('custom-alert-message');
            const btn = document.getElementById('custom-alert-btn');
            
            msgObj.innerHTML = `ที่ถูกต้องคือ:<br><span class="font-bold text-lg text-brand-900 mt-1 block">${correctAnswer}</span>`;
            modal.classList.remove('hidden');
            
            btn.onclick = () => {
                modal.classList.add('hidden');
                if (callback) callback();
            };
        }

        function showTypingHint() {
            const menu = playList[currentMenuIndex];
            const step = menu.steps[currentStepIndex];
            document.getElementById('typing-input').value = step.correct;
            streak = 0;
            updateStreak();
        }

        function updateStreak() {
            const badge = document.getElementById('streak-badge');
            const count = document.getElementById('streak-count');
            if (streak >= 2) {
                badge.classList.remove('hidden');
                count.textContent = streak;
            } else {
                badge.classList.add('hidden');
            }
        }

        function addLiquidToGlass(ingredientText) {
            if (window.AudioSystem) window.AudioSystem.playLiquid();
            const visual = getIngredientVisuals(ingredientText);
            const glass = document.getElementById('glass-container');
            
            const layer = document.createElement('div');
            const menu = playList[currentMenuIndex];
            const stepRatio = 100 / menu.steps.length;
            
            layer.className = 'w-full animate-liquidFill relative flex items-center justify-center';
            layer.style.height = `${stepRatio}%`;
            layer.style.backgroundColor = visual.color;
            layer.style.borderTop = '1px solid rgba(255,255,255,0.2)';
            layer.style.zIndex = menu.steps.length - currentStepIndex;
            
            if (ingredientText.includes('น้ำแข็ง')) {
                layer.style.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.8) 20%, transparent 20%)';
                layer.style.backgroundSize = '20px 20px';
            }
            if (ingredientText.includes('วิป') || ingredientText.includes('โฟม')) {
                layer.style.zIndex = 50; 
                layer.style.borderTopLeftRadius = '10px';
                layer.style.borderTopRightRadius = '10px';
            }
            
            const icon = document.createElement('div');
            icon.className = 'absolute text-xl opacity-50';
            icon.textContent = visual.icon;
            layer.appendChild(icon);
            
            glass.appendChild(layer);
            
            const ingredientLog = document.getElementById('ingredient-log');
            if (ingredientLog) {
                const li = document.createElement('li');
                li.className = 'bg-white px-2 py-1.5 rounded-md border-l-2 border-brand-400 truncate shadow-sm leading-tight flex items-center';
                li.innerHTML = `<span class="mr-1.5 text-sm">${visual.icon}</span> <span title="${ingredientText}">${ingredientText}</span>`;
                // append so latest is at the top visually in flex-col-reverse
                ingredientLog.appendChild(li);
            }
        }

        function nextStep() {
            totalStepsCompleted++;
            const progress = (totalStepsCompleted / totalSteps) * 100;
            document.getElementById('progress-bar').style.width = `${progress}%`;
            
            currentStepIndex++;
            const menu = playList[currentMenuIndex];
            
            if (currentStepIndex >= menu.steps.length) {
                // Menu Finished! Serve or Discard Animation.
                const glassWrapper = document.getElementById('glass-container').parentElement;
                
                if (!isCurrentCupFlawed) {
                    if (window.AudioSystem) window.AudioSystem.playServe();
                    document.getElementById('step-instruction').innerHTML = `<span class="text-green-600 font-bold text-lg"><i class="fa-solid fa-bell-concierge"></i> ออเดอร์เสร็จสิ้น! เสิร์ฟได้</span>`;
                    perfectCupsServed++;
                    glassWrapper.classList.add('animate-slideOutRight');
                } else {
                    if (window.AudioSystem) window.AudioSystem.playDiscard();
                    document.getElementById('step-instruction').innerHTML = `<span class="text-red-600 font-bold text-lg"><i class="fa-solid fa-trash"></i> แก้วนี้ชงผิดสูตร! ต้องเททิ้ง</span>`;
                    glassWrapper.classList.add('animate-slideDownDiscard');
                }
                
                // Hide options
                document.getElementById('options-container').classList.add('hidden');
                document.getElementById('typing-container').classList.add('hidden');
                
                setTimeout(() => {
                    currentMenuIndex++;
                    currentStepIndex = 0;
                    
                    if (!isCurrentCupFlawed) {
                        glassWrapper.classList.remove('animate-slideOutRight');
                    } else {
                        glassWrapper.classList.remove('animate-slideDownDiscard');
                    }
                    glassWrapper.classList.add('animate-slideInLeft');
                    
                    setTimeout(() => {
                         glassWrapper.classList.remove('animate-slideInLeft');
                    }, 600);

                    if (currentMenuIndex < playList.length) {
                        renderMenu();
                    } else {
                        endGame();
                    }
                }, 1000);
            } else {
                renderStep();
            }
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeElapsedSeconds++;
                const mins = Math.floor(timeElapsedSeconds / 60).toString().padStart(2, '0');
                const secs = (timeElapsedSeconds % 60).toString().padStart(2, '0');
                document.getElementById('timer-display').textContent = `${mins}:${secs}`;
            }, 1000);
        }

        function endGame() {
            if (window.AudioSystem) window.AudioSystem.playFinish();
            clearInterval(timerInterval);
            
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('flex');
            document.getElementById('result-screen').classList.remove('hidden');
            document.getElementById('progress-container').classList.add('hidden');
            document.getElementById('game-stats').classList.add('hidden');
            
            document.getElementById('final-score').textContent = score;
            document.getElementById('final-total').textContent = totalSteps;
            
            document.getElementById('final-perfect-cups').textContent = perfectCupsServed;
            document.getElementById('final-total-cups').textContent = playList.length;
            
            const mins = Math.floor(timeElapsedSeconds / 60).toString().padStart(2, '0');
            const secs = (timeElapsedSeconds % 60).toString().padStart(2, '0');
            document.getElementById('final-time').textContent = `${mins}:${secs}`;
            
            let message = "";
            const percentage = score / totalSteps;
            if (percentage === 1) {
                message = "เพอร์เฟค! คุณคือบาริสต้ามือทอง 🌟";
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#8c5a46', '#d4a373', '#f2e8e5', '#b87c67']
                    });
                }
            } else if (percentage >= 0.8) message = "ยอดเยี่ยม! ชงเก่งมากเลย 👍";
            else if (percentage >= 0.5) message = "เกือบดีแล้ว! ฝึกอีกนิดนะ 💪";
            else message = "สู้ๆ นะ! ต้องจำสูตรให้แม่นกว่านี้ 📚";
            
            document.getElementById('result-message').textContent = message;
            
            // Show weakness
            const weaknessList = document.getElementById('weakness-list');
            const sortedWeakness = Object.entries(weaknessData).sort((a,b) => b[1] - a[1]).slice(0, 3);
            if (sortedWeakness.length > 0 && weaknessList) {
                document.getElementById('analytics-container').classList.remove('hidden');
                weaknessList.innerHTML = sortedWeakness.map(w => `<li><i class="fa-solid fa-circle-exclamation"></i> ${w[0]} <span class="font-bold">(ผิด ${w[1]} ครั้ง)</span></li>`).join('');
            } else if (weaknessList) {
                document.getElementById('analytics-container').classList.add('hidden');
            }
            
            const currentBestScore = localStorage.getItem('baristaBestScore') || 0;
            const currentBestTime = localStorage.getItem('baristaBestTime') || 999999;
            
            if (score > currentBestScore || (score == currentBestScore && timeElapsedSeconds < currentBestTime)) {
                localStorage.setItem('baristaBestScore', score);
                localStorage.setItem('baristaBestTime', timeElapsedSeconds);
            }
        }

        function openHelperMode() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('helper-screen').classList.remove('hidden');
            document.getElementById('helper-screen').classList.add('flex');
            
            document.getElementById('recipe-search-input').value = '';
            searchRecipe();
            setTimeout(() => document.getElementById('recipe-search-input').focus(), 100);
        }

        function closeHelperMode() {
            document.getElementById('helper-screen').classList.add('hidden');
            document.getElementById('helper-screen').classList.remove('flex');
            document.getElementById('start-screen').classList.remove('hidden');
        }

        function searchRecipe() {
            const query = document.getElementById('recipe-search-input').value.toLowerCase();
            const resultsContainer = document.getElementById('recipe-search-results');
            resultsContainer.innerHTML = '';
            
            const filteredMenus = menuDatabase.filter(menu => menu.name.toLowerCase().includes(query));
            
            const groupedMenus = {};
            filteredMenus.forEach(menu => {
                const baseMenuName = menu.name.split(' 16oz.')[0].split(' (')[0].trim();
                if (!groupedMenus[baseMenuName]) {
                    groupedMenus[baseMenuName] = [];
                }
                groupedMenus[baseMenuName].push(menu);
            });
            
            const totalGroups = Object.keys(groupedMenus).length;
            
            document.getElementById('total-recipes-badge').textContent = query ? 
                `พบ ${totalGroups} เมนูหลัก` : 
                `มี ${totalGroups} เมนูหลัก`;
            
            if (totalGroups === 0) {
                resultsContainer.innerHTML = '<div class="text-center text-gray-400 py-8">ไม่พบสูตรที่ค้นหา</div>';
                return;
            }
            
            Object.entries(groupedMenus).forEach(([baseMenuName, menus]) => {
                const card = document.createElement('div');
                card.className = 'bg-brand-50 rounded-xl p-4 border border-brand-100 flex gap-4';
                
                const imgContainer = document.createElement('div');
                imgContainer.className = 'w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-sm border border-brand-100 flex items-center justify-center';
                imgContainer.innerHTML = `<img src="img/menus/${baseMenuName}.jpg" alt="${baseMenuName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid fa-mug-hot text-brand-300 text-3xl\\'></i>';">`;
                
                const contentContainer = document.createElement('div');
                contentContainer.className = 'flex-grow overflow-hidden';
                
                const title = document.createElement('h3');
                title.className = 'font-bold text-brand-900 mb-3 border-b border-brand-200 pb-2 text-lg';
                title.innerHTML = `${baseMenuName}`;
                contentContainer.appendChild(title);
                
                menus.forEach((menu, index) => {
                    const variantContainer = document.createElement('div');
                    variantContainer.className = index > 0 ? 'mt-4 pt-3 border-t border-brand-100 border-dashed' : '';
                    
                    let variantName = menu.name.replace(baseMenuName, '').trim();
                    if(variantName.startsWith('16oz.')) variantName = variantName.replace('16oz.', '').trim();
                    if(variantName.startsWith('16oz')) variantName = variantName.replace('16oz', '').trim();
                    if(!variantName) variantName = '(สูตรมาตรฐาน)';
                    
                    const variantTitle = document.createElement('h4');
                    variantTitle.className = 'text-xs font-bold text-brand-600 mb-2';
                    variantTitle.innerHTML = `<i class="fa-solid fa-star text-[10px] mr-1"></i> ${variantName}`;
                    variantContainer.appendChild(variantTitle);
                    
                    const stepsList = document.createElement('ul');
                    stepsList.className = 'space-y-1 text-sm';
                    
                    menu.steps.forEach((step, stepIndex) => {
                        const li = document.createElement('li');
                        li.className = 'flex items-start';
                        li.innerHTML = `<span class="inline-block bg-brand-200 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 mt-0.5">${stepIndex + 1}</span>
                                        <div><span class="text-gray-500 text-[11px] block">${step.instruction}</span><span class="font-medium text-gray-800 text-xs">${step.correct}</span></div>`;
                        stepsList.appendChild(li);
                    });
                    
                    variantContainer.appendChild(stepsList);
                    contentContainer.appendChild(variantContainer);
                });
                
                card.appendChild(imgContainer);
                card.appendChild(contentContainer);
                resultsContainer.appendChild(card);
            });
        }

        function checkBestStats() {
            const bestScore = localStorage.getItem('baristaBestScore');
            const bestTime = localStorage.getItem('baristaBestTime');
            if (bestScore) {
                document.getElementById('best-stats-container').classList.remove('hidden');
                document.getElementById('best-score').textContent = `${bestScore} pt`;
                
                const mins = Math.floor(bestTime / 60).toString().padStart(2, '0');
                const secs = (bestTime % 60).toString().padStart(2, '0');
                document.getElementById('best-time').textContent = `${mins}:${secs}`;
            }
        }

        function checkDailyStreak() {
            const lastPlayedDate = localStorage.getItem('baristaLastPlayedDate');
            let currentStreak = parseInt(localStorage.getItem('baristaDailyStreak') || '0');
            const today = new Date().toDateString();
            
            if (lastPlayedDate) {
                const lastDate = new Date(lastPlayedDate);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastPlayedDate !== today) {
                    if (lastDate.toDateString() === yesterday.toDateString()) {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                    localStorage.setItem('baristaLastPlayedDate', today);
                    localStorage.setItem('baristaDailyStreak', currentStreak);
                }
            } else {
                currentStreak = 1;
                localStorage.setItem('baristaLastPlayedDate', today);
                localStorage.setItem('baristaDailyStreak', currentStreak);
            }
            
            if (currentStreak > 0) {
                const badge = document.getElementById('daily-streak-badge');
                if (badge) {
                    badge.classList.remove('hidden');
                    document.getElementById('daily-streak-count').textContent = currentStreak;
                }
            }
        }

        window.onload = () => {
            checkBestStats();
            checkDailyStreak();
        };

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker registered!'))
                    .catch(err => console.log('Service Worker registration failed: ', err));
            });
        }
