import express from 'express';
import crypto from 'crypto';
import { WebhookEvent } from '../types/webhook';

// Extender el tipo Request para incluir rawBody
interface RequestWithRawBody extends express.Request {
  rawBody: Buffer;
}

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

  private verifySignature(req: RequestWithRawBody, signature: string): boolean {
    try {
      // Usar el rawBody y base64 como requiere SignNow
      const hmac = crypto.createHmac('sha256', this.secretKey);
      const digest = hmac.update(req.rawBody).digest('base64');
      return signature === digest;
    } catch (error) {
      console.error('❌ Error al verificar la firma:', error);
      return false;
    }
  }

  private async handleWebhook(req: RequestWithRawBody, res: express.Response): Promise<void> {
    try {
      // Imprimir todo el request para depuración
      console.log('--- Webhook recibido ---');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('------------------------');

      const signature = req.headers['x-signnow-signature'];
      
      if (!signature || typeof signature !== 'string') {
        console.error('❌ Firma no encontrada en los headers');
        res.status(401).send('Firma no encontrada');
        return;
      }

      if (!this.verifySignature(req, signature)) {
        console.error('❌ Firma inválida');
        res.status(401).send('Firma inválida');
        return;
      }

      // Obtener el tipo de evento desde meta.event
      const eventType = req.body.meta?.event;
      console.log('📨 Evento recibido:', eventType);

      // Procesar el evento según su tipo
      switch (eventType) {
        case 'user.document.complete':
          await this.handleDocumentComplete(req.body);
          break;
        case 'user.document.signed':
          await this.handleDocumentSigned(req.body);
          break;
        case 'user.document.viewed':
          await this.handleDocumentViewed(req.body);
          break;
        case 'user.document.declined':
          await this.handleDocumentDeclined(req.body);
          break;
        case 'user.document.field.update':
          await this.handleFieldUpdate(req.body);
          break;
        case 'user.document.fieldinvite.create':
          await this.handleFieldInviteCreate(req.body);
          break;
        case 'user.document.fieldinvite.sent':
          await this.handleFieldInviteSent(req.body);
          break;
        case 'user.document.fieldinvite.accept':
          await this.handleFieldInviteAccept(req.body);
          break;
        case 'user.document.fieldinvite.decline':
          await this.handleFieldInviteDecline(req.body);
          break;
        case 'user.document.fieldinvite.revoke':
          await this.handleFieldInviteRevoke(req.body);
          break;
        case 'user.document.fieldinvite.resend':
          await this.handleFieldInviteResend(req.body);
          break;
        case 'user.template.copy':
          await this.handleTemplateCopy(req.body);
          break;
        case 'user.template.delete':
          await this.handleTemplateDelete(req.body);
          break;
        case 'user.template.update':
          await this.handleTemplateUpdate(req.body);
          break;
        case 'user.document.freeform.resend':
          await this.handleFreeformResend(req.body);
          break;
        case 'user.document_group.delete':
          await this.handleDocumentGroupDelete(req.body);
          break;
        case 'user.document_group.create':
          await this.handleDocumentGroupCreate(req.body);
          break;
        case 'user.document_group.invite.consent.declined':
          await this.handleDocumentGroupInviteConsentDeclined(req.body);
          break;
        case 'user.document_group.invite.consent.accepted':
          await this.handleDocumentGroupInviteConsentAccepted(req.body);
          break;
        case 'user.document_group.invite.consent.revoked':
          await this.handleDocumentGroupInviteConsentRevoked(req.body);
          break;
        case 'user.document_group.invite.create':
          await this.handleDocumentGroupInviteCreate(req.body);
          break;
        case 'user.document_group.invite.resend':
          await this.handleDocumentGroupInviteResend(req.body);
          break;
        case 'user.document_group.invite.sent':
          await this.handleDocumentGroupInviteSent(req.body);
          break;
        case 'user.document_group.invite.reassign':
          await this.handleDocumentGroupInviteReassign(req.body);
          break;
        case 'user.document_group.invite.invite.expired':
          await this.handleInviteExpired(req.body);
          break;
        case 'user.document_group.complete':
          await this.handleDocumentGroupComplete(req.body);
          break;
        case 'user.document.fieldinvite.delete':
          await this.handleDocumentFieldInviteDelete(req.body);
          break;
        case 'user.document_group.invite.declined':
          await this.handleDocumentGroupInviteDeclined(req.body);
          break;
        case 'user.document_group.invite.consent.withdrawn':
          await this.handleDocumentGroupInviteConsentWithdrawn(req.body);
          break;
        case 'user.document_group.update':
          await this.handleDocumentGroupUpdate(req.body);
          break;
        case 'user.document_group.invite.consent.agreed':
          await this.handleDocumentGroupInviteConsentAgreed(req.body);
          break;
        case 'user.document_group.invite.signed':
          await this.handleDocumentGroupInviteSigned(req.body);
          break;
        case 'user.document_group.invite.update':
          await this.handleDocumentGroupInviteUpdate(req.body);
          break;
        case 'user.document.freeform.signed':
          await this.handleDocumentFreeformSigned(req.body);
          break;
        case 'user.document_group.freeform.signed':
          await this.handleDocumentGroupFreeformSigned(req.body);
          break;
        case 'user.document_group.freeform.cancel':
          await this.handleDocumentGroupFreeformCancel(req.body);
          break;
        case 'user.document_group.freeform.create':
          await this.handleDocumentGroupFreeformCreate(req.body);
          break;
        case 'user.document_group.invite.authentication.failed':
          await this.handleDocumentGroupInviteAuthenticationFailed(req.body);
          break;
        case 'user.document_group.invite.email.delivery.failed':
          await this.handleDocumentGroupInviteEmailDeliveryFailed(req.body);
          break;
        case 'user.document_group.freeform.resend':
          await this.handleDocumentGroupFreeformResend(req.body);
          break;
        case 'user.document.fieldinvite.resend':
          await this.handleDocumentFieldInviteResend(req.body);
          break;
        case 'user.document.delete':
          await this.handleDocumentDelete(req.body);
          break;
        case 'user.document.open':
          await this.handleDocumentOpen(req.body);
          break;
        case 'user.document.update':
          await this.handleDocumentUpdate(req.body);
          break;
        case 'user.document.fieldinvite.replace':
          await this.handleDocumentFieldInviteReplace(req.body);
          break;
        case 'user.document.fieldinvite.consent.declined':
          await this.handleDocumentFieldInviteConsentDeclined(req.body);
          break;
        case 'user.document.fieldinvite.authentication.failed':
          await this.handleDocumentFieldInviteAuthenticationFailed(req.body);
          break;
        case 'user.document.fieldinvite.signed':
          await this.handleDocumentFieldInviteSigned(req.body);
          break;
        case 'user.document.freeform.create':
          await this.handleDocumentFreeformCreate(req.body);
          break;
        case 'user.document.create':
          await this.handleDocumentCreate(req.body);
          break;
        case 'user.document.fieldinvite.consent.agreed':
          await this.handleDocumentFieldInviteConsentAgreed(req.body);
          break;
        case 'user.document_group.invite.cancel':
          await this.handleDocumentGroupInviteCancel(req.body);
          break;
        case 'user.document_group.open':
          await this.handleDocumentGroupOpen(req.body);
          break;
        case 'user.document.fieldinvite.decline':
          await this.handleDocumentFieldInviteDecline(req.body);
          break;
        case 'user.document.fieldinvite.reassign':
          await this.handleDocumentFieldInviteReassign(req.body);
          break;
        case 'user.document.fieldinvite.email.delivery.failed':
          await this.handleDocumentFieldInviteEmailDeliveryFailed(req.body);
          break;
        case 'user.document.freeform.cancel':
          await this.handleDocumentFreeformCancel(req.body);
          break;
        default:
          console.log('⚠️ Evento no manejado:', eventType);
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

  private async handleFieldInviteCreate(body: any): Promise<void> {
    console.log('Evento: fieldinvite.create', body);
  }

  private async handleFieldInviteSent(body: any): Promise<void> {
    console.log('Evento: fieldinvite.send', body);
  }

  private async handleFieldInviteAccept(body: any): Promise<void> {
    console.log('Evento: fieldinvite.accept', body);
  }

  private async handleFieldInviteDecline(body: any): Promise<void> {
    console.log('Evento: fieldinvite.decline', body);
  }

  private async handleFieldInviteRevoke(body: any): Promise<void> {
    console.log('Evento: fieldinvite.revoke', body);
  }

  private async handleFieldInviteResend(body: any): Promise<void> {
    console.log('Evento: fieldinvite.resend', body);
  }

  private async handleTemplateCopy(body: any): Promise<void> {
    console.log('Evento: template.copy', body);
  }

  private async handleTemplateDelete(body: any): Promise<void> {
    console.log('Evento: template.delete', body);
  }

  private async handleTemplateUpdate(body: any): Promise<void> {
    console.log('Evento: template.update', body);
  }

  private async handleFreeformResend(body: any): Promise<void> {
    console.log('Evento: freeform.resend', body);
  }

  private async handleDocumentGroupDelete(body: any): Promise<void> {
    console.log('Evento: document_group.delete', body);
  }

  private async handleDocumentGroupCreate(body: any): Promise<void> {
    console.log('Evento: document_group.create', body);
  }

  private async handleDocumentGroupInviteConsentDeclined(body: any): Promise<void> {
    console.log('Evento: document_group.invite.consent.declined', body);
  }

  private async handleDocumentGroupInviteConsentAccepted(body: any): Promise<void> {
    console.log('Evento: document_group.invite.consent.accepted', body);
  }

  private async handleDocumentGroupInviteConsentRevoked(body: any): Promise<void> {
    console.log('Evento: document_group.invite.consent.revoked', body);
  }

  private async handleDocumentGroupInviteCreate(body: any): Promise<void> {
    console.log('Evento: document_group.invite.create', body);
  }

  private async handleDocumentGroupInviteResend(body: any): Promise<void> {
    console.log('Evento: document_group.invite.resend', body);
  }

  private async handleDocumentGroupInviteSent(body: any): Promise<void> {
    console.log('Evento: document_group.invite.sent', body);
  }

  private async handleDocumentGroupInviteReassign(body: any): Promise<void> {
    console.log('Evento: document_group.invite.reassign', body);
  }

  private async handleInviteExpired(body: any): Promise<void> {
    console.log('Evento: invite.expired', body);
  }

  private async handleDocumentGroupComplete(body: any): Promise<void> {
    console.log('Evento: document_group.complete', body);
  }

  private async handleDocumentFieldInviteDelete(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.delete', body);
  }

  private async handleDocumentGroupInviteDeclined(body: any): Promise<void> {
    console.log('Evento: document_group.invite.declined', body);
  }

  private async handleDocumentGroupInviteConsentWithdrawn(body: any): Promise<void> {
    console.log('Evento: document_group.invite.consent.withdrawn', body);
  }

  private async handleDocumentGroupUpdate(body: any): Promise<void> {
    console.log('Evento: document_group.update', body);
  }

  private async handleDocumentGroupInviteConsentAgreed(body: any): Promise<void> {
    console.log('Evento: document_group.invite.consent.agreed', body);
  }

  private async handleDocumentGroupInviteSigned(body: any): Promise<void> {
    console.log('Evento: document_group.invite.signed', body);
  }

  private async handleDocumentGroupInviteUpdate(body: any): Promise<void> {
    console.log('Evento: document_group.invite.update', body);
  }

  private async handleDocumentFreeformSigned(body: any): Promise<void> {
    console.log('Evento: document.freeform.signed', body);
  }

  private async handleDocumentGroupFreeformSigned(body: any): Promise<void> {
    console.log('Evento: document_group.freeform.signed', body);
  }

  private async handleDocumentGroupFreeformCancel(body: any): Promise<void> {
    console.log('Evento: document_group.freeform.cancel', body);
  }

  private async handleDocumentGroupFreeformCreate(body: any): Promise<void> {
    console.log('Evento: document_group.freeform.create', body);
  }

  private async handleDocumentGroupInviteAuthenticationFailed(body: any): Promise<void> {
    console.log('Evento: document_group.invite.authentication.failed', body);
  }

  private async handleDocumentGroupInviteEmailDeliveryFailed(body: any): Promise<void> {
    console.log('Evento: document_group.invite.email.delivery.failed', body);
  }

  private async handleDocumentGroupFreeformResend(body: any): Promise<void> {
    console.log('Evento: document_group.freeform.resend', body);
  }

  private async handleDocumentFieldInviteResend(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.resend', body);
  }

  private async handleDocumentDelete(body: any): Promise<void> {
    console.log('Evento: document.delete', body);
  }

  private async handleDocumentOpen(body: any): Promise<void> {
    console.log('Evento: document.open', body);
  }

  private async handleDocumentUpdate(body: any): Promise<void> {
    console.log('Evento: document.update', body);
  }

  private async handleDocumentFieldInviteReplace(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.replace', body);
  }

  private async handleDocumentFieldInviteConsentDeclined(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.consent.declined', body);
  }

  private async handleDocumentFieldInviteAuthenticationFailed(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.authentication.failed', body);
  }

  private async handleDocumentFieldInviteSigned(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.signed', body);
  }

  private async handleDocumentFreeformCreate(body: any): Promise<void> {
    console.log('Evento: document.freeform.create', body);
  }

  private async handleDocumentCreate(body: any): Promise<void> {
    console.log('Evento: document.create', body);
  }

  private async handleDocumentFieldInviteConsentAgreed(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.consent.agreed', body);
  }

  private async handleDocumentGroupInviteCancel(body: any): Promise<void> {
    console.log('Evento: document_group.invite.cancel', body);
  }

  private async handleDocumentGroupOpen(body: any): Promise<void> {
    console.log('Evento: document_group.open', body);
  }

  private async handleDocumentFieldInviteDecline(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.decline', body);
  }

  private async handleDocumentFieldInviteReassign(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.reassign', body);
  }

  private async handleDocumentFieldInviteEmailDeliveryFailed(body: any): Promise<void> {
    console.log('Evento: document.fieldinvite.email.delivery.failed', body);
  }

  private async handleDocumentFreeformCancel(body: any): Promise<void> {
    console.log('Evento: document.freeform.cancel', body);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Servidor webhook iniciado en el puerto ${port}`);
    });
  }

  public get expressApp(): express.Application {
    return this.app;
  }
} 