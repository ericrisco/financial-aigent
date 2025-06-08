"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const config_1 = require("../config/config");
const TEST_QUERIES = [
    'How does the JavaScript event loop work?',
    'What are JavaScript Promises and how do they work?',
    'Explain React\'s Virtual DOM and reconciliation process',
    'What is TypeScript and how does it enhance JavaScript?'
];
const wsUrl = `ws://localhost:${config_1.config.port}${config_1.config.ws.path}`;
console.log(`\n🔌 Conectando a ${wsUrl}\n`);
const ws = new ws_1.default(wsUrl);
ws.on('open', () => {
    console.log('✅ Conexión establecida\n');
    const randomQuery = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
    // Formato correcto del mensaje de inicio
    const startMessage = {
        action: 'start',
        query: randomQuery
    };
    console.log(`📤 Enviando mensaje de inicio:`);
    console.log(JSON.stringify(startMessage, null, 2));
    console.log();
    ws.send(JSON.stringify(startMessage));
});
ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    if (message.error) {
        console.log(`❌ Error: ${message.error}`);
        return;
    }
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    const progressBar = createProgressBar(message.progress);
    console.log(`[${timestamp}] ${progressBar} ${message.progress}%`);
    console.log(`📝 Paso: ${message.step}`);
    console.log(`📄 Detalles: ${message.details}\n`);
    if (message.step === 'complete') {
        console.log('✅ Investigación completada');
        console.log('Documento final (primeras 10 líneas):');
        if (message.completion) {
            console.log(message.completion.split('\n').slice(0, 10).join('\n'));
            console.log('...\n');
        }
        ws.close();
        process.exit(0);
    }
});
ws.on('error', (error) => {
    console.error('❌ Error de WebSocket:', error);
    process.exit(1);
});
function createProgressBar(progress) {
    const width = 30;
    const filled = Math.round(width * (progress / 100));
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
