import { BaseClass } from '../../../types/baseClass';
import { HttpMethod } from '../../../core/contstants';
import { HttpAuthType } from '../../../core/contstants';

interface Signer {
  order: number;
  email: string;
  role: string;
  nombre: string;
}

interface Document {
  filename: string;
  contentBase64: string;
}

export class SalesforceSignatureRequest implements BaseClass {
  private queryParams: Record<string, string> = {};

  constructor(
    private recordId: string,
    private document: Document,
    private expirationDate: string,
    private signers: Signer[]
  ) {}

  public getPayload(): Record<string, unknown> {
    return {
      recordId: this.recordId,
      document: this.document,
      expirationDate: this.expirationDate,
      signers: this.signers
    };
  }

  public getMethod(): string {
    return HttpMethod.POST;
  }

  public getUrl(): string {
    return '/v1/signature-requests';
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

  public getUriParams(): null {
    return null;
  }
} 