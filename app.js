// --- Variáveis Globais ---
let scoreNos = 0, scoreEles = 0;
let prevScoreNos = 0, prevScoreEles = 0;
let isInitialState = true;
const maxScore = 12;
let matchesWonNos = 0, matchesWonEles = 0;
let playerNames = [];
let currentDealerIndex = 0;
let timerIntervalId = null;
let gameStartTime = null;
let matchDurationHistory = [];
let undoState = null;
let teamNameNos = "Nós";
let teamNameEles = "Eles";
let currentTheme = 'dark';
let wakeLock = null;
let isSoundOn = true;
let gameMode = 4;
let isGameEffectivelyOver = false;

// --- Constantes Chaves localStorage ---
const STORAGE_KEYS = {
    SCORE_NOS: 'truco_acker_scoreNos_v2',
    SCORE_ELES: 'truco_acker_scoreEles_v2',
    PREV_SCORE_NOS: 'truco_acker_prevScoreNos_v2',
    PREV_SCORE_ELES: 'truco_acker_prevScoreEles_v2',
    IS_INITIAL: 'truco_acker_isInitial_v2',
    MATCHES_NOS: 'truco_acker_matchesNos_v2',
    MATCHES_ELES: 'truco_acker_matchesEles_v2',
    PLAYER_NAMES: 'truco_acker_playerNames_v2',
    DEALER_INDEX: 'truco_acker_dealerIndex_v2',
    TEAM_NAME_NOS: 'truco_acker_teamNameNos_v2',
    TEAM_NAME_ELES: 'truco_acker_teamNameEles_v2',
    DURATION_HISTORY: 'truco_acker_durationHistory_v2',
    THEME: 'truco_acker_theme_v2',
    SOUND_ON: 'truco_acker_soundOn_v2',
    GAME_MODE: 'truco_acker_gameMode_v2'
};

// --- Elementos do DOM ---
let scoreNosElement, scoreElesElement, prevScoreNosElement, prevScoreElesElement,
    matchWinsNosElement, matchWinsElesElement, dealerNameElement, currentTimerElement,
    durationHistoryListElement, undoButton, teamNameNosElement, teamNameElesElement,
    themeToggleButton, soundToggleButton, bodyElement, themeMeta, mainTitleElement,
    editPlayersButton, editTeamsButton, changeGameModeButton, exportHistoryButton, footerTextElement,
    dealerSectionElement, nextDealerButtonElement, scoreControlsContainer;

// --- Funções de Armazenamento Local ---
function saveData(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { console.error("Erro ao salvar dados:", key, e); }
}
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error("Erro ao carregar dados:", key, e);
        return defaultValue;
    }
}
function saveGameMode() { saveData(STORAGE_KEYS.GAME_MODE, gameMode); }
function loadGameMode() { gameMode = loadData(STORAGE_KEYS.GAME_MODE, 4); }

function saveGameState() {
    saveData(STORAGE_KEYS.SCORE_NOS, scoreNos);
    saveData(STORAGE_KEYS.SCORE_ELES, scoreEles);
    saveData(STORAGE_KEYS.PREV_SCORE_NOS, prevScoreNos);
    saveData(STORAGE_KEYS.PREV_SCORE_ELES, prevScoreEles);
    saveData(STORAGE_KEYS.IS_INITIAL, isInitialState);
    saveData(STORAGE_KEYS.MATCHES_NOS, matchesWonNos);
    saveData(STORAGE_KEYS.MATCHES_ELES, matchesWonEles);
    saveData(STORAGE_KEYS.PLAYER_NAMES, playerNames);
    saveData(STORAGE_KEYS.DEALER_INDEX, currentDealerIndex);
    if (gameMode === 4) {
        saveData(STORAGE_KEYS.TEAM_NAME_NOS, teamNameNos);
        saveData(STORAGE_KEYS.TEAM_NAME_ELES, teamNameEles);
    }
    saveData(STORAGE_KEYS.DURATION_HISTORY, matchDurationHistory);
}
function loadGameSettings() {
    currentTheme = loadData(STORAGE_KEYS.THEME, 'dark');
    isSoundOn = loadData(STORAGE_KEYS.SOUND_ON, true);
    loadGameMode();
}
function loadGameData() {
    scoreNos = loadData(STORAGE_KEYS.SCORE_NOS, 0);
    scoreEles = loadData(STORAGE_KEYS.SCORE_ELES, 0);
    prevScoreNos = loadData(STORAGE_KEYS.PREV_SCORE_NOS, 0);
    prevScoreEles = loadData(STORAGE_KEYS.PREV_SCORE_ELES, 0);
    isInitialState = loadData(STORAGE_KEYS.IS_INITIAL, true);
    matchesWonNos = loadData(STORAGE_KEYS.MATCHES_NOS, 0);
    matchesWonEles = loadData(STORAGE_KEYS.MATCHES_ELES, 0);
    playerNames = loadData(STORAGE_KEYS.PLAYER_NAMES, []);
    currentDealerIndex = loadData(STORAGE_KEYS.DEALER_INDEX, 0);
    if (gameMode === 4) {
        teamNameNos = loadData(STORAGE_KEYS.TEAM_NAME_NOS, "Nós");
        teamNameEles = loadData(STORAGE_KEYS.TEAM_NAME_ELES, "Eles");
    }
    matchDurationHistory = loadData(STORAGE_KEYS.DURATION_HISTORY, []);
    isGameEffectivelyOver = (scoreNos >= maxScore || scoreEles >= maxScore);
}
function clearSavedGameData() {
    const keysToClear = Object.values(STORAGE_KEYS).filter(key =>
        key !== STORAGE_KEYS.THEME && key !== STORAGE_KEYS.SOUND_ON && key !== STORAGE_KEYS.GAME_MODE
    );
    keysToClear.forEach(key => localStorage.removeItem(key));
}

