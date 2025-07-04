/*
 * This file is a part of signNow SDK API client.
 *
 * (с) Copyright © 2011-present airSlate Inc. (https://www.signnow.com)
 *
 * For more details on copyright, see LICENSE.md file
 * that was distributed with this source code.
 */

import { BaseClass } from '../../../types/baseClass';
import { HttpMethod } from '../../../core/contstants';
import { HttpAuthType } from '../../../core/contstants';

export interface Signer {
  email: string;
  role_id: string;
  role: string;
  order: number;
  prefill_signature_name?: string;
  force_new_signature?: number;
  reassign?: string;
  decline_by_signature?: string;
  reminder?: number;
  expiration_days?: number;
  authentication_type?: string;
  password?: string;
  subject?: string;
  message?: string;
}

export class FreeFormInvitePost implements BaseClass {
  private queryParams: Record<string, string> = {};

  constructor(
    private documentId: string,
    private to: Signer[],
    private from: string
  ) {}

  public getPayload(): Record<string, unknown> {
    return {
      to: this.to,
      from: this.from
    };
  }

  public getMethod(): string {
    return HttpMethod.POST;
  }

  public getUrl(): string {
    return '/document/{document_id}/invite';
  }

  public getAuthMethod(): string {
    return HttpAuthType.BEARER;
  }

  public getContentType(): string {
    return 'application/json';
  }

  public getQueryParams(): Record<string, string> {
    return this.queryParams;
  }

  public getUriParams(): { document_id: string } {
    return {
      document_id: this.documentId
    };
  }
}
