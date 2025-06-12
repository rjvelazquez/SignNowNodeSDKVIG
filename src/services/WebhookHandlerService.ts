import express from 'express';
import crypto from 'crypto';
import { WebhookEvent } from '../types/webhook';

export class WebhookHandlerService {
  private app: express.Application;
  private secretKey: string;

  constructor(secretKey: string) {
    this.app = express();
    this.secretKey = secretKey;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.post('/webhook', this.handleWebhook.bind(this));
  }

  private verifySignature(payload: any, signature: string): boolean {
    try {
      const hmac = crypto.createHmac('sha256', this.secretKey);
      const digest = hmac.update(JSON.stringify(payload)).digest('hex');
      return signature === digest;
    } catch (error) {
      console.error('❌ Error al verificar la firma:', error);
      return false;
    }
  }

  private async handleWebhook(req: express.Request, res: express.Response): Promise<void> {
    try {
      const signature = req.headers['x-signnow-signature'];
      
      if (!signature || typeof signature !== 'string') {
        console.error('❌ Firma no encontrada en los headers');
        res.status(401).send('Firma no encontrada');
        return;
      }

      if (!this.verifySignature(req.body, signature)) {
        console.error('❌ Firma inválida');
        res.status(401).send('Firma inválida');
        return;
      }

      const event: WebhookEvent = req.body;
      console.log('📨 Evento recibido:', event.event);

      // Procesar el evento según su tipo
      switch (event.event) {
        case 'document.complete':
          await this.handleDocumentComplete(event);
          break;
        case 'document.signed':
          await this.handleDocumentSigned(event);
          break;
        case 'document.viewed':
          await this.handleDocumentViewed(event);
          break;
        case 'document.declined':
          await this.handleDocumentDeclined(event);
          break;
        case 'field.update':
          await this.handleFieldUpdate(event);
          break;
        default:
          console.log('⚠️ Evento no manejado:', event.event);
      }

      // Responder rápidamente con 200
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Error al procesar webhook:', error);
      res.status(500).send('Error interno del servidor');
    }
  }

  private async handleDocumentComplete(event: WebhookEvent): Promise<void> {
    console.log('✅ Documento completado:', event.data);
    // Implementa tu lógica aquí
  }

  private async handleDocumentSigned(event: WebhookEvent): Promise<void> {
    console.log('✍️ Documento firmado:', event.data);
    // Implementa tu lógica aquí
  }

  private async handleDocumentViewed(event: WebhookEvent): Promise<void> {
    console.log('👁️ Documento visto:', event.data);
    // Implementa tu lógica aquí
  }

  private async handleDocumentDeclined(event: WebhookEvent): Promise<void> {
    console.log('❌ Documento rechazado:', event.data);
    // Implementa tu lógica aquí
  }

  private async handleFieldUpdate(event: WebhookEvent): Promise<void> {
    console.log('📝 Campo actualizado:', event.data);
    // Implementa tu lógica aquí
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Servidor webhook iniciado en el puerto ${port}`);
    });
  }
} 