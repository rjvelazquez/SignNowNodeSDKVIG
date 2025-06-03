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

export class CloneTemplatePost implements BaseClass {
  private queryParams: Record<string, string> = {};

  constructor(
    private templateId: string,
    private documentName: string
  ) {}

  public getPayload(): Record<string, string> {
    return {
      document_name: this.documentName
    };
  }

  public getMethod(): string {
    return HttpMethod.POST;
  }

  public getUrl(): string {
    return '/template/{template_id}/copy';
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

  public getUriParams(): { template_id: string } {
    return {
      template_id: this.templateId
    };
  }
}
