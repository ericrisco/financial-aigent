"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const os_1 = __importDefault(require("os"));
const fs_1 = require("fs");
const path_1 = require("path");
class HealthService {
    constructor() {
        this.startTime = Date.now();
        this.version = this.getPackageVersion();
    }
    getPackageVersion() {
        try {
            const packageJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../../package.json'), 'utf8'));
            return packageJson.version;
        }
        catch (_a) {
            return '1.0.0';
        }
    }
    calculateCpuUsage() {
        const cpus = os_1.default.cpus();
        const cpu = cpus[0];
        const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        const system = cpu.times.sys / total * 100;
        const user = cpu.times.user / total * 100;
        return {
            system,
            user,
            total: system + user,
            percentage: process.cpuUsage().system / 1000000
        };
    }
    getHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            const processMemory = process.memoryUsage();
            const systemMemory = {
                total: os_1.default.totalmem(),
                free: os_1.default.freemem(),
                used: os_1.default.totalmem() - os_1.default.freemem(),
                percentage: ((os_1.default.totalmem() - os_1.default.freemem()) / os_1.default.totalmem()) * 100
            };
            const cpuInfo = os_1.default.cpus()[0];
            const processMemoryPercentage = (processMemory.heapUsed / processMemory.heapTotal) * 100;
            const health = {
                status: processMemoryPercentage > 90 || systemMemory.percentage > 90 ? 'DEGRADED' : 'UP',
                version: this.version,
                timestamp: new Date().toISOString(),
                uptime: (Date.now() - this.startTime) / 1000,
                process: {
                    pid: process.pid,
                    memory: {
                        used: processMemory.heapUsed,
                        total: processMemory.heapTotal,
                        free: processMemory.heapTotal - processMemory.heapUsed,
                        heapTotal: processMemory.heapTotal,
                        heapUsed: processMemory.heapUsed,
                        external: processMemory.external,
                        percentage: processMemoryPercentage
                    },
                    cpu: this.calculateCpuUsage()
                },
                system: {
                    platform: process.platform,
                    arch: process.arch,
                    cpus: {
                        model: cpuInfo.model,
                        speed: cpuInfo.speed,
                        cores: os_1.default.cpus().length,
                        loadAvg: os_1.default.loadavg()
                    },
                    memory: systemMemory
                }
            };
            return health;
        });
    }
}
exports.HealthService = HealthService;
