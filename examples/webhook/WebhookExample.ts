import { WebhookHandlerService } from '../../src/services/WebhookHandlerService';
import { WebhookService } from '../../src/services/WebhookService';
import { WebhookSubscriptionRequest } from '../../src/api/webhook/request/subscriptionPost';

async function main(): Promise<void> {
  try {
    // 1. Inicializar el servicio de webhooks
    const webhookService = new WebhookService();
    await webhookService.initialize();

    // 2. Configurar el manejador de webhooks
    const secretKey = 'tu_clave_secreta'; // Debe ser la misma que usaste al crear la suscripción
    const webhookHandler = new WebhookHandlerService(secretKey);

    // 3. Registrar suscripciones para todos los eventos que quieras manejar
    const eventos = [
      'document.complete',
      'document.signed',
      'document.viewed',
      'document.declined',
      'field.update'
    ];

    for (const evento of eventos) {
      const request: WebhookSubscriptionRequest = {
        event: evento,
        entity_id: 'tu_entity_id', // Puede ser un documento específico o 'all' para todos
        action: 'callback',
        attributes: {
          callback: 'https://tu-dominio.com/webhook',
          use_tls_12: true,
          secret_key: secretKey,
          delay: 0,
          retry_count: 3,
          delete_access_token: true,
          include_metadata: true
        }
      };

      await webhookService.createSubscription(request);
    }

    // 4. Iniciar el servidor webhook
    const PORT = Number(process.env.PORT) || 3000;
    webhookHandler.start(PORT);

    console.log('✅ Servicio de webhooks configurado y ejecutándose');
  } catch (error) {
    console.error('❌ Error al configurar webhooks:', error);
  }
}

main(); 