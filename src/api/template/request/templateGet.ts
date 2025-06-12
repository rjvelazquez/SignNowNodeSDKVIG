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

export class TemplateGet implements BaseClass {
  private queryParams: Record<string, string> = {};

  constructor(private templateId?: string) {}

  public getPayload(): Record<string, string> {
    return {};
  }

  public getMethod(): string {
    return HttpMethod.GET;
  }

  public getUrl(): string {
    return this.templateId 
      ? `/v2/templates/${this.templateId}/copies`
      : '/user/documentsv2';
  }

  public getAuthMethod(): string {
    return HttpAuthType.BEARER;
  }

  public getContentType(): string {
    return 'application/json';
  }

  public getQueryParams(): Record<string, string> {
    return {
      ...this.queryParams,
      filter_by_template: 'true'
    };
  }

  public getUriParams(): { template_id?: string } {
    return this.templateId ? { template_id: this.templateId } : {};
  }
} 