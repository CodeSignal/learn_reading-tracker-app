import { Injectable } from '@nestjs/common';

export interface RequestLog {
  method: string;
  url: string;
  status: number;
  ms: number;
  at: string;
}

@Injectable()
export class LogsService {
  private buffer: RequestLog[] = [];
  private readonly max = 100;

  add(entry: RequestLog) {
    this.buffer.push(entry);
    if (this.buffer.length > this.max) this.buffer.shift();
  }

  list(limit = 15) {
    return this.buffer.slice(-limit).reverse();
  }
}
