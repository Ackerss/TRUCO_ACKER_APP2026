const fs = require('fs');

try {
    let css = fs.readFileSync('styles.css', 'utf-8');

    // Replace fonts and body background
    css = css.replace('font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";',
        "font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;");
    css = css.replace('background-color: var(--bg-color);', 'background: var(--bg-gradient, var(--bg-color));');
    css = css.replace('-webkit-tap-highlight-color: transparent;', '-webkit-tap-highlight-color: transparent;\\n    touch-action: manipulation;');

    // Make scoreboard glassmorphism
    css = css.replace(`.scoreboard {
    background-color: var(--scoreboard-bg); padding: 15px 20px; border-radius: 12px;
    box-shadow: 0 4px 15px var(--shadow-color-darker); text-align: center;
    width: 100%; max-width: 500px; box-sizing: border-box;
    border: 1px solid var(--border-color); position: relative;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}`, `.scoreboard {
    background-color: var(--scoreboard-bg); 
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 15px 20px; border-radius: 20px;
    box-shadow: 0 8px 32px var(--shadow-color-darkest); text-align: center;
    width: 100%; max-width: 500px; box-sizing: border-box;
    border: 1px solid var(--scoreboard-border, var(--border-color)); position: relative;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}`);

    // Modify Dark Theme variables
    const dark_theme_replacements = {
        '--bg-color: #1f1f1f;': '--bg-color: #0f111a;\\n    --bg-gradient: linear-gradient(135deg, #0a0b10 0%, #1a1d2e 100%);',
        '--scoreboard-bg: #2d2d2d;': '--scoreboard-bg: rgba(30, 36, 51, 0.45);\\n    --scoreboard-border: rgba(255, 255, 255, 0.08);',
        '--section-bg: #3a3a3a;': '--section-bg: rgba(255, 255, 255, 0.05);',
        '--section-bg-alt: #3f3f3f;': '--section-bg-alt: rgba(255, 255, 255, 0.03);',
        '--section-bg-hist: #333;': '--section-bg-hist: rgba(0, 0, 0, 0.2);',
        '--border-color: #444;': '--border-color: rgba(255, 255, 255, 0.1);',
        '--border-color-light: #555;': '--border-color-light: rgba(255, 255, 255, 0.05);',
        '--accent-nos: #69b1ff;': '--accent-nos: #38bdf8;',
        '--accent-eles: #ff8787;': '--accent-eles: #fb7185;',
        '--shadow-color-darker: rgba(0,0,0,0.15);': '--shadow-color-darker: rgba(0,0,0,0.3);',
        '--shadow-color-darkest: rgba(0,0,0,0.2);': '--shadow-color-darkest: rgba(0,0,0,0.4);'
    };

    for (const [oldVal, newVal] of Object.entries(dark_theme_replacements)) {
        css = css.replace(oldVal, newVal.replace(/\\\\n/g, '\\n'));
    }

    const light_theme_replacements = {
        '--bg-color: #f0f0f0;': '--bg-color: #f8fafc;\\n    --bg-gradient: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);',
        '--scoreboard-bg: #ffffff;': '--scoreboard-bg: rgba(255, 255, 255, 0.6);\\n    --scoreboard-border: rgba(255, 255, 255, 0.4);',
        '--section-bg: #f8f9fa;': '--section-bg: rgba(255, 255, 255, 0.5);',
        '--section-bg-alt: #e9ecef;': '--section-bg-alt: rgba(255, 255, 255, 0.3);',
        '--section-bg-hist: #f1f3f5;': '--section-bg-hist: rgba(0, 0, 0, 0.03);',
        '--border-color: #dee2e6;': '--border-color: rgba(0, 0, 0, 0.08);',
        '--border-color-light: #ced4da;': '--border-color-light: rgba(0, 0, 0, 0.04);',
        '--accent-nos: #007bff;': '--accent-nos: #0284c7;',
        '--accent-eles: #dc3545;': '--accent-eles: #e11d48;',
        '--shadow-color-darker: rgba(0,0,0,0.1);': '--shadow-color-darker: rgba(0,0,0,0.08);',
        '--shadow-color-darkest: rgba(0,0,0,0.12);': '--shadow-color-darkest: rgba(0,0,0,0.12);'
    };

    for (const [oldVal, newVal] of Object.entries(light_theme_replacements)) {
        css = css.replace(oldVal, newVal.replace(/\\\\n/g, '\\n'));
    }

    // Add pulse animation class to css
    const animation_css = \`
/* --- Animações Premium --- */
@keyframes pop-score {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); text-shadow: 0 0 15px currentColor; }
    100% { transform: scale(1); }
}
.score-animate {
    animation: pop-score 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes flash-truco-nos {
    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
    50% { box-shadow: 0 0 30px 10px rgba(56, 189, 248, 0.4); border-color: rgba(56, 189, 248, 0.8); }
    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
}

@keyframes flash-truco-eles {
    0% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
    50% { box-shadow: 0 0 30px 10px rgba(251, 113, 133, 0.4); border-color: rgba(251, 113, 133, 0.8); }
    100% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
}

.flash-animate-nos {
    animation: flash-truco-nos 0.6s ease-out;
}

.flash-animate-eles {
    animation: flash-truco-eles 0.6s ease-out;
}
\`;

    if (!css.includes("/* --- Animações Premium --- */")) {
        css += animation_css;
    }

    fs.writeFileSync('styles.css', css, 'utf-8');
    console.log("Updated styles.css with Premium UI variables and animations!");
} catch (e) {
    console.error(e);
}
