import { Injectable } from '@nestjs/common';
import Axios, { AxiosInstance } from 'axios';

@Injectable()
export class TelegramApiService {
  private readonly telegramApi: AxiosInstance;

  constructor() {
    this.telegramApi = Axios.create({ baseURL: 'https://api.telegram.org' });
  }

  async sendTelegramMessage(data: Record<string, any>) {
    if (!data || !process.env.TELEGRAM_TOKEN || !process.env.CHAT_ID) return;
    data = this.objMessNewLine(data);
    try {
      await this.telegramApi.post(`/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: process.env.CHAT_ID,
        text: data,
      });
    } catch (err) {
      console.log('Send telegram message failed:', err.message);
    }
  }

  objMessNewLine(obj: any, tabLine = '') {
    if (obj === 0 || obj === false) return String(obj);
    if (!obj) return '';
    if (typeof obj !== 'object') return tabLine + obj;
    if (obj.constructor === Array) {
      return `${tabLine}[\n` + obj.map((k) => this.objMessNewLine(k, tabLine + ' ')).join(',\n') + `\n${tabLine}]`;
    }
    return (
      `${tabLine}{\n` +
      Object.keys(obj)
        .map((k) => `${tabLine}${k} : ` + this.objMessNewLine(obj[k], tabLine + ' ').trim())
        .join(',\n') +
      `\n${tabLine}}`
    );
  }
}
