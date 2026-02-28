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

// --- Sistema de Áudio MP3 (Voz Francisca) ---
const AUDIO_BASE_PATH = 'audio/';

// Cache de áudio em memória (Blob URLs)
const audioCache = {};

// Mapa de nomes de jogadores/equipes padrão para seus arquivos MP3 estáticos
const STATIC_NAME_MAP = {
    'jogador 1': 'jogador_1', 'jogador 2': 'jogador_2',
    'jogador 3': 'jogador_3', 'jogador 4': 'jogador_4',
    'nós': 'equipe_nos', 'eles': 'equipe_eles',
    'os pato': 'equipe_os_pato', 'os marreco': 'equipe_os_marreco',
    'os freguês': 'equipe_os_freegues', 'os mão de alface': 'equipe_os_mao_de_alface',
    'os boca aberta': 'equipe_os_boca_aberta', 'os treme-treme': 'equipe_os_treme_treme',
    'os pé de cana': 'equipe_os_pe_de_cana', 'os copo furado': 'equipe_os_copo_furado',
    'os garganta': 'equipe_os_garganta', 'as patroa': 'equipe_as_patroa',
    'os cunhado': 'equipe_os_cunhado', 'os manja rola': 'equipe_os_manja_rola',
    'os queima rosca': 'equipe_os_queima_rosca'
};

// Lista de nomes engraçados de equipes para o seletor
const FUNNY_TEAM_NAMES = [
    'Nós', 'Eles', 'Os Pato', 'Os Marreco', 'Os Freguês',
    'Os Mão de Alface', 'Os Boca Aberta', 'Os Treme-Treme',
    'Os Pé de Cana', 'Os Copo Furado', 'Os Garganta',
    'As Patroa', 'Os Cunhado', 'Os Manja Rola', 'Os Queima Rosca'
];

// Pré-carregar MP3 estáticos na memória
function preloadStaticAudio() {
    const staticFiles = [
        'truco', 'seis', 'nove', 'doze', 'para', 'um_ponto',
        'mao_de_11', 'decidir_mao_11', 'escurinha', 'jogo_aceito', 'correu',
        'acao_desfeita', 'nada_desfazer', 'jogo_reiniciado', 'placar_zerado',
        'som_ativado', 'nomes_atualizados', 'equipes_atualizadas',
        'nao_desfazer_modo', 'historico_pronto',
        'embaralhador', 'embaralha', 'proximo_embaralhar',
        'ganhou_partida', 'ganharam_partida',
        'modo_2_config', 'modo_4_config', 'modo_alterado_2', 'modo_alterado_4',
        'jogador_1', 'jogador_2', 'jogador_3', 'jogador_4',
        'equipe_nos', 'equipe_eles',
        'equipe_os_pato', 'equipe_os_marreco', 'equipe_os_freegues',
        'equipe_os_mao_de_alface', 'equipe_os_boca_aberta', 'equipe_os_treme_treme',
        'equipe_os_pe_de_cana', 'equipe_os_copo_furado', 'equipe_os_garganta',
        'equipe_as_patroa', 'equipe_os_cunhado', 'equipe_os_manja_rola',
        'equipe_os_queima_rosca'
    ];
    staticFiles.forEach(name => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = `${AUDIO_BASE_PATH}${name}.mp3`;
        audioCache[name] = audio;
    });
}

// --- Edge-TTS no Browser via WebSocket ---
const EDGE_TTS_TRUSTED_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const EDGE_TTS_CHROMIUM_VER = '143.0.3650.75';
const WINDOWS_FILE_TIME_EPOCH = 11644473600n;

function escapeXml(text) {
    return text.replace(/[<>&"']/g, c => {
        switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '"': return '&quot;'; case "'": return '&apos;'; default: return c; }
    });
}

