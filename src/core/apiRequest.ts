export abstract class ApiRequest<T> {
  protected method: string = 'GET';
  protected url: string = '';
  protected payload?: T;
  protected headers: Record<string, string> = {};
  protected queryParams: Record<string, string> = {};

  public getMethod(): string {
    return this.method;
  }

  public getUrl(): string {
    return this.url;
  }

  public getPayload(): T | undefined {
    return this.payload;
  }

  public getHeaders(): Record<string, string> {
    return this.headers;
  }

  public getQueryParams(): Record<string, string> {
    return this.queryParams;
  }

  public getAuthMethod(): string {
    return 'Bearer';
  }

  public getContentType(): string {
    return 'application/json';
  }
} 