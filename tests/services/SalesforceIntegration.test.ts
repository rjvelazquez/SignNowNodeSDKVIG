import { SalesforceService } from '../../src/services/SalesforceService';
import { Sdk } from '../../src/core/sdk';
import fs from 'fs/promises';

jest.mock('../../src/core/sdk');
jest.mock('fs/promises');

// Suprimir mensajes de error esperados
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Salesforce Integration Flow', () => {
  let service: SalesforceService;
  let mockClient: { send: jest.Mock };
  
  // Datos de prueba basados en el ejemplo proporcionado
  const mockRequest = {
    recordId: 'a1B3k00000Xyz123',
    document: {
      filename: 'ApplicantAuthorization_20250623.pdf',
      contentBase64: 'JVBERi0xLjMKJcfs...' // Simulamos el contenido base64
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

  beforeEach(() => {
    mockClient = { send: jest.fn() };
    (Sdk as jest.Mock).mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(undefined),
      getClient: jest.fn().mockReturnValue(mockClient)
    }));
    service = new SalesforceService();
    jest.clearAllMocks();
  });

  describe('Flujo completo de integración', () => {
    it('debería procesar correctamente una solicitud de firma con múltiples firmantes', async () => {
      // Mock de las respuestas de SignNow
      const mockDocumentResponse = { id: 'doc123' };
      const mockInviteResponse1 = { id: 'invite123' };
      const mockInviteResponse2 = { id: 'invite456' };
      
      mockClient.send
        .mockResolvedValueOnce(mockDocumentResponse) // Respuesta de subida de documento
        .mockResolvedValueOnce(mockInviteResponse1)  // Invitación para el primer firmante
        .mockResolvedValueOnce(mockInviteResponse2); // Invitación para el segundo firmante

      // Mock de las operaciones de archivo
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      // Inicializar el servicio
      await service.initialize();

      // Procesar la solicitud
      const result = await service.processSignatureRequest(mockRequest);

      // Verificar el resultado
      expect(result).toEqual({
        success: true,
        recordId: mockRequest.recordId,
        documentId: 'doc123',
        inviteIds: ['invite123', 'invite456'],
        signedDocumentUrl: 'https://api.signnow.com/document/doc123'
      });

      // Verificar que se llamaron los métodos correctos
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled();
      expect(mockClient.send).toHaveBeenCalledTimes(3); // Una vez para el documento y dos veces para las invitaciones
    });

    it('debería manejar correctamente una solicitud con un solo firmante', async () => {
      const singleSignerRequest = {
        ...mockRequest,
        signers: [mockRequest.signers[0]] // Solo el primer firmante
      };

      const mockDocumentResponse = { id: 'doc123' };
      const mockInviteResponse = { id: 'invite123' };
      
      mockClient.send
        .mockResolvedValueOnce(mockDocumentResponse)
        .mockResolvedValueOnce(mockInviteResponse);

      // Mock de las operaciones de archivo
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.initialize();
      const result = await service.processSignatureRequest(singleSignerRequest);

      expect(result).toEqual({
        success: true,
        recordId: singleSignerRequest.recordId,
        documentId: 'doc123',
        inviteIds: ['invite123'],
        signedDocumentUrl: 'https://api.signnow.com/document/doc123'
      });

      expect(mockClient.send).toHaveBeenCalledTimes(2); // Una vez para el documento y una vez para la invitación
    });

    it('debería validar los campos obligatorios', async () => {
      const invalidRequests = [
        {
          ...mockRequest,
          recordId: ''
        },
        {
          ...mockRequest,
          document: {
            ...mockRequest.document,
            contentBase64: ''
          }
        },
        {
          ...mockRequest,
          signers: []
        }
      ];

      for (const invalidRequest of invalidRequests) {
        const result = await service.processSignatureRequest(invalidRequest);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Faltan campos obligatorios en la solicitud');
      }
    });

    it('debería manejar errores durante el proceso', async () => {
      const mockError = new Error('Error de SignNow');
      mockClient.send.mockRejectedValue(mockError);

      // Mock de las operaciones de archivo
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.initialize();
      const result = await service.processSignatureRequest(mockRequest);

      expect(result).toEqual({
        success: false,
        recordId: mockRequest.recordId,
        documentId: '',
        inviteIds: [],
        error: 'Error de SignNow'
      });
    });
  });
}); 