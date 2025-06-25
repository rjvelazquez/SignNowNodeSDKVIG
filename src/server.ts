import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { SalesforceService } from './services/SalesforceService';
import { Sdk } from './core/sdk';
import { FreeFormInvitePost } from './api/documentInvite/request/freeFormInvitePost';
import { FreeFormInvitePost as FreeFormInvitePostResponse } from './api/documentInvite/response/freeFormInvitePost';
import { UserGetRequest, UserGetResponse } from './api/user';
import { DocumentPostRequest, DocumentPostResponse } from './api/document';
import path from 'path';
import { TemplateRequest } from './api/template/request/templateRequest';
import { WebhookHandlerService } from './services/WebhookHandlerService';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));

// Middleware para CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware para logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Instancia del servicio
const salesforceService = new SalesforceService();
let isServiceInitialized = false;

// Ruta para probar el flujo del index.ts
app.post('/v1/test-flow', async (req: Request, res: Response) => {
  try {
    console.log('Iniciando prueba del flujo index.ts');
    
    // Crear una nueva instancia del SDK y autenticar
    const sdk = await new Sdk().authenticate();
    const client = sdk.getClient();
    
    console.log('Conexión exitosa!');
    console.log('Token de acceso:', sdk.actualBearerToken());

    // Obtener información del usuario
    console.log('Obteniendo información del usuario...');
    const userGetRequest = new UserGetRequest();
    const userResponse = await client.send<UserGetResponse>(userGetRequest);
    console.log('Información del usuario:', userResponse);

    // Subir el documento
    console.log('Subiendo documento...');
    const filePath = req.body.filePath || path.join(__dirname, '../storage/downloads/Autorizacion_Verificacion_Electronica.pdf');
    const documentPost = new DocumentPostRequest(
      filePath,
      'test.pdf'
    );
    const documentPostResponse = await client.send<DocumentPostResponse>(documentPost);
    console.log('Documento subido:', documentPostResponse);

    // Enviar invitación de firma
    console.log('Enviando invitación de firma...');
    const senderEmail = userResponse.primary_email;
    const recipientEmail = req.body.recipientEmail || 'rjvelazquez96@gmail.com';
    const freeFormInvite = new FreeFormInvitePost(
      documentPostResponse.id,
      recipientEmail,
      senderEmail
    );
    const inviteResponse = await client.send<FreeFormInvitePostResponse>(freeFormInvite);
    console.log('Invitación enviada:', inviteResponse);

    res.json({
      success: true,
      documentId: documentPostResponse.id,
      inviteId: inviteResponse.id,
      userInfo: userResponse
    });

  } catch (error) {
    console.error('Error en el flujo de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el flujo de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para procesar solicitudes de firma con base64
app.post('/v1/signature-requests', async (req: Request, res: Response) => {
  try {
    console.log('Signature request with base64');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Initializing service');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Processing signature request');
    // Procesar la solicitud
    const result = await salesforceService.processSignatureRequest(req.body);
    console.log('Result', result);
    // Enviar respuesta
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para procesar solicitudes de firma con archivo local
app.post('/v1/file-signature-requests', async (req: Request, res: Response) => {
  try {
    console.log('Signature request with local file');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Initializing service');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Processing file signature request');
    // Procesar la solicitud
    const result = await salesforceService.processFileSignatureRequest(
      req.body.recordId,
      req.body.filePath,
      req.body.signers,
      req.body.options
    );
    console.log('Result', result);
    // Enviar respuesta
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error al procesar la solicitud de archivo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para procesar solicitudes de firma con template
app.post('/v1/template-signature-requests', async (req: Request, res: Response) => {
  try {
    console.log('Template signature request');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Initializing service');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Processing template signature request');
    // Procesar la solicitud
    const result = await salesforceService.processTemplateRequest(req.body);
    console.log('Result', result);
    // Enviar respuesta
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error al procesar la solicitud de template:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para listar templates
app.get('/v2/templates', async (req: Request, res: Response) => {
  try {
    console.log('List templates request');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Initializing service');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Getting templates list');
    // Obtener la lista de templates
    const templates = await salesforceService.listTemplates();
    console.log('Templates found:', templates.length);
    // Enviar respuesta
    return res.json(templates);
  } catch (error) {
    console.error('Error al listar templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para obtener copias de un template específico
app.get('/v2/templates/:templateId/copies', async (req: Request, res: Response) => {
  try {
    console.log(`Iniciando solicitud de copias para template ID: ${req.params.templateId}`);
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Inicializando servicio...');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Obteniendo copias del template...');
    // Obtener las copias del template
    const copies = await salesforceService.getTemplateCopies(req.params.templateId);
    console.log(`Copias encontradas: ${copies.length}`);
    // Enviar respuesta
    return res.json(copies);
  } catch (error) {
    console.error('Error al obtener copias del template:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para enviar un template a un firmante
app.post('/v1/templates/:templateId/send', async (req: Request, res: Response) => {
  try {
    console.log('Send template request');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Initializing service');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }

    const { templateId } = req.params;
    const { email, name, role = 'Signer 1' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere email y nombre del firmante'
      });
    }

    console.log('Sending template to:', email);
    
    // Crear la solicitud de firma con template
    const request: TemplateRequest = {
      recordId: Date.now().toString(), // ID único para la solicitud
      templateId: templateId,
      documentName: `Documento para ${name}`,
      signers: [{
        order: 1,
        email: email,
        role: role,
        nombre: name,
        subject: 'Solicitud de firma',
        message: 'Por favor firme el documento',
        expiration_days: 7
      }]
    };

    // Procesar la solicitud
    const response = await salesforceService.processTemplateRequest(request);
    
    // Enviar respuesta
    res.json(response);
  } catch (error) {
    console.error('Error al enviar template:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para listar templates usando el endpoint v2
app.get('/user/documentsv2', async (req: Request, res: Response) => {
  try {
    console.log('Iniciando solicitud de listado de documentos v2');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Inicializando servicio...');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Obteniendo lista de documentos v2...');
    // Obtener la lista de templates
    const templates = await salesforceService.listTemplates();
    console.log(`Documentos encontrados: ${templates.length}`);
    // Enviar respuesta
    return res.json(templates);
  } catch (error) {
    console.error('Error al listar documentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para listar solo templates
app.get('/user/templates', async (req: Request, res: Response) => {
  try {
    console.log('Iniciando solicitud de listado de templates');
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Inicializando servicio...');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Obteniendo lista de templates...');
    // Obtener la lista de templates
    const templates = await salesforceService.listTemplates();
    console.log(`Total de documentos obtenidos: ${templates.length}`);
    
    // Filtrar solo los documentos que son templates
    const onlyTemplates = templates.filter(doc => {
      const isTemplate = doc.template === true;
      if (isTemplate) {
        console.log(`Template encontrado: ${doc.name || 'Sin nombre'} (ID: ${doc.id})`);
      }
      return isTemplate;
    });
    
    console.log(`Templates encontrados: ${onlyTemplates.length}`);
    // Enviar respuesta
    return res.json(onlyTemplates);
  } catch (error) {
    console.error('Error al listar templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para obtener un documento específico
app.get('/v2/documents/:documentId', async (req: Request, res: Response) => {
  try {
    console.log(`Iniciando solicitud de documento ID: ${req.params.documentId}`);
    // Validar que el servicio esté inicializado
    if (!isServiceInitialized) {
      console.log('Inicializando servicio...');
      await salesforceService.initialize();
      isServiceInitialized = true;
    }
    console.log('Obteniendo documento...');
    // Obtener el documento
    const document = await salesforceService.getDocument(req.params.documentId);
    console.log('Documento encontrado:', document.id);
    // Enviar respuesta
    return res.json(document);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Instanciar el manejador de webhooks y montar su ruta en el servidor principal
const webhookSecretKey = process.env.WEBHOOK_SECRET_KEY || 'wWKCp6RcECyDPmD3FzETBOhAqQRmOeVKaIOA3jnYIqOgUhFoxL';
const webhookHandler = new WebhookHandlerService(webhookSecretKey);
app.use('/', webhookHandler.expressApp);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('Rutas disponibles:');
  console.log('- POST /v1/signature-requests');
  console.log('- POST /v1/file-signature-requests');
  console.log('- POST /v1/template-signature-requests');
  console.log('- GET /v2/templates');
  console.log('- GET /user/documentsv2');
  console.log('- GET /user/templates');
  console.log('- POST /v1/test-flow');
  console.log('- GET /health');
}); 