export interface WebhookEvent {
  event: string;
  entity_id: string;
  timestamp: string;
  data: {
    object: {
      id: string;
      document_name: string;
      status: string;
      created_at: string;
      updated_at: string;
      [key: string]: any;
    };
    account_id: string;
  };
}

export interface WebhookSubscription {
  event: string;
  entityId: string;
  callbackUrl: string;
  action?: string;
  secretKey?: string;
} 