// --- Funções de UI ---
function updateMainTitle() {
    if (mainTitleElement) mainTitleElement.textContent = "Marcador Truco Acker";
}
function updateFooterCredit() {
    if (footerTextElement) footerTextElement.textContent = "Desenvolvido por Jacson A Duarte";
}
function updateCurrentGameDisplay(teamScored = null, isTruco = false) {
    if (scoreNosElement) {
        scoreNosElement.textContent = scoreNos;
        if (teamScored === 'nos') {
            scoreNosElement.classList.remove('score-animate');
            void scoreNosElement.offsetWidth;
            scoreNosElement.classList.add('score-animate');
            if (isTruco) {
                const teamEl = scoreNosElement.closest('.team');
                if (teamEl) { teamEl.classList.remove('flash-animate-nos'); void teamEl.offsetWidth; teamEl.classList.add('flash-animate-nos'); }
            }
        }
    }
    if (scoreElesElement) {
        scoreElesElement.textContent = scoreEles;
        if (teamScored === 'eles') {
            scoreElesElement.classList.remove('score-animate');
            void scoreElesElement.offsetWidth;
            scoreElesElement.classList.add('score-animate');
            if (isTruco) {
                const teamEl = scoreElesElement.closest('.team');
                if (teamEl) { teamEl.classList.remove('flash-animate-eles'); void teamEl.offsetWidth; teamEl.classList.add('flash-animate-eles'); }
            }
        }
    }
    if (prevScoreNosElement) prevScoreNosElement.textContent = isInitialState ? '-' : prevScoreNos;
    if (prevScoreElesElement) prevScoreElesElement.textContent = isInitialState ? '-' : prevScoreEles;
}
function updateMatchWinsDisplay() {
    if (matchWinsNosElement) matchWinsNosElement.textContent = matchesWonNos;
    if (matchWinsElesElement) matchWinsElesElement.textContent = matchesWonEles;
}
function updateDealerDisplay() {
    if (!dealerNameElement) return;
    const numExpectedPlayers = gameMode;
    if (playerNames.length === numExpectedPlayers && playerNames[currentDealerIndex] && playerNames[currentDealerIndex].trim() !== "") {
        dealerNameElement.textContent = playerNames[currentDealerIndex];
    } else {
        dealerNameElement.textContent = `-- Defina os ${numExpectedPlayers} Jogadores --`;
    }
}
function updateScoreSectionTitles() {
    if (gameMode === 4) {
        if (teamNameNosElement) teamNameNosElement.textContent = teamNameNos;
        if (teamNameElesElement) teamNameElesElement.textContent = teamNameEles;
    } else {
        if (teamNameNosElement) teamNameNosElement.textContent = playerNames[0] || "Jogador 1";
        if (teamNameElesElement) teamNameElesElement.textContent = playerNames[1] || "Jogador 2";
    }
    updateDurationHistoryDisplay();
}
function updateUIBasedOnMode() {
    if (!dealerSectionElement || !editTeamsButton || !changeGameModeButton || !editPlayersButton || !nextDealerButtonElement) return;
    dealerSectionElement.classList.remove('hidden');
    nextDealerButtonElement.classList.remove('hidden');
    if (gameMode === 4) {
        editTeamsButton.classList.remove('hidden');
        editPlayersButton.textContent = "Editar Nomes dos Jogadores (4)";
        changeGameModeButton.textContent = "Mudar para Modo 2 Jogadores";
    } else {
        editTeamsButton.classList.add('hidden');
        editPlayersButton.textContent = "Editar Nomes dos Jogadores (2)";
        changeGameModeButton.textContent = "Mudar para Modo 4 Jogadores";
    }
    updateScoreSectionTitles();
    updateDealerDisplay();
}
function updateDurationHistoryDisplay() {
    if (!durationHistoryListElement) return;
    durationHistoryListElement.innerHTML = '';
    if (matchDurationHistory.length === 0) {
        durationHistoryListElement.innerHTML = '<li>Nenhuma partida concluída nesta sessão.</li>';
        return;
    }
    for (let i = matchDurationHistory.length - 1; i >= 0; i--) {
        const entry = matchDurationHistory[i];
        const formattedTime = formatTime(entry.duration);
        const listItem = document.createElement('li');
        let winnerDisplayName;
        const entryPlayerNames = entry.playerNames || [];
        const entryTNameNos = entry.teamNameNos;
        const entryTNameEles = entry.teamNameEles;

        if (entry.mode === 4) {
            winnerDisplayName = entry.winner === 'nos' ? (entryTNameNos || "Equipe 1") : (entryTNameEles || "Equipe 2");
        } else {
            winnerDisplayName = entry.winner === 'nos' ? (entryPlayerNames[0] || "Jogador 1") : (entryPlayerNames[1] || "Jogador 2");
        }
        listItem.textContent = `Partida ${i + 1} (${winnerDisplayName}): ${formattedTime} `;
        const winnerIcon = document.createElement('span');
        winnerIcon.classList.add('winner-icon', entry.winner);
        winnerIcon.textContent = 'V';
        listItem.appendChild(winnerIcon);
        durationHistoryListElement.appendChild(listItem);
    }
}
function updateSoundButtonIcon() {
    if (soundToggleButton) soundToggleButton.textContent = isSoundOn ? '🔊' : '🔇';
}

