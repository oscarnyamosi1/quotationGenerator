import Dexie, { type Table } from 'dexie';
import { Contract, ContractTemplate } from '../types';

export class AppDatabase extends Dexie {
  contracts!: Table<Contract, string>;
  templates!: Table<ContractTemplate, string>;

  constructor() {
    super('BenkizAppDB');
    this.version(1).stores({
      contracts: 'id, createdAt, status, quotationNumber',
      templates: 'id, name'
    });
  }
}

export const db = new AppDatabase();
