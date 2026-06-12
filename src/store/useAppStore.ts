import { create } from 'zustand';
import { Contract, ContractTemplate, CompanySettings } from '../types';
import { db } from '../db/database';

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "Benkiz Kitchen & Bites",
  address: "Kisii Town",
  phone: "+254707091550",
  email: "benkizkitchen@gmail.com",
  logo: null,
  watermark: null,
  mpesaPaybill: "542542",
  mpesaAccount: "28812",
  primaryColor: "#5a3e2b"
};

const DEFAULT_TERMS = [
  "Deposit is non-refundable once booking is confirmed",
  "Final guest count must be confirmed at least 3 days before the event",
  "Additional services will incur extra charges",
  "Client must ensure venue access and utilities",
  "Company not liable for external delays"
];

interface AppState {
  contracts: Contract[];
  templates: ContractTemplate[];
  settings: CompanySettings;
  currentContract: Contract | null;
  isLoading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  saveSettings: (settings: CompanySettings) => void;
  
  // Contract Actions
  addContract: (contract: Contract) => Promise<void>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  setCurrentContract: (contract: Contract | null) => void;

  // Template Actions
  addTemplate: (template: ContractTemplate) => Promise<void>;
  updateTemplate: (id: string, template: Partial<ContractTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  contracts: [],
  templates: [],
  settings: (() => {
    try {
      const stored = localStorage.getItem('benkiz_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  })(),
  currentContract: null,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const templates = await db.templates.toArray();
      const contracts = await db.contracts.orderBy('createdAt').reverse().toArray();

      if (templates.length === 0) {
        const defaultTemplate: ContractTemplate = {
          id: crypto.randomUUID(),
          name: "Benkiz Standard",
          html: "",
          css: "",
          logo: null,
          watermark: null
        };
        await db.templates.add(defaultTemplate);
        templates.push(defaultTemplate);
      }

      set({ contracts, templates, isLoading: false });
    } catch (error) {
      console.error("Failed to load data from Dexie", error);
      set({ isLoading: false });
    }
  },

  saveSettings: (settings) => {
    localStorage.setItem('benkiz_settings', JSON.stringify(settings));
    set({ settings });
  },

  addContract: async (contract) => {
    await db.contracts.add(contract);
    set(state => ({
      contracts: [contract, ...state.contracts]
    }));
  },

  updateContract: async (id, data) => {
    await db.contracts.update(id, data);
    set(state => ({
      contracts: state.contracts.map(c => c.id === id ? { ...c, ...data } : c),
      currentContract: state.currentContract?.id === id ? { ...state.currentContract, ...data } : state.currentContract
    }));
  },

  deleteContract: async (id) => {
    await db.contracts.delete(id);
    set(state => ({
      contracts: state.contracts.filter(c => c.id !== id)
    }));
  },

  setCurrentContract: (contract) => {
    set({ currentContract: contract });
  },

  addTemplate: async (template) => {
    await db.templates.add(template);
    set(state => ({ templates: [...state.templates, template] }));
  },

  updateTemplate: async (id, data) => {
    await db.templates.update(id, data);
    set(state => ({
      templates: state.templates.map(t => t.id === id ? { ...t, ...data } : t)
    }));
  },

  deleteTemplate: async (id) => {
    await db.templates.delete(id);
    set(state => ({
      templates: state.templates.filter(t => t.id !== id)
    }));
  }
}));
