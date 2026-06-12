declare module 'html2pdf.js';

export interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null; // base64
  watermark: string | null; // base64
  mpesaPaybill: string;
  mpesaAccount: string;
  primaryColor: string;
}

export interface Contract {
  id: string; // uuid
  createdAt: Date;
  updatedAt: Date;
  quotationNumber: number;
  status: 'draft' | 'confirmed' | 'completed';
  client: {
    name: string;
    phone: string;
    address: string;
    eventType: string;
    eventDate: string;
    venue: string;
    guestCount: number;
  };
  menu: Array<{ title: string; items: string[] }>;
  costs: {
    shoppingCost: number;
    transportCost: number;
    labourCost: number;
    equipmentCost: number;
    cateringFee: number;
    extraCost: number;
    total: number;
  };
  payment: {
    depositPercent: number;
    balancePercent: number;
    mpesaPaybill: string;
    mpesaAccount: string;
  };
  terms: string[];
  signatures: {
    clientName: string;
    companyRepresentative: string;
  };
  templateId: string;
  pdfBlob?: string; // base64
}

export interface ContractTemplate {
  id: string;
  name: string;
  html: string;
  css: string;
  logo: string | null;
  watermark: string | null;
}
