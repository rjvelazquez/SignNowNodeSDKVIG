import { Sdk } from '../core/sdk';
import { DocumentPostRequest, DocumentPostResponse } from '../api/document';
import { FreeFormInvitePost } from '../api/documentInvite/request/freeFormInvitePost';
import { FreeFormInvitePost as FreeFormInvitePostResponse } from '../api/documentInvite/response/freeFormInvitePost';
import { UserGetRequest, UserGetResponse } from '../api/user';
import path from 'path';
import fs from 'fs/promises';
import { ApiClient } from '../core/apiClient';
import { CloneTemplatePost } from '../api/template/request/cloneTemplatePost';
import { FolderGet } from '../api/folder/request/folderGet';
import { FolderGet as FolderGetResponse } from '../api/folder/response/folderGet';
import { FolderDocumentsGet } from '../api/folder/request/folderDocumentsGet';
import { FolderDocumentsGet as FolderDocumentsGetResponse } from '../api/folder/response/folderDocumentsGet';
import { GroupTemplateGet } from '../api/template/request/groupTemplateGet';
import { GroupTemplateGet as GroupTemplateGetResponse } from '../api/template/response/groupTemplateGet';
import { TemplateGet } from '../api/template/request/templateGet';
import { TemplateGet as TemplateGetResponse } from '../api/template/response/templateGet';
import { DocumentGet, DocumentGetResponse } from '../api/document/request/documentGet';

interface SignerField {
  type: 'signature' | 'initial' | 'text' | 'date' | 'checkbox';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  label?: string;
  value?: string;
}

interface Signer {
  order: number;
  email: string;
  role: string;
  nombre: string;
  fields?: SignerField[];
  subject?: string;
  message?: string;
  expiration_days?: number;
}

interface SignatureRequest {
  recordId: string;
  document: {
    filename: string;
    contentBase64: string;
  };
  expirationDate: string;
  signers: Signer[];
  options?: {
    redirect_url?: string;
    redirect_decline_url?: string;
  };
}

interface SignatureResponse {
  success: boolean;
  recordId: string;
  documentId: string;
  inviteIds: string[];
  signedDocumentUrl?: string;
  error?: string;
}

interface TemplateRequest {
  recordId: string;
  templateId: string;
  documentName: string;
  signers: Signer[];
  options?: {
    redirect_url?: string;
    redirect_decline_url?: string;
  };
}

interface Template {
  id: string;
  name: string;
  roles: string[];
  owner_email: string;
  thumbnail: {
    small: string;
    medium: string;
    large: string;
  };
}

interface TemplateResponse {
  id: string;
  template_name?: string;
  document_name?: string;
  roles?: string[];
  owner_email?: string;
  owner?: string;
  thumbnail?: {
    small: string;
    medium: string;
    large: string;
  };
}

interface Document {
  id: string;
  document_name: string;
  template: boolean;
  roles: Array<{ name: string }>;
  owner: string;
  thumbnail: {
    small: string;
    medium: string;
    large: string;
  };
}

export class SalesforceService {
  private sdk: Sdk;

  private client!: ApiClient;

  private userEmail: string = '';

  constructor() {
    this.sdk = new Sdk();
  }

  public async initialize(): Promise<void> {
    await this.sdk.authenticate();
    this.client = this.sdk.getClient();
    
    // Obtener información del usuario al inicializar
    const userGetRequest = new UserGetRequest();
    const userResponse = await this.client.send<UserGetResponse>(userGetRequest);
    this.userEmail = userResponse.primary_email;
    console.log('✅ Usuario autenticado:', this.userEmail);
  }

  private async fileToBase64(filePath: string): Promise<string> {
    console.log('📄 Leyendo archivo para conversión a base64:', filePath);
    try {
      const fileBuffer = await fs.readFile(filePath);
      const base64String = fileBuffer.toString('base64');
      console.log('✅ Archivo convertido a base64 exitosamente');
      return base64String;
    } catch (error) {
      console.error('❌ Error al convertir archivo a base64:', error);
      throw new Error('Error al convertir archivo a base64');
    }
  }