async function generateSecMsGecToken() {
    const ticks = BigInt(Math.floor(Date.now() / 1000) + Number(WINDOWS_FILE_TIME_EPOCH)) * 10000000n;
    const roundedTicks = ticks - (ticks % 3000000000n);
    const strToHash = `${roundedTicks}${EDGE_TTS_TRUSTED_TOKEN}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(strToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function generateRequestId() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Gera áudio MP3 com a voz Francisca direto no browser via WebSocket
async function edgeTtsGenerateInBrowser(text) {
    const secToken = await generateSecMsGecToken();
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${EDGE_TTS_TRUSTED_TOKEN}&Sec-MS-GEC=${secToken}&Sec-MS-GEC-Version=1-${EDGE_TTS_CHROMIUM_VER}`;

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        const audioChunks = [];
        let resolved = false;

        ws.onopen = () => {
            // Config
            ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
            // SSML
            const reqId = generateRequestId();
            ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="pt-BR-FranciscaNeural"><prosody rate="default" pitch="default" volume="default">${escapeXml(text)}</prosody></voice></speak>`);
        };

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                // Dados binários = áudio
                event.data.arrayBuffer().then(buf => {
                    // Procura o separador "Path:audio\r\n" no binário
                    const view = new Uint8Array(buf);
                    const separator = new TextEncoder().encode('Path:audio\r\n');
                    let sepIndex = -1;
                    for (let i = 0; i <= view.length - separator.length; i++) {
                        let match = true;
                        for (let j = 0; j < separator.length; j++) {
                            if (view[i + j] !== separator[j]) { match = false; break; }
                        }
                        if (match) { sepIndex = i + separator.length; break; }
                    }
                    if (sepIndex > 0) {
                        audioChunks.push(view.slice(sepIndex));
                    }
                });
            } else if (typeof event.data === 'string') {
                if (event.data.includes('Path:turn.end')) {
                    ws.close();
                }
            }
        };

        ws.onclose = () => {
            if (resolved) return;
            resolved = true;
            if (audioChunks.length > 0) {
                const totalLen = audioChunks.reduce((a, c) => a + c.length, 0);
                const merged = new Uint8Array(totalLen);
                let offset = 0;
                for (const chunk of audioChunks) { merged.set(chunk, offset); offset += chunk.length; }
                const blob = new Blob([merged], { type: 'audio/mpeg' });
                resolve(blob);
            } else {
                reject(new Error('Nenhum áudio recebido'));
            }
        };

        ws.onerror = (err) => {
            if (!resolved) { resolved = true; reject(new Error('Erro no WebSocket TTS')); }
        };

        // Timeout de 10s
        setTimeout(() => {
            if (!resolved) { resolved = true; ws.close(); reject(new Error('Timeout TTS')); }
        }, 10000);
    });
}

// Gera áudio dinâmico para um nome usando edge-tts direto no browser
async function generateDynamicNameAudio(name) {
    const cacheKey = `name_${name.toLowerCase().trim()}`;
    if (audioCache[cacheKey]) return cacheKey; // Já cacheado na memória

    // Verifica se tem no mapa estático
    const staticKey = STATIC_NAME_MAP[name.toLowerCase().trim()];
    if (staticKey && audioCache[staticKey]) return staticKey;

    // Verifica no localStorage (cache persistente)
    try {
        const cached = localStorage.getItem(`tts_cache_${cacheKey}`);
        if (cached) {
            const audio = new Audio(cached); // data: URL
            audioCache[cacheKey] = audio;
            return cacheKey;
        }
    } catch (e) { /* Ignora */ }

    // Gera com edge-tts direto no browser!
    try {
        console.log(`🎙️ Gerando áudio Francisca para: "${name}"`);
        const blob = await edgeTtsGenerateInBrowser(name);
        const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        // Salva no localStorage para cache persistente
        try { localStorage.setItem(`tts_cache_${cacheKey}`, dataUrl); } catch (e) { /* Ignora */ }
        const audio = new Audio(dataUrl);
        audioCache[cacheKey] = audio;
        console.log(`✅ Áudio gerado e cacheado para: "${name}"`);
        return cacheKey;
    } catch (e) {
        console.warn('Falha ao gerar áudio dinâmico para:', name, e);
        return null;
    }
}

// Pré-gera áudio para todos os nomes atuais de jogadores/equipes
async function preloadPlayerNameAudios() {
    const namestoPreload = [...playerNames];
    if (gameMode === 4) {
        namestoPreload.push(teamNameNos, teamNameEles);
    }
    for (const name of namestoPreload) {
        if (name && name.trim()) {
            await generateDynamicNameAudio(name);
        }
    }
}

// Resolve o áudio key para um nome (estático ou dinâmico)
function getNameAudioKey(name) {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    const staticKey = STATIC_NAME_MAP[lower];
    if (staticKey && audioCache[staticKey]) return staticKey;
    const dynamicKey = `name_${lower}`;
    if (audioCache[dynamicKey]) return dynamicKey;
    return null;
}

// Toca uma sequência de áudios MP3
let currentAudioPlaying = null;
function playAudioSequence(keys, callback = null) {
    if (!isSoundOn) { if (callback) callback(); return; }

    // Cancela áudio anterior
    if (currentAudioPlaying) {
        currentAudioPlaying.pause();
        currentAudioPlaying.currentTime = 0;
        currentAudioPlaying = null;
    }

    const validKeys = keys.filter(k => k && audioCache[k]);
    if (validKeys.length === 0) {
        if (callback) callback();
        return;
    }

    let index = 0;
    function playNext() {
        if (index >= validKeys.length) {
            currentAudioPlaying = null;
            if (callback) callback();
            return;
        }
        const key = validKeys[index];
        const cached = audioCache[key];
        // Clonar para poder tocar o mesmo áudio sem conflito
        const audio = cached.cloneNode ? cached.cloneNode() : new Audio(cached.src);
        currentAudioPlaying = audio;
        audio.onended = () => { index++; playNext(); };
        audio.onerror = () => { console.warn('Erro no áudio:', key); index++; playNext(); };
        audio.play().catch(() => { index++; playNext(); });
    }
    playNext();
}

// Função wrapper que substitui o antigo speakText
// Aceita: uma string com o ID do MP3, ou um array de IDs para tocar em sequência
function speakText(audioKeyOrKeys, cancelPrevious = true, callback = null) {
    if (!isSoundOn) { if (callback) callback(); return; }
    const keys = Array.isArray(audioKeyOrKeys) ? audioKeyOrKeys : [audioKeyOrKeys];
    playAudioSequence(keys, callback);
}

// Fallback: fala com voz do navegador se não tiver MP3
function speakFallback(text, callback = null) {
    if (!isSoundOn || !('speechSynthesis' in window)) { if (callback) callback(); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; utterance.rate = 1.0;
    if (callback) { utterance.onend = callback; utterance.onerror = () => { if (callback) callback(); }; }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setTimeout(() => window.speechSynthesis.speak(utterance), 50);
    } else { window.speechSynthesis.speak(utterance); }
}
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

let isAudioUnlocked = false;
document.addEventListener('click', async () => {
    if (!isAudioUnlocked && isSoundOn) {
        try {
            const silentAudio = new Audio();
            silentAudio.volume = 0;
            await silentAudio.play().catch(() => { });
            isAudioUnlocked = true;
        } catch (e) { /* Ignora */ }
    }
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
        if (isModeChangeOrInitialSetup) {
            const modeKey = gameMode === 2 ? 'modo_2_config' : 'modo_4_config';
            const dealerKey = getNameAudioKey(playerNames[currentDealerIndex]);
            speakText([modeKey, dealerKey, 'embaralha'].filter(Boolean), true);
        } else {
            speakText('nomes_atualizados');
        }
    }
    // Pré-carrega áudio dos nomes digitados
    preloadPlayerNameAudios();


    if (isModeChangeOrInitialSetup && !gameStartTime && playerNames.length === numPlayersToDefine) {
        startTimer();
    }
}

// Variável para o fluxo de seleção de equipes
let currentTeamBeingEdited = null; // 'nos' ou 'eles'
let teamNameSelectionCallback = null;

function editTeamNames() {
    if (gameMode !== 4) return;
    // Primeiro: escolhe nome da Equipe 1 (Nós)
    openTeamNameModal('nos', () => {
        // Depois: escolhe nome da Equipe 2 (Eles)
        openTeamNameModal('eles', () => {
            saveData(STORAGE_KEYS.TEAM_NAME_NOS, teamNameNos);
            saveData(STORAGE_KEYS.TEAM_NAME_ELES, teamNameEles);
            updateScoreSectionTitles();
            speakText('equipes_atualizadas');
            preloadPlayerNameAudios();
        });
    });
}

function openTeamNameModal(team, callback) {
    currentTeamBeingEdited = team;
    teamNameSelectionCallback = callback;
    const modal = document.getElementById('teamNameModal');
    const title = document.getElementById('teamModalTitle');
    const grid = document.getElementById('teamNameGrid');
    const customInput = document.getElementById('customTeamNameInput');

    title.textContent = team === 'nos' ? 'Nome da Equipe 1 (Nós)' : 'Nome da Equipe 2 (Eles)';
    customInput.value = '';

    // Preenche o grid com os nomes engraçados
    grid.innerHTML = '';
    FUNNY_TEAM_NAMES.forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'team-name-option';
        btn.textContent = name;
        btn.addEventListener('click', () => selectTeamName(name));
        grid.appendChild(btn);
    });

    modal.classList.remove('hidden');
}

function selectTeamName(name) {
    if (currentTeamBeingEdited === 'nos') {
        teamNameNos = name;
    } else {
        teamNameEles = name;
    }
    document.getElementById('teamNameModal').classList.add('hidden');
    if (teamNameSelectionCallback) {
        setTimeout(teamNameSelectionCallback, 200);
    }
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
        const nameKey = getNameAudioKey(playerNames[currentDealerIndex]);
        if (nameKey) {
            speakText(['proximo_embaralhar', nameKey].filter(Boolean), true, callback);
        } else {
            playAudioSequence(['proximo_embaralhar'], () => {
                speakFallback(playerNames[currentDealerIndex], callback);
            });
        }
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

        if (winner) {
            advanceDealer(false, finalAction);
        } else if (amount > 0) {
            advanceDealer(false, () => {
                if (playerNames.length === gameMode && playerNames[currentDealerIndex]) {
                    const nameKey = getNameAudioKey(playerNames[currentDealerIndex]);
                    if (nameKey) {
                        speakText(['embaralhador', nameKey].filter(Boolean), false, finalAction);
                    } else {
                        playAudioSequence(['embaralhador'], () => {
                            speakFallback(playerNames[currentDealerIndex], finalAction);
                        });
                    }
                } else { finalAction(); }
            });
        } else { finalAction(); }
    };

    if (speakPointText && amount !== 0) {
        // Converte 'um ponto' -> 'um_ponto', 'Truco' -> 'truco', etc.
        const pointKey = speakPointText.toLowerCase().replace(/\s+/g, '_');
        let targetName = getTeamDisplayName(team);
        const nameKey = getNameAudioKey(targetName);
        if (nameKey) {
            speakText([pointKey, 'para', nameKey].filter(Boolean), true, afterPointSpeechAction);
        } else {
            // Nome não tem MP3, usa MP3 de pontuação + fallback de voz para o nome
            playAudioSequence([pointKey, 'para'].filter(k => k && audioCache[k]), () => {
                speakFallback(targetName, afterPointSpeechAction);
            });
        }
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
    toggleScoreControlsSpecific('nos', 'normal');
    toggleScoreControlsSpecific('eles', 'normal');

    if (isNosOnze && isElesOnze) {
        speakText('escurinha');
        toggleScoreControlsSpecific('nos', 'escurinha');
        toggleScoreControlsSpecific('eles', 'escurinha');
    } else if (isNosOnze) {
        let teamName = getTeamDisplayName('nos');
        const nameKey = getNameAudioKey(teamName);
        if (nameKey) {
            speakText(['mao_de_11', nameKey, 'decidir_mao_11'].filter(Boolean));
        } else {
            playAudioSequence(['mao_de_11'], () => {
                speakFallback(teamName, () => { playAudioSequence(['decidir_mao_11']); });
            });
        }
        toggleScoreControlsSpecific('nos', 'none');
        document.getElementById('decisao-nos')?.classList.remove('hidden');
        toggleScoreControlsSpecific('eles', 'none');
    } else if (isElesOnze) {
        let teamName = getTeamDisplayName('eles');
        const nameKey = getNameAudioKey(teamName);
        if (nameKey) {
            speakText(['mao_de_11', nameKey, 'decidir_mao_11'].filter(Boolean));
        } else {
            playAudioSequence(['mao_de_11'], () => {
                speakFallback(teamName, () => { playAudioSequence(['decidir_mao_11']); });
            });
        }
        toggleScoreControlsSpecific('eles', 'none');
        document.getElementById('decisao-eles')?.classList.remove('hidden');
        toggleScoreControlsSpecific('nos', 'none');
    }

    // Mantém o botão Desfazer habilitado se houver estado anterior
    if (undoButton && undoState) undoButton.disabled = false;
}

// Ativa/Trava botoes específicos de uma equipe
// mode: 'normal', 'none' (hiddden), 'escurinha' (apenas +1 e -1 permiitido), 'aceitou11' (apenas +3 permitido)
function toggleScoreControlsSpecific(team, mode) {
    const controls = document.querySelectorAll(`.team .controls button[data-team="${team}"]`);
    controls.forEach(btn => {
        let amt = parseInt(btn.dataset.amount);

        if (mode === 'none') {
            btn.classList.add('hidden');
        } else {
            btn.classList.remove('hidden');

            if (mode === 'escurinha') {
                // Na escurinha, ninguém pode pedir truco (+3, +6, +9, +12)
                if (amt >= 3 || amt === -1) {
                    btn.disabled = true;
                    if (amt >= 3) btn.classList.add('hidden'); // Oculta pra ficar limpo
                } else {
                    btn.disabled = false;
                }
            }
            else if (mode === 'aceitou11') {
                // Se aceitou a mão de 11, o jogo OBRIGATORIAMENTE vale 3 pontos.
                // Esconde todos os botões exceto o +3 para facilitar.
                if (amt !== 3) {
                    btn.classList.add('hidden');
                    btn.disabled = true;
                } else {
                    btn.disabled = false;
                    btn.classList.remove('hidden');
                }
            }
            else { // 'normal'
                btn.disabled = false;
            }
        }
    });

    // Restaurar layout se o botão +1 voltar (caso tenha sido escondido antes)
    if (mode === 'normal') {
        controls.forEach(btn => { btn.classList.remove('hidden'); btn.disabled = false; });
    }
}

// --- Funcionalidade Desfazer ---
function undoLastAction() {
    if (undoState) {
        if (undoState.mde !== undefined && undoState.mde !== gameMode) {
            alert("Não é possível desfazer após trocar o modo de jogo.");
            speakText('nao_desfazer_modo', true);
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
        speakText('acao_desfeita', true);
    } else {
        speakText('nada_desfazer', true); if (undoButton) undoButton.disabled = true;
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
        const nameKey = getNameAudioKey(winnerNameDisplay);
        const victoryKey = gameMode === 4 ? 'ganharam_partida' : 'ganhou_partida';
        if (nameKey) {
            speakText([nameKey, victoryKey].filter(Boolean), true, speechAndAlertCallback);
        } else {
            speakFallback(winnerNameDisplay, () => {
                playAudioSequence([victoryKey], speechAndAlertCallback);
            });
        }
    }, 300);
}

function prepareNextGame(isModeChange = false) {
    scoreNos = 0; scoreEles = 0; prevScoreNos = 0; prevScoreEles = 0;
    isInitialState = true; undoState = null;
    isGameEffectivelyOver = false;
    toggleScoreControls(true);

    // Restaura os botões ao estado normal (desfaz qualquer estado de Mão de 11 / Escurinha)
    toggleScoreControlsSpecific('nos', 'normal');
    toggleScoreControlsSpecific('eles', 'normal');
    document.getElementById('decisao-nos')?.classList.add('hidden');
    document.getElementById('decisao-eles')?.classList.add('hidden');

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
        if (!isModeChange) speakText('jogo_reiniciado');
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
        speakText('placar_zerado');
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
function toggleSound() { setSound(!isSoundOn); if (isSoundOn) speakText('som_ativado', true); }

// --- Funcionalidades Adicionais ---
function toggleGameMode() {
    if (confirm(`Deseja mudar para o modo de ${gameMode === 4 ? 2 : 4} jogadores?\nO jogo atual e o placar de partidas ganhas serão reiniciados.`)) {
        gameMode = (gameMode === 4 ? 2 : 4);
        saveGameMode();
        updateUIBasedOnMode();
        resetCurrentGame(true);
        const modeKey = gameMode === 2 ? 'modo_alterado_2' : 'modo_alterado_4';
        speakText(modeKey, true);
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
    speakText('historico_pronto', true);
}

// --- Event Listeners ---
function addEventListeners() {
    // Controle do Modal de Regras
    const rulesToggleBtn = document.getElementById('rules-toggle-btn');
    const rulesModal = document.getElementById('rulesModal');
    const closeRulesBtn = document.getElementById('closeRulesBtn');
    const closeRulesBtnBottom = document.getElementById('closeRulesBtnBottom');

    function openRules() { rulesModal.classList.remove('hidden'); }
    function closeRules() { rulesModal.classList.add('hidden'); }

    rulesToggleBtn?.addEventListener('click', openRules);
    closeRulesBtn?.addEventListener('click', closeRules);
    closeRulesBtnBottom?.addEventListener('click', closeRules);
    rulesModal?.addEventListener('click', (e) => {
        if (e.target === rulesModal) closeRules();
    });

    // Botão de nome personalizado de equipe
    document.getElementById('customTeamNameBtn')?.addEventListener('click', () => {
        const input = document.getElementById('customTeamNameInput');
        const name = input?.value?.trim();
        if (name) selectTeamName(name);
    });

    document.querySelector('.teams').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (btn?.dataset.team && btn.dataset.amount) changeScore(btn.dataset.team, parseInt(btn.dataset.amount), btn.dataset.speak);
        // Botões Novod da Mao de 11
        if (btn?.classList.contains('btn-aceitar')) {
            const teamInfo = btn.dataset.team;
            document.getElementById(`decisao-${teamInfo}`).classList.add('hidden');

            // Se aceitou, libera APENAS o botão de +3 pontos p/ AMBAS equipes!
            toggleScoreControlsSpecific('nos', 'aceitou11');
            toggleScoreControlsSpecific('eles', 'aceitou11');

            speakText('jogo_aceito');
        }
        if (btn?.classList.contains('btn-recusar')) {
            const teamInfo = btn.dataset.team;
            const inimigo = teamInfo === 'nos' ? 'eles' : 'nos';
            document.getElementById(`decisao-${teamInfo}`).classList.add('hidden');

            // Restaura os botões de todos p normal na próxima mão temporariamente pro toggle ficar certo
            toggleScoreControlsSpecific('nos', 'normal');
            toggleScoreControlsSpecific('eles', 'normal');

            speakText('correu', true, () => {
                // Aqui removemos o 'ignoreMaoDeOnzeCheck' para false.
                // Como essa equipe correu, a rodada acabou, e a equipe A continuará com 11!
                // Então o changeScore de 1 ponto pro inimigo vai fazer o fluxo analisar a pontuação de novo e armar Mão de 11 de novo na próxima rodada automaticamente!
                changeScore(inimigo, 1, null, false);
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

    // Pré-carrega todos os MP3 estáticos na memória
    preloadStaticAudio();

    loadGameSettings(); setTheme(currentTheme); setSound(isSoundOn);
    loadGameData();

    // Pré-carrega áudios dos nomes já salvos
    preloadPlayerNameAudios();
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