function toggleScoreControls(enable) {
    const allButtons = document.querySelectorAll('.controls button');
    allButtons.forEach(button => {
        button.disabled = !enable;
    });
}

// --- Síntese de Voz ---
function speakText(text, cancelPrevious = true, callback = null) {
    if (!isSoundOn || !('speechSynthesis' in window)) {
        if (callback) callback(); return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; utterance.rate = 1.0; utterance.pitch = 1.0;
    if (callback) {
        utterance.onend = callback;
        utterance.onerror = () => { console.warn("Erro na síntese de voz."); if (callback) callback(); };
    }
    if (cancelPrevious && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setTimeout(() => window.speechSynthesis.speak(utterance), 50);
    } else {
        window.speechSynthesis.speak(utterance);
    }
}

// --- Cronômetro ---
function formatTime(ms) {
    if (ms === null || ms < 0) return "--:--";
    let s = Math.floor(ms / 1000), h = Math.floor(s / 3600);
    s %= 3600; let m = Math.floor(s / 60); s %= 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function startTimer() {
    stopTimer(); gameStartTime = Date.now();
    if (currentTimerElement) currentTimerElement.textContent = formatTime(0);
    timerIntervalId = setInterval(() => {
        if (gameStartTime && currentTimerElement) currentTimerElement.textContent = formatTime(Date.now() - gameStartTime);
        else { clearInterval(timerIntervalId); timerIntervalId = null; }
    }, 1000);
    requestWakeLock();
}
function stopTimer() {
    let d = null; if (gameStartTime) d = Date.now() - gameStartTime;
    if (timerIntervalId) { clearInterval(timerIntervalId); timerIntervalId = null; }
    gameStartTime = null; releaseWakeLock(); return d;
}
function resetCurrentTimerDisplay() { stopTimer(); if (currentTimerElement) currentTimerElement.textContent = formatTime(0); }

// --- Wake Lock API e Audio Unlock ---
async function requestWakeLock() {
    if ('wakeLock' in navigator) try { if (!wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => wakeLock = null); } } catch (e) { wakeLock = null; }
}
async function releaseWakeLock() { if (wakeLock) try { await wakeLock.release(); } catch (e) { /*Ignora*/ } finally { wakeLock = null; } }
document.addEventListener('visibilitychange', async () => { if (document.visibilityState === 'visible' && gameStartTime) await requestWakeLock(); });

let isSpeechUnlocked = false;
document.addEventListener('click', async () => {
    // 1. Desbloqueia a fala no primeiro toque na tela (para iOS/Android restritivos)
    if (!isSpeechUnlocked && isSoundOn && ('speechSynthesis' in window)) {
        let u = new SpeechSynthesisUtterance(''); u.volume = 0;
        window.speechSynthesis.speak(u);
        isSpeechUnlocked = true;
    }
    // 2. Tenta reativar a tela sempre que o jogador interagir com o app
    if (gameStartTime && !wakeLock && ('wakeLock' in navigator)) {
        await requestWakeLock();
    }
});

// --- Gerenciamento de Nomes ---
function getPlayerNames(isModeChangeOrInitialSetup = false) {
    const oldPlayerNames = [...playerNames];
    const numPlayersToDefine = gameMode;
    const newPlayerNames = [];
    let msgAction = isModeChangeOrInitialSetup ? `Definindo jogadores para o modo de ${numPlayersToDefine} jogadores:` : `Editando nomes dos jogadores (${numPlayersToDefine}):`;
    // Não mostra alerta se for apenas para inicializar a voz
    if (!(isModeChangeOrInitialSetup && playerNames.length === numPlayersToDefine && playerNames.every(name => name.startsWith("Jogador ")))) {
        alert(msgAction);
    }


    for (let i = 0; i < numPlayersToDefine; i++) {
        let defaultNameSuggestion = `Jogador ${i + 1}`;
        let currentNameForPrompt = (oldPlayerNames[i] && !isModeChangeOrInitialSetup && oldPlayerNames.length === numPlayersToDefine) ? oldPlayerNames[i] : defaultNameSuggestion;
        let playerName = prompt(`Nome do Jogador ${i + 1}:`, currentNameForPrompt);

        if (playerName === null) {
            if (isModeChangeOrInitialSetup || oldPlayerNames.length !== numPlayersToDefine || !oldPlayerNames.every(name => name && name.trim() !== "")) {
                playerNames = Array(numPlayersToDefine).fill(null).map((_, j) => `Jogador ${j + 1}`);
                if (!(isModeChangeOrInitialSetup && playerNames.length === numPlayersToDefine && playerNames.every(name => name.startsWith("Jogador ")))) {
                    alert("Configuração cancelada/inválida. Usando nomes padrão.");
                }
            } else {
                playerNames = oldPlayerNames;
                if (!(isModeChangeOrInitialSetup && playerNames.length === numPlayersToDefine && playerNames.every(name => name.startsWith("Jogador ")))) {
                    alert("Edição cancelada. Nomes anteriores mantidos.");
                }
            }
            updateScoreSectionTitles(); updateDealerDisplay(); return;
        }
        newPlayerNames.push(playerName.trim() === "" ? defaultNameSuggestion : playerName.trim());
    }
    playerNames = newPlayerNames;
    updateScoreSectionTitles();

    if (isModeChangeOrInitialSetup) currentDealerIndex = 0;
    saveData(STORAGE_KEYS.PLAYER_NAMES, playerNames);
    saveData(STORAGE_KEYS.DEALER_INDEX, currentDealerIndex);
    updateDealerDisplay();

    // Só fala se não for a inicialização silenciosa da voz
    if (!(isModeChangeOrInitialSetup && playerNames.length === numPlayersToDefine && playerNames.every(name => name.startsWith("Jogador ")))) {
        speakText(isModeChangeOrInitialSetup ? `Modo de ${gameMode} jogadores configurado. ${playerNames[currentDealerIndex] || `Jogador ${currentDealerIndex + 1}`} embaralha.` : "Nomes dos jogadores atualizados.");
    }


    if (isModeChangeOrInitialSetup && !gameStartTime && playerNames.length === numPlayersToDefine) {
        startTimer();
    }
}

function editTeamNames() {
    if (gameMode !== 4) return;
    let newNameNos = prompt("Novo nome para a Equipe 1 (Nós):", teamNameNos);
    if (newNameNos && newNameNos.trim()) teamNameNos = newNameNos.trim();
    let newNameEles = prompt("Novo nome para a Equipe 2 (Eles):", teamNameEles);
    if (newNameEles && newNameEles.trim()) teamNameEles = newNameEles.trim();
    saveData(STORAGE_KEYS.TEAM_NAME_NOS, teamNameNos);
    saveData(STORAGE_KEYS.TEAM_NAME_ELES, teamNameEles);
    updateScoreSectionTitles();
    speakText("Nomes das equipes atualizados.");
}

// --- Lógica do Embaralhador ---
function advanceDealer(speakAnnounce = false, callback = null) {
    const numExpectedPlayers = gameMode;
    if (playerNames.length !== numExpectedPlayers) {
        if (speakAnnounce) alert(`Defina os ${numExpectedPlayers} nomes dos jogadores primeiro.`);
        if (callback) callback(); return false;
    }
    currentDealerIndex = (currentDealerIndex + 1) % numExpectedPlayers;
    saveData(STORAGE_KEYS.DEALER_INDEX, currentDealerIndex);
    updateDealerDisplay();
    if (speakAnnounce && playerNames[currentDealerIndex]) {
        speakText(`Próximo a embaralhar: ${playerNames[currentDealerIndex]}`, true, callback);
    } else if (callback) {
        callback();
    }
    return true;
}

// --- Lógica Principal de Pontuação ---
function changeScore(team, amount, speakPointText = null, ignoreMaoDeOnzeCheck = false) {
    if (isGameEffectivelyOver) {
        return false;
    }

    const numExpectedPlayers = gameMode;
    if (playerNames.length !== numExpectedPlayers) {
        alert(`Por favor, defina os nomes dos ${numExpectedPlayers} jogadores antes de pontuar.`);
        getPlayerNames(true); return false;
    }

    if (isInitialState && amount > 0 && !gameStartTime) startTimer();

    let currentTargetScore = team === 'nos' ? scoreNos : scoreEles;
    if ((amount > 0 && currentTargetScore >= maxScore) ||
        (amount < 0 && currentTargetScore <= 0 && amount !== -currentTargetScore) ||
        (amount < 0 && (currentTargetScore + amount) < 0)
    ) {
        if (!(amount > 0 && currentTargetScore >= maxScore)) {
            return false;
        }
    }

    undoState = {
        sN: scoreNos, sE: scoreEles, psN: prevScoreNos, psE: prevScoreEles,
        dI: currentDealerIndex, isI: isInitialState,
        gST: gameStartTime ? Date.now() - gameStartTime : null, mde: gameMode,
        wasOver: isGameEffectivelyOver
    };
    if (undoButton) undoButton.disabled = false;

    prevScoreNos = scoreNos; prevScoreEles = scoreEles; isInitialState = false;
    let winner = null;

    if (team === 'nos') {
        scoreNos = Math.min(maxScore, Math.max(0, scoreNos + amount));
        if (scoreNos >= maxScore) winner = 'nos';
    } else {
        scoreEles = Math.min(maxScore, Math.max(0, scoreEles + amount));
        if (scoreEles >= maxScore) winner = 'eles';
    }
    updateCurrentGameDisplay(amount > 0 ? team : null, amount >= 3);

    if (winner) {
        isGameEffectivelyOver = true;
        toggleScoreControls(false);
    }

    const afterPointSpeechAction = () => {
        const finalAction = () => {
            if (winner) {
                processMatchEnd(winner);
            } else {
                saveGameState();
                if (!ignoreMaoDeOnzeCheck) {
                    checkMaoDeOnzeState();
                }
            }
        };
        if (amount > 0) {
            advanceDealer(false, () => {
                if (playerNames.length === gameMode && playerNames[currentDealerIndex]) {
                    speakText(`Embaralhador: ${playerNames[currentDealerIndex]}`, false, finalAction);
                } else { finalAction(); }
            });
        } else { finalAction(); }
    };

    if (speakPointText && amount !== 0) {
        let fullSpeakText = speakPointText;
        let targetName = getTeamDisplayName(team);
        fullSpeakText += ` para ${targetName}`;
        speakText(fullSpeakText, true, afterPointSpeechAction);
    } else {
        afterPointSpeechAction();
    }
    return true;
}

// Helper: Pega o nome da equipe/jogador pro modo atual
function getTeamDisplayName(team) {
    if (team === 'nos') {
        return gameMode === 4 ? teamNameNos : (playerNames[0] || "Jogador 1");
    } else {
        return gameMode === 4 ? teamNameEles : (playerNames[1] || "Jogador 2");
    }
}

// --- Regra Mão de 11 e Escurinha ---
function checkMaoDeOnzeState() {
    const isNosOnze = scoreNos === 11;
    const isElesOnze = scoreEles === 11;

    // Reseta visibilidade dos paineis primeiro
    document.getElementById('decisao-nos')?.classList.add('hidden');
    document.getElementById('decisao-eles')?.classList.add('hidden');
    toggleScoreControlsSpecific('nos', true, false);
    toggleScoreControlsSpecific('eles', true, false);

    if (isNosOnze && isElesOnze) {
        // Escurinha (11 a 11)
        speakText("Escurinha! Jogo no escuro, não vale pedir truco.");
        toggleScoreControlsSpecific('nos', true, true); // Trava botões de truco
        toggleScoreControlsSpecific('eles', true, true); // Trava botões de truco
    } else if (isNosOnze) {
        // Mão de 11 para Nós
        let teamName = getTeamDisplayName('nos');
        speakText(`Mão de 11 para a equipe ${teamName}! Podem olhar ou correr.`);
        toggleScoreControlsSpecific('nos', false); // Oculta controles normais
        document.getElementById('decisao-nos')?.classList.remove('hidden'); // Mostra dor
        toggleScoreControlsSpecific('eles', true, true); // Eles não trucam
    } else if (isElesOnze) {
        // Mão de 11 para Eles
        let teamName = getTeamDisplayName('eles');
        speakText(`Mão de 11 para a equipe ${teamName}! Podem olhar ou correr.`);
        toggleScoreControlsSpecific('eles', false);
        document.getElementById('decisao-eles')?.classList.remove('hidden');
        toggleScoreControlsSpecific('nos', true, true);
    }
}

// Ativa/Trava botoes específicos de uma equipe (parametro 'trucoOnly' trava os acima de +1)
function toggleScoreControlsSpecific(team, enable, trucoOnly = false) {
    const controls = document.querySelectorAll(`.team .controls button[data-team="${team}"]`);
    controls.forEach(btn => {
        let amt = parseInt(btn.dataset.amount);
        if (!enable) {
            btn.classList.add('hidden');
        } else {
            btn.classList.remove('hidden');
            if (trucoOnly && (amt >= 3 || amt === -1)) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        }
    });
}

// --- Funcionalidade Desfazer ---
function undoLastAction() {
    if (undoState) {
        if (undoState.mde !== undefined && undoState.mde !== gameMode) {
            alert("Não é possível desfazer após trocar o modo de jogo.");
            speakText("Não é possível desfazer após trocar o modo de jogo.", true);
            undoState = null; if (undoButton) undoButton.disabled = true; return;
        }
        scoreNos = undoState.sN; scoreEles = undoState.sE;
        prevScoreNos = undoState.psN; prevScoreEles = undoState.psE;
        isInitialState = undoState.isI; currentDealerIndex = undoState.dI;

        isGameEffectivelyOver = undoState.wasOver;
        if (scoreNos < maxScore && scoreEles < maxScore) {
            isGameEffectivelyOver = false;
        }
        toggleScoreControls(!isGameEffectivelyOver);

        if (undoState.gST !== null && !gameStartTime) {
            gameStartTime = Date.now() - undoState.gST; startTimer();
        } else if (undoState.gST === null && gameStartTime) {
            resetCurrentTimerDisplay();
        }
        updateCurrentGameDisplay(); updateDealerDisplay(); updateScoreSectionTitles(); saveGameState();

        // Se voltou para algo que envolvia mão de 11.
        checkMaoDeOnzeState();

        undoState = null; if (undoButton) undoButton.disabled = true;
        speakText("Ação desfeita.", true);
    } else {
        speakText("Nada para desfazer.", true); if (undoButton) undoButton.disabled = true;
    }
}

// --- Fim de Partida e Preparação para Próximo Jogo ---
function processMatchEnd(winnerTeam) {
    const durationMs = stopTimer();
    if (durationMs !== null) {
        matchDurationHistory.push({
            duration: durationMs, winner: winnerTeam, mode: gameMode,
            playerNames: [...playerNames],
            teamNameNos: gameMode === 4 ? teamNameNos : null,
            teamNameEles: gameMode === 4 ? teamNameEles : null
        });
        saveData(STORAGE_KEYS.DURATION_HISTORY, matchDurationHistory);
        updateDurationHistoryDisplay();
    }
    undoState = null; if (undoButton) undoButton.disabled = true;

    let winnerNameDisplay, winningTerm = "ganhou";
    if (gameMode === 4) {
        winnerNameDisplay = winnerTeam === 'nos' ? teamNameNos : teamNameEles;
    } else {
        winnerNameDisplay = winnerTeam === 'nos' ? (playerNames[0] || "Jogador 1") : (playerNames[1] || "Jogador 2");
    }

    const speechAndAlertCallback = () => {
        let alertMsg = `${winnerNameDisplay} venceu a partida!\n\nDuração: ${formatTime(durationMs)}\nPlacar de Partidas:\n`;
        const p1Display = gameMode === 4 ? teamNameNos : (playerNames[0] || "J1");
        const p2Display = gameMode === 4 ? teamNameEles : (playerNames[1] || "J2");
        alertMsg += `${p1Display}: ${matchesWonNos}\n${p2Display}: ${matchesWonEles}`;

        alert(alertMsg);
        updateMatchWinsDisplay();
        prepareNextGame(); // AUTOMATICAMENTE PREPARA A PRÓXIMA PARTIDA APÓS O ALERT
    };

    setTimeout(() => {
        if (winnerTeam === 'nos') matchesWonNos++; else matchesWonEles++;
        saveData(STORAGE_KEYS.MATCHES_NOS, matchesWonNos);
        saveData(STORAGE_KEYS.MATCHES_ELES, matchesWonEles);
        speakText(`${winnerNameDisplay} ${winningTerm} a partida!`, true, speechAndAlertCallback);
    }, 300);
}

function prepareNextGame(isModeChange = false) {
    scoreNos = 0; scoreEles = 0; prevScoreNos = 0; prevScoreEles = 0;
    isInitialState = true; undoState = null;
    isGameEffectivelyOver = false;
    toggleScoreControls(true);

    if (undoButton) undoButton.disabled = true;
    updateCurrentGameDisplay(); resetCurrentTimerDisplay();

    if (isModeChange) {
        matchesWonNos = 0; matchesWonEles = 0; updateMatchWinsDisplay();
        playerNames = [];
        if (gameMode === 4) { teamNameNos = "Nós"; teamNameEles = "Eles"; }
        getPlayerNames(true);
    } else {
        saveGameState();
        if (playerNames.length === gameMode && playerNames.every(name => name && name.trim() !== "")) {
            setTimeout(startTimer, 150);
        } else if (playerNames.length === gameMode) {
            setTimeout(startTimer, 150);
        }
    }
}

// --- Funções de Reset ---
function resetCurrentGame(isModeChange = false) {
    if (isModeChange || confirm("Tem certeza que deseja reiniciar apenas o jogo atual (placar de 0 a 12)?")) {
        prepareNextGame(isModeChange);
        if (!isModeChange) speakText("Jogo atual reiniciado.");
    }
}

function resetAllScores() {
    if (confirm("!!! ATENÇÃO !!!\n\nZerar TODO o placar?")) {
        clearSavedGameData();
        matchesWonNos = 0; matchesWonEles = 0;
        if (gameMode === 4) { teamNameNos = "Nós"; teamNameEles = "Eles"; }
        playerNames = []; currentDealerIndex = 0; matchDurationHistory = [];
        updateMatchWinsDisplay(); updateScoreSectionTitles(); updateDealerDisplay();
        updateDurationHistoryDisplay();
        prepareNextGame(true);
        speakText("Placar geral zerado. Configure os nomes.");
    }
}

// --- Tema e Som ---
function setTheme(themeName) {
    if (!bodyElement || !themeToggleButton || !themeMeta) return;
    bodyElement.className = themeName + '-theme'; currentTheme = themeName;
    saveData(STORAGE_KEYS.THEME, themeName);
    themeToggleButton.textContent = themeName === 'dark' ? '☀️' : '🌙';
    themeMeta.content = themeName === 'dark' ? '#1f1f1f' : '#f0f0f0';
}
function toggleTheme() { setTheme(currentTheme === 'dark' ? 'light' : 'dark'); }
function setSound(soundOn) { isSoundOn = soundOn; saveData(STORAGE_KEYS.SOUND_ON, isSoundOn); updateSoundButtonIcon(); }
function toggleSound() { setSound(!isSoundOn); if (isSoundOn) speakText("Som ativado.", true); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }

// --- Funcionalidades Adicionais ---
function toggleGameMode() {
    if (confirm(`Deseja mudar para o modo de ${gameMode === 4 ? 2 : 4} jogadores?\nO jogo atual e o placar de partidas ganhas serão reiniciados.`)) {
        gameMode = (gameMode === 4 ? 2 : 4);
        saveGameMode();
        updateUIBasedOnMode();
        resetCurrentGame(true);
        speakText(`Modo alterado para ${gameMode} jogadores. Configure os nomes.`, true);
    }
}

function exportHistoryToWhatsApp() {
    const numExpectedPlayers = gameMode;
    if (playerNames.length !== numExpectedPlayers) {
        alert(`Defina os nomes dos ${numExpectedPlayers} jogadores e jogue algumas partidas antes de exportar.`); return;
    }
    let historyText = `*Histórico - Marcador Truco Acker (${gameMode} Jogadores)*\n\n`;
    const currentP1Name = playerNames[0] || "Jogador 1";
    const currentP2Name = playerNames[1] || "Jogador 2";
    const currentP3Name = playerNames[2] || "Jogador 3";
    const currentP4Name = playerNames[3] || "Jogador 4";

    if (gameMode === 4) {
        historyText += `*Equipes:*\n${teamNameNos} vs ${teamNameEles}\n`;
        historyText += `*Jogadores ${teamNameNos}:* ${currentP1Name}, ${currentP3Name}\n`;
        historyText += `*Jogadores ${teamNameEles}:* ${currentP2Name}, ${currentP4Name}\n\n`;
    } else {
        historyText += `*Jogadores:*\n${currentP1Name} vs ${currentP2Name}\n\n`;
    }
    const scoreTeam1Name = gameMode === 4 ? teamNameNos : currentP1Name;
    const scoreTeam2Name = gameMode === 4 ? teamNameEles : currentP2Name;
    historyText += `*Placar Atual:*\n${scoreTeam1Name}: ${scoreNos}\n${scoreTeam2Name}: ${scoreEles}\n\n`;
    historyText += `*Partidas Ganhas (Sessão):*\n${scoreTeam1Name}: ${matchesWonNos}\n${scoreTeam2Name}: ${matchesWonEles}\n\n`;

    const filteredDurationHistory = matchDurationHistory.filter(entry => entry.mode === gameMode);
    if (filteredDurationHistory.length > 0) {
        historyText += `*Histórico de Duração (Modo ${gameMode}P):*\n`;
        filteredDurationHistory.forEach((entry, index) => {
            let winnerDisplayNameExport;
            const entryPNames = entry.playerNames || [];
            const entryTNameNos = entry.teamNameNos;
            const entryTNameEles = entry.teamNameEles;
            if (entry.mode === 4) {
                winnerDisplayNameExport = entry.winner === 'nos' ? (entryTNameNos || "Equipe 1") : (entryTNameEles || "Equipe 2");
            } else {
                winnerDisplayNameExport = entry.winner === 'nos' ? (entryPNames[0] || "Jogador 1") : (entryPNames[1] || "Jogador 2");
            }
            historyText += `Partida ${index + 1} (${winnerDisplayNameExport}): ${formatTime(entry.duration)}\n`;
        });
    } else { historyText += `Nenhuma partida concluída neste modo (${gameMode}P) para exibir no histórico de durações.\n`; }
    historyText += `\nEmbaralhador Atual: ${dealerNameElement.textContent}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(historyText)}`, '_blank');
    speakText("Histórico pronto para compartilhar.", true);
}

