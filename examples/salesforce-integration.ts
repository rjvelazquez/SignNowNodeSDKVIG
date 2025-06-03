import { SalesforceService } from '../src/services/SalesforceService';

async function main(): Promise<void> {
  try {
    console.log('Iniciando integración con Salesforce y SignNow...');
    
    const service = new SalesforceService();
    await service.initialize();
    
    // Ejemplo de solicitud de firma
    const request = {
      recordId: 'a1B3k00000Xyz123',
      document: {
        filename: 'ApplicantAuthorization_20250623.pdf',
        contentBase64: 'JVBERi0xLjMKJcfs...' // Aquí iría el contenido real en base64
      },
      expirationDate: '2025-06-23T23:59:59Z',
      signers: [
        {
          order: 1,
          email: 'juan.perez@dominio.com',
          role: 'Solicitante',
          nombre: 'Juan Perez'
        },
        {
          order: 2,
          email: 'maria.lopez@dominio.com',
          role: 'CoFirmante',
          nombre: 'María López'
        }
      ]
    };
    
    const result = await service.processSignatureRequest(request);
    
    if (result.success) {
      console.log('Solicitud de firma procesada exitosamente:');
      console.log('ID del registro:', result.recordId);
      console.log('ID del documento:', result.documentId);
      console.log('IDs de invitaciones:', result.inviteIds);
      console.log('URL del documento firmado:', result.signedDocumentUrl);
    } else {
      console.error('Error al procesar la solicitud:', result.error);
    }
    
  } catch (error) {
    console.error('Error en la integración:', error);
  }
}

main(); 