  private async saveBase64ToFile(base64Content: string, filename: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, Buffer.from(base64Content, 'base64'));
    return filePath;
  }

  private async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error al limpiar archivo temporal:', error);
    }
  }

  private async sendInvite(documentId: string, signers: Signer[]): Promise<string[]> {
    try {
      console.log(`📨 Procesando invitación para ${signers.length} firmantes...`);
      
      // 1. Obtener información del documento para extraer los roles
      console.log('🔍 Obteniendo roles del documento...');
      const documentGet = new DocumentGet(documentId);
      const documentResponse = await this.client.send<DocumentGetResponse>(documentGet);
      
      if (!documentResponse.roles || documentResponse.roles.length === 0) {
        throw new Error('El documento no tiene roles definidos');
      }

      // 2. Mapear los firmantes a los roles del documento
      console.log('📋 Mapeando firmantes a roles...');
      const to = signers.map(signer => {
        const role = documentResponse.roles.find(r => r.name === signer.role);
        if (!role) {
          throw new Error(`No se encontró el rol "${signer.role}" en el documento`);
        }
        return {
          email: signer.email,
          role_id: role.unique_id,
          role: role.name,
          order: parseInt(role.signing_order),
          subject: signer.subject || 'Solicitud de firma',
          message: signer.message || 'Por favor firme el documento'
        };
      });

      // 3. Enviar la invitación con los roles correctos
      console.log('📤 Enviando invitación...');
      const invite = new FreeFormInvitePost(documentId, to, this.userEmail);
      const response = await this.client.send<FreeFormInvitePostResponse>(invite);
      console.log(`✅ Invitación enviada exitosamente a ${signers.length} firmantes.`);
      return response.id;
    } catch (error) {
      console.error(`❌ Error al enviar invitación:`, error);
      throw error;
    }
  }

  public async processSignatureRequest(request: SignatureRequest): Promise<SignatureResponse> {
    try {
      console.log('🚀 Iniciando proceso de solicitud de firma...');
      console.log('📝 Datos de la solicitud:', {
        recordId: request.recordId,
        filename: request.document.filename,
        numSigners: request.signers.length
      });

      // 1. Validar campos obligatorios
      console.log('🔍 Validando campos obligatorios...');
      if (!request.recordId || !request.document.contentBase64 || !request.signers.length) {
        console.error('❌ Faltan campos obligatorios en la solicitud');
        throw new Error('Faltan campos obligatorios en la solicitud');
      }
      console.log('✅ Validación de campos completada');

      // 2. Guardar el PDF temporalmente
      console.log('💾 Guardando documento temporalmente...');
      const tempFilePath = await this.saveBase64ToFile(
        request.document.contentBase64,
        request.document.filename
      );
      console.log('✅ Documento guardado en:', tempFilePath);

      // 3. Subir el documento a SignNow
      console.log('📤 Subiendo documento a SignNow...');
      const documentPost = new DocumentPostRequest(
        tempFilePath,
        request.document.filename
      );
      const documentResponse = await this.client.send<DocumentPostResponse>(documentPost);
      console.log('✅ Documento subido exitosamente. ID:', documentResponse.id);

      // 4. Enviar invitaciones de firma a cada firmante
      console.log('📧 Enviando invitaciones de firma...');
      const inviteIds: string[] = await this.sendInvite(documentResponse.id, request.signers);

      // 5. Limpiar archivo temporal
      console.log('🧹 Limpiando archivos temporales...');
      await this.cleanupTempFiles(tempFilePath);
      console.log('✅ Limpieza completada');

      const response = {
        success: true,
        recordId: request.recordId,
        documentId: documentResponse.id,
        inviteIds,
        signedDocumentUrl: `https://api.signnow.com/document/${documentResponse.id}`
      };
      console.log('🎉 Proceso completado exitosamente:', response);
      return response;

    } catch (error) {
      console.error('❌ Error en processSignatureRequest:', error);
      const errorResponse = {
        success: false,
        recordId: request.recordId,
        documentId: '',
        inviteIds: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      console.error('📋 Respuesta de error:', errorResponse);
      return errorResponse;
    }
  }

  public async processFileSignatureRequest(
    recordId: string,
    filePath: string,
    signers: Signer[],
    options?: { redirect_url?: string; redirect_decline_url?: string }
  ): Promise<SignatureResponse> {
    console.log('📁 Iniciando proceso con archivo local:', filePath);
    try {
      // 1. Convertir archivo a base64
      const base64Content = await this.fileToBase64(filePath);
      
      // 2. Crear la solicitud de firma
      const request: SignatureRequest = {
        recordId,
        document: {
          filename: path.basename(filePath),
          contentBase64: base64Content
        },
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        signers,
        options
      };

      // 3. Procesar la solicitud
      return await this.processSignatureRequest(request);
    } catch (error) {
      console.error('❌ Error en processFileSignatureRequest:', error);
      return {
        success: false,
        recordId,
        documentId: '',
        inviteIds: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  public async processTemplateRequest(request: TemplateRequest): Promise<SignatureResponse> {
    try {
      console.log('🚀 Iniciando proceso de solicitud de firma con template...');
      console.log('📝 Datos de la solicitud:', {
        recordId: request.recordId,
        templateId: request.templateId,
        numSigners: request.signers.length
      });

      // 1. Validar campos obligatorios
      console.log('🔍 Validando campos obligatorios...');
      if (!request.recordId || !request.templateId || !request.signers.length) {
        console.error('❌ Faltan campos obligatorios en la solicitud');
        throw new Error('Faltan campos obligatorios en la solicitud');
      }
      console.log('✅ Validación de campos completada');

      // 2. Clonar el template
      console.log('📋 Clonando template...');
      const cloneTemplate = new CloneTemplatePost(
        request.templateId,
        request.documentName
      );
      const templateResponse = await this.client.send<{ id: string }>(cloneTemplate);
      console.log('✅ Template clonado exitosamente. ID:', templateResponse.id);

      // 3. Obtener información del documento clonado
      console.log('🔍 Obteniendo información del documento clonado...');
      const documentGet = new DocumentGet(templateResponse.id);
      const documentResponse = await this.client.send<DocumentGetResponse>(documentGet);
      
      if (!documentResponse.roles || documentResponse.roles.length === 0) {
        throw new Error('El documento clonado no tiene roles definidos');
      }

      // 4. Mapear los firmantes a los roles del documento
      console.log('📋 Mapeando firmantes a roles...');
      const to = request.signers.map(signer => {
        const role = documentResponse.roles.find(r => r.name === signer.role);
        if (!role) {
          throw new Error(`No se encontró el rol "${signer.role}" en el documento`);
        }
        return {
          email: signer.email,
          role_id: role.unique_id,
          role: role.name,
          order: parseInt(role.signing_order),
          subject: signer.subject || 'Solicitud de firma',
          message: signer.message || 'Por favor firme el documento'
        };
      });

      // 5. Enviar la invitación
      console.log('📤 Enviando invitación...');
      const invite = new FreeFormInvitePost(templateResponse.id, to, this.userEmail);
      const response = await this.client.send<FreeFormInvitePostResponse>(invite);
      console.log(`✅ Invitación enviada exitosamente a ${request.signers.length} firmantes.`);

      return {
        success: true,
        recordId: request.recordId,
        documentId: templateResponse.id,
        inviteIds: response.id,
        signedDocumentUrl: `https://api.signnow.com/document/${templateResponse.id}`
      };

    } catch (error) {
      console.error('❌ Error en processTemplateRequest:', error);
      const errorResponse = {
        success: false,
        recordId: request.recordId,
        documentId: '',
        inviteIds: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      console.error('📋 Respuesta de error:', errorResponse);
      return errorResponse;
    }
  }

  public async getTemplateById(templateId: string): Promise<Template | null> {
    try {
      console.log('🔍 Buscando template específico:', templateId);
      
      // Obtener información del template usando TemplateGet
      const templateGet = new TemplateGet(templateId);
      const templateResponse = await this.client.send<TemplateGetResponse>(templateGet);
      
      console.log('📄 Respuesta de la API:', JSON.stringify(templateResponse, null, 2));
      
      if (!templateResponse) {
        console.log('❌ Template no encontrado');
        return null;
      }

      const templateInfo: Template = {
        id: templateResponse.id,
        name: templateResponse.template_name || templateResponse.document_name || 'Sin nombre',
        roles: templateResponse.roles || [],
        owner_email: templateResponse.owner_email || templateResponse.owner || '',
        thumbnail: templateResponse.thumbnail || {
          small: '',
          medium: '',
          large: ''
        }
      };
      
      console.log('✅ Template encontrado:', templateInfo.name);
      return templateInfo;
    } catch (error: unknown) {
      console.error('❌ Error al buscar template:', error);
      if (error instanceof Error && 'response' in error && error.response?.status === 400) {
        console.log('⚠️ El template no está disponible o no tienes permisos para acceder a él');
      }
      throw error;
    }
  }

  public async listTemplates(): Promise<Template[]> {
    try {
      console.log('🔍 Buscando templates disponibles...');
      
      // Obtener la carpeta raíz
      const folderGet = new FolderGet();
      const folderResponse = await this.client.send<FolderGetResponse>(folderGet);
      
      // Obtener los documentos de la carpeta raíz
      const folderDocumentsGet = new FolderDocumentsGet(folderResponse.id);
      const documentsResponse = await this.client.send<FolderDocumentsGetResponse>(folderDocumentsGet);
      
      // Filtrar documentos que son templates y obtener su información detallada
      const templates: Template[] = [];
      
      for (const doc of documentsResponse.documents) {
        if (doc.template) {
          try {
            const templateInfo = await this.getTemplateById(doc.id);
            if (templateInfo) {
              templates.push(templateInfo);
            }
          } catch (error) {
            console.error(`❌ Error al obtener información del template ${doc.id}:`, error);
          }
        }
      }
      
      console.log('✅ Se encontraron', templates.length, 'templates');
      return templates;
    } catch (error) {
      console.error('❌ Error al listar templates:', error);
      throw error;
    }
  }
} 