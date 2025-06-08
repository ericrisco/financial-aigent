"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const config_1 = require("./config/config");
const error_middleware_1 = require("./middlewares/error.middleware");
const health_1 = __importDefault(require("./routes/health"));
const websockets_1 = require("./websockets");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const server = new http_1.Server(app);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origins,
    methods: config_1.config.cors.methods,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_rate_limit_1.default)(config_1.config.rateLimiter));
app.use(`${config_1.config.api.prefix}/health`, health_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running!' });
});
(0, websockets_1.setupWebSocket)(server);
app.use(error_middleware_1.errorHandler);
server.listen(config_1.config.port, () => {
    logger_1.default.info(`Server is running on port ${config_1.config.port} in ${config_1.config.env} mode`);
});
