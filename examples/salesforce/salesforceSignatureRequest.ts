import { Sdk } from '../../src/core/sdk';
import { SalesforceSignatureRequest } from '../../src/api/salesforce/request/salesforceSignatureRequest';
import { SalesforceSignatureResponse } from '../../src/api/salesforce/response/salesforceSignatureRequest';
import { DocumentPostRequest, DocumentPostResponse } from '../../src/api/document';
import { FreeFormInvitePost } from '../../src/api/documentInvite/request/freeFormInvitePost';
import { FreeFormInvitePost as FreeFormInvitePostResponse } from '../../src/api/documentInvite/response/freeFormInvitePost';
import fs from 'fs';
import path from 'path';

export async function processSalesforceSignatureRequest(): Promise<SalesforceSignatureResponse> {
  try {
    // 1. Autenticar con SignNow
    const sdk = await new Sdk().authenticate();
    const client = sdk.getClient();

    // 2. Recibir y validar la solicitud de Salesforce
    const salesforceRequest = new SalesforceSignatureRequest(
      'a1B3k00000Xyz123',
      {
        filename: 'ApplicantAuthorization_20250623.pdf',
        contentBase64: 'JVBERi0xLjMKJcfs...' // Base64 del PDF
      },
      '2025-06-23T23:59:59Z',
      [
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
    );

    // 3. Decodificar y guardar el PDF temporalmente
    const pdfBuffer = Buffer.from(salesforceRequest.getPayload().document.contentBase64, 'base64');
    const tempPdfPath = path.join(__dirname, '_data', 'temp.pdf');
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // 4. Subir el documento a SignNow
    const documentPost = new DocumentPostRequest(tempPdfPath, salesforceRequest.getPayload().document.filename);
    const documentResponse = await client.send<DocumentPostResponse>(documentPost);
    const documentId = documentResponse.id;

    // 5. Enviar invitaciones de firma a cada firmante
    const signingLinks: { [key: string]: string } = {};
    const senderEmail = 'sender@example.com'; // Email del remitente configurado en SignNow

    for (const signer of salesforceRequest.getPayload().signers) {
      const freeFormInvite = new FreeFormInvitePost(
        documentId,
        signer.email,
        senderEmail
      );
      const inviteResponse = await client.send<FreeFormInvitePostResponse>(freeFormInvite);
      // Asumiendo que la respuesta contiene un campo 'signing_url' o similar
      signingLinks[signer.email] = inviteResponse.signing_url || '';
    }

    // 6. Limpiar archivo temporal
    fs.unlinkSync(tempPdfPath);

    // 7. Retornar respuesta exitosa
    return {
      success: true,
      documentId: documentId,
      signingLinks: signingLinks
    };

  } catch (error) {
    // 8. Manejar errores
    return {
      success: false,
      documentId: '',
      signingLinks: {},
      error: {
        code: 'PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    };
  }
} 