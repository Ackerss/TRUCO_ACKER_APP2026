// Cloudflare Worker - edge-tts proxy para gerar áudio de nomes dinâmicos
// Deploy: https://dash.cloudflare.com > Workers & Pages > Create > Hello World > colar este código
// Endpoint: GET /?text=NomeDoJogador

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const text = url.searchParams.get('text');

        // CORS headers
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
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Limitar tamanho do texto (segurança)
        if (text.length > 100) {
            return new Response(JSON.stringify({ error: 'Texto muito longo (máx 100 caracteres).' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        try {
            const voice = 'pt-BR-FranciscaNeural';
            const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;

            const edgeTtsUrl = `https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

            // Use the free edge-tts websocket approach
            const audioBuffer = await generateEdgeTTS(text, voice);

            return new Response(audioBuffer, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'audio/mpeg',
                    'Cache-Control': 'public, max-age=86400',
                }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Falha ao gerar áudio.', details: err.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

function escapeXml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function generateEdgeTTS(text, voice) {
    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${crypto.randomUUID().replace(/-/g, '')}`;

    const dateStr = new Date().toUTCString();

    const configMessage =
        `X-Timestamp:${dateStr}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;

    const ssmlMessage =
        `X-RequestId:${crypto.randomUUID().replace(/-/g, '')}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${dateStr}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='pt-BR'>` +
        `<voice name='${voice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${escapeXml(text)}</prosody></voice></speak>`;

    // Use WebSocket to connect to Edge TTS service
    const ws = new WebSocket(wsUrl, {
        headers: {
            'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    return new Promise((resolve, reject) => {
        const audioChunks = [];
        let isAudioStarted = false;

        ws.addEventListener('open', () => {
            ws.send(configMessage);
            ws.send(ssmlMessage);
        });

        ws.addEventListener('message', (event) => {
            if (typeof event.data === 'string') {
                if (event.data.includes('Path:turn.end')) {
                    ws.close();
                }
            } else {
                // Binary data = audio
                const data = event.data;
                if (data instanceof ArrayBuffer) {
                    const view = new DataView(data);
                    // Skip header (first 2 bytes = header length)
                    const headerLen = view.getUint16(0);
                    const audioData = data.slice(headerLen + 2);
                    if (audioData.byteLength > 0) {
                        audioChunks.push(audioData);
                    }
                }
            }
        });

        ws.addEventListener('close', () => {
            if (audioChunks.length > 0) {
                const totalLen = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
                const result = new Uint8Array(totalLen);
                let offset = 0;
                for (const chunk of audioChunks) {
                    result.set(new Uint8Array(chunk), offset);
                    offset += chunk.byteLength;
                }
                resolve(result.buffer);
            } else {
                reject(new Error('Nenhum dado de áudio recebido.'));
            }
        });

        ws.addEventListener('error', (err) => {
            reject(new Error(`WebSocket error: ${err.message || 'unknown'}`));
        });

        // Timeout de 10 segundos
        setTimeout(() => {
            ws.close();
            reject(new Error('Timeout ao gerar áudio.'));
        }, 10000);
    });
}
