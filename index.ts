import { Sdk } from './src/core/sdk';
import { DocumentGetRequest, DocumentGetResponse, DocumentPostRequest, DocumentPostResponse, DocumentDownloadGetRequest } from './src/api/document';
import { UserGetRequest, UserGetResponse } from './src/api/user';
import { FreeFormInvitePost } from './src/api/documentInvite/request/freeFormInvitePost';
import { FreeFormInvitePost as FreeFormInvitePostResponse } from './src/api/documentInvite/response/freeFormInvitePost';
import { displayResult } from './src/core/error/displayResult';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Iniciando conexión con SignNow...');
    
    // Crear una nueva instancia del SDK y autenticar
    const sdk = await new Sdk().authenticate();
    const client = sdk.getClient();
    
    console.log('Conexión exitosa!');
    console.log('Token de acceso:', sdk.actualBearerToken());

    // Ejemplo 1: Obtener información del usuario
    console.log('\n1. Obteniendo información del usuario...');
    const userGetRequest = new UserGetRequest();
    const userResponse = await client.send<UserGetResponse>(userGetRequest);
    console.log('Información del usuario:', userResponse);

    // Ejemplo 2: Subir un nuevo documento
    console.log('\n2. Subiendo un nuevo documento...');
    const documentPost = new DocumentPostRequest(
      path.join(__dirname, 'examples/_data/demo.pdf'),
      'test.pdf'
    );
    const documentPostResponse = await client.send<DocumentPostResponse>(documentPost);
    console.log('Documento subido:', documentPostResponse);

    // Ejemplo 3: Obtener un documento específico
    console.log('\n3. Obteniendo documento...');
    const documentId = documentPostResponse.id; // Usar el ID del documento recién subido
    const documentGet = new DocumentGetRequest(documentId);
    const documentResponse = await client.send<DocumentGetResponse>(documentGet);
    console.log('Información del documento:', documentResponse);

    // Ejemplo 4: Descargar el documento
    console.log('\n4. Descargando documento...');
    const documentDownload = new DocumentDownloadGetRequest(documentId);
    const downloadResponse = await client.send(documentDownload);
    console.log('Documento descargado en:', downloadResponse);

    // Ejemplo 5: Enviar una invitación de firma
    console.log('\n5. Enviando invitación de firma...');
    const senderEmail = userResponse.primary_email; // Usar el email del usuario autenticado
    const recipientEmail = 'rjvelazquez96@gmail.com'; // Reemplazar con el email del destinatario
    const freeFormInvite = new FreeFormInvitePost(
      documentId,
      recipientEmail,
      senderEmail
    );
    const inviteResponse = await client.send<FreeFormInvitePostResponse>(freeFormInvite);
    console.log('Invitación enviada:', inviteResponse);

    // Aquí se pueden agregar más ejemplos según sea necesario
    // Por ejemplo:
    // - Crear documentos
    // - Enviar invitaciones
    // - Gestionar plantillas
    // - Configurar webhooks
    // etc.

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 