/*
 * This file is a part of signNow SDK API client.
 *
 * (с) Copyright © 2011-present airSlate Inc. (https://www.signnow.com)
 *
 * For more details on copyright, see LICENSE.md file
 * that was distributed with this source code.
 */

import { ApiRequest } from '../../core/apiRequest';

export interface WebhookAttributes {
  callback: string;
  use_tls_12?: boolean;
  integration_id?: string;
  docid_queryparam?: boolean;
  headers?: Record<string, string | number | boolean>;
  secret_key?: string;
  delay?: number;
  retry_count?: number;
  delete_access_token?: boolean;
  include_metadata?: boolean;
}

export interface WebhookSubscriptionRequest {
  event: string;
  entity_id: string;
  action: 'callback';
  attributes: WebhookAttributes;
}

export class SubscriptionPost extends ApiRequest<WebhookSubscriptionRequest> {
  constructor(request: WebhookSubscriptionRequest) {
    super();
    this.method = 'POST';
    this.url = '/api/v2/events';
    this.payload = request;
  }
}