// --- Event Listeners ---
function addEventListeners() {
    document.querySelector('.teams').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (btn?.dataset.team && btn.dataset.amount) changeScore(btn.dataset.team, parseInt(btn.dataset.amount), btn.dataset.speak);
        // Botões Novod da Mao de 11
        if (btn?.classList.contains('btn-aceitar')) {
            const teamInfo = btn.dataset.team;
            document.getElementById(`decisao-${teamInfo}`).classList.add('hidden');
            toggleScoreControlsSpecific(teamInfo, true, true); // Volta os controles (sem truco pois já vale 3)
            speakText("Jogo aceito! Valendo 3 pontos!");
        }
        if (btn?.classList.contains('btn-recusar')) {
            const teamInfo = btn.dataset.team;
            const inimigo = teamInfo === 'nos' ? 'eles' : 'nos';
            document.getElementById(`decisao-${teamInfo}`).classList.add('hidden');
            toggleScoreControlsSpecific(teamInfo, true, false);
            speakText("Correu! Um ponto para o adversário.", true, () => {
                // Ignore mão de 11 loop adicionando o bool no changeScore
                changeScore(inimigo, 1, null, true);
                // Restaura os botões de todos p normal na próxima mão
                toggleScoreControlsSpecific('nos', true, false);
                toggleScoreControlsSpecific('eles', true, false);
            });
        }
    });
    themeToggleButton?.addEventListener('click', toggleTheme);
    soundToggleButton?.addEventListener('click', toggleSound);
    nextDealerButtonElement?.addEventListener('click', () => {
        if (isGameEffectivelyOver) {
            // A fala e o reinício automático são tratados em processMatchEnd
            // speakText("A partida terminou. Uma nova partida será iniciada em breve.", true);
            return;
        }
        advanceDealer(true);
    });
    undoButton?.addEventListener('click', undoLastAction);
    editTeamsButton?.addEventListener('click', editTeamNames);
    editPlayersButton?.addEventListener('click', () => getPlayerNames(false));
    document.getElementById('reset-game-btn')?.addEventListener('click', () => resetCurrentGame(false));
    document.getElementById('reset-all-btn')?.addEventListener('click', resetAllScores);
    changeGameModeButton?.addEventListener('click', toggleGameMode);
    exportHistoryButton?.addEventListener('click', exportHistoryToWhatsApp);
}

