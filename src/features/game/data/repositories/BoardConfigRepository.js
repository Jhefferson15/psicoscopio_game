import { BoardConfig } from '../../domain/entities/BoardConfig';
import { getDefaultBoardConfig, getDevTestBoardConfig } from './boardRepository';

const STORAGE_KEY = 'psicoscopio_board_configs';
const ACTIVE_CONFIG_KEY = 'psicoscopio_active_board_config';

export class BoardConfigRepository {
  static getDefaultConfig() {
    return getDefaultBoardConfig();
  }

  static getDevTestBoardConfig() {
    return getDevTestBoardConfig();
  }

  static getSavedConfigs() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(c => BoardConfig.fromJSON(c));
    } catch (e) {
      console.error("Erro ao carregar configurações de tabuleiro:", e);
      return [];
    }
  }

  static saveConfigs(configs) {
    const toSave = configs
      .filter(c => c.id !== 'default' && c.id !== 'teste_dev')
      .map(c => (typeof c.toJSON === 'function' ? c.toJSON() : c));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  static getActiveConfigId() {
    return localStorage.getItem(ACTIVE_CONFIG_KEY) || 'default';
  }

  static setActiveConfigId(id) {
    localStorage.setItem(ACTIVE_CONFIG_KEY, id);
  }

  static saveConfig(config) {
    const configs = this.getSavedConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    this.saveConfigs(configs);
  }

  static deleteConfig(id) {
    if (id === 'default' || id === 'teste_dev') return;
    const configs = this.getSavedConfigs();
    const filtered = configs.filter(c => c.id !== id);
    this.saveConfigs(filtered);
    if (this.getActiveConfigId() === id) {
      this.setActiveConfigId('default');
    }
  }
}
