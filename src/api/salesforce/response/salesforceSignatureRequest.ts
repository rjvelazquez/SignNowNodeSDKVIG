export interface SalesforceSignatureResponse {
  success: boolean;
  documentId: string;
  signingLinks: {
    [key: string]: string; // email -> signing link
  };
  error?: {
    code: string;
    message: string;
  };
} 