// --- Inicialização ---
function initializeApp() {
    mainTitleElement = document.getElementById('main-title');
    scoreNosElement = document.getElementById('score-nos');
    scoreElesElement = document.getElementById('score-eles');
    prevScoreNosElement = document.getElementById('prev-score-nos');
    prevScoreElesElement = document.getElementById('prev-score-eles');
    matchWinsNosElement = document.getElementById('match-wins-nos');
    matchWinsElesElement = document.getElementById('match-wins-eles');
    dealerNameElement = document.getElementById('current-dealer-name');
    currentTimerElement = document.getElementById('current-timer-display');
    durationHistoryListElement = document.getElementById('duration-history-list');
    undoButton = document.getElementById('undo-button');
    teamNameNosElement = document.getElementById('team-name-nos');
    teamNameElesElement = document.getElementById('team-name-eles');
    themeToggleButton = document.getElementById('theme-toggle-btn');
    soundToggleButton = document.getElementById('sound-toggle-btn');
    bodyElement = document.body;
    themeMeta = document.getElementById('theme-color-meta');
    editPlayersButton = document.getElementById('edit-players-btn');
    editTeamsButton = document.getElementById('edit-teams-btn');
    changeGameModeButton = document.getElementById('change-game-mode-btn');
    exportHistoryButton = document.getElementById('export-history-btn');
    footerTextElement = document.getElementById('footer-text');
    dealerSectionElement = document.querySelector('.dealer-section');
    nextDealerButtonElement = document.getElementById('next-dealer-btn');
    // scoreControlsContainer é definido na primeira chamada de toggleScoreControls

    loadGameSettings(); setTheme(currentTheme); setSound(isSoundOn);
    loadGameData();
    updateUIBasedOnMode();
    updateMainTitle(); updateFooterCredit(); updateCurrentGameDisplay();
    updateMatchWinsDisplay();
    updateDurationHistoryDisplay();
    if (undoButton) undoButton.disabled = (undoState === null);
    addEventListeners();

    toggleScoreControls(!isGameEffectivelyOver);

    const numExpectedPlayers = gameMode;
    // Se os nomes não estiverem definidos ou forem os padrão "Jogador X", pede para definir.
    // A voz será iniciada aqui se getPlayerNames for chamado e o usuário interagir com o prompt.
    if (playerNames.length !== numExpectedPlayers || !playerNames.every(name => name && name.trim() !== "") || playerNames.some(name => name.startsWith("Jogador "))) {
        setTimeout(() => getPlayerNames(true), 300);
    } else {
        resetCurrentTimerDisplay();
        if (gameStartTime && !isGameEffectivelyOver) {
            const elapsed = Date.now() - gameStartTime;
            currentTimerElement.textContent = formatTime(elapsed);
            startTimer();
        }
    }

    // Check if re-opening game triggers a Mao de 11 scenario visually
    if (!isInitialState && !isGameEffectivelyOver) {
        checkMaoDeOnzeState();
    }
}
document.addEventListener('DOMContentLoaded', initializeApp);
