// Cloudflare Worker - Proxy TTS Francisca (edge-tts)
// Recebe: GET /?text=NomeDoJogador
// Retorna: MP3 com voz pt-BR-FranciscaNeural

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const WINDOWS_FILE_TIME_EPOCH = 11644473600n;
const VOICE = 'pt-BR-FranciscaNeural';

function escapeXml(text) {
    return text.replace(/[<>&"']/g, c => {
        switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '"': return '&quot;'; case "'": return '&apos;'; default: return c; }
    });
}

function generateSecMsGecToken() {
    const ticks = BigInt(Math.floor(Date.now() / 1000) + Number(WINDOWS_FILE_TIME_EPOCH)) * 10000000n;
    const roundedTicks = ticks - (ticks % 3000000000n);
    const strToHash = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
    // Cloudflare Workers suportam crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(strToHash);
    return crypto.subtle.digest('SHA-256', data).then(buf => {
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    });
}

function generateRequestId() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const text = url.searchParams.get('text');

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (!text || text.trim() === '') {
            return new Response(JSON.stringify({ error: 'Parâmetro "text" é obrigatório.' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (text.length > 100) {
            return new Response(JSON.stringify({ error: 'Texto muito longo (máx 100 chars).' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const secToken = await generateSecMsGecToken();
            const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secToken}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`;

            // Cloudflare Workers suportam WebSocket fetch
            const wsResp = await fetch(wsUrl, {
                headers: {
                    'Upgrade': 'websocket',
                    'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
                    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM_FULL_VERSION.split('.')[0]}.0.0.0`,
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache',
                }
            });

            const ws = wsResp.webSocket;
            if (!ws) {
                return new Response(JSON.stringify({ error: 'Falha ao conectar WebSocket.' }), {
                    status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            ws.accept();

            const audioChunks = [];
            const reqId = generateRequestId();

            return new Promise((resolve) => {
                ws.addEventListener('message', (event) => {
                    if (event.data instanceof ArrayBuffer) {
                        const view = new Uint8Array(event.data);
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
                    } else if (typeof event.data === 'string') {
                        if (event.data.includes('Path:turn.end')) {
                            ws.close();
                            if (audioChunks.length > 0) {
                                const totalLen = audioChunks.reduce((a, c) => a + c.length, 0);
                                const merged = new Uint8Array(totalLen);
                                let offset = 0;
                                for (const chunk of audioChunks) { merged.set(chunk, offset); offset += chunk.length; }
                                resolve(new Response(merged, {
                                    headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800' }
                                }));
                            } else {
                                resolve(new Response(JSON.stringify({ error: 'Áudio vazio.' }), {
                                    status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                                }));
                            }
                        }
                    }
                });

                // Config
                ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);

                // SSML
                ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${VOICE}"><prosody rate="default" pitch="default" volume="default">${escapeXml(text)}</prosody></voice></speak>`);

                // Timeout 10s
                setTimeout(() => {
                    ws.close();
                    resolve(new Response(JSON.stringify({ error: 'Timeout.' }), {
                        status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }));
                }, 10000);
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Erro interno.', details: err.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
