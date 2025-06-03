import { SalesforceService } from '../../src/services/SalesforceService';
import { Sdk } from '../../src/core/sdk';
import fs from 'fs/promises';

jest.mock('../../src/core/sdk');
jest.mock('fs/promises');

describe('SalesforceService', () => {
  let service: SalesforceService;
  const mockRequest = {
    recordId: 'a1B3k00000Xyz123',
    document: {
      filename: 'test.pdf',
      contentBase64: 'JVBERi0xLjMKJcfs...'
    },
    expirationDate: '2025-06-23T23:59:59Z',
    signers: [
      {
        order: 1,
        email: 'test@example.com',
        role: 'Solicitante',
        nombre: 'Test User'
      }
    ]
  };

  beforeEach(() => {
    service = new SalesforceService();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should authenticate and get client', async () => {
      const mockClient = { send: jest.fn() };
      (Sdk as jest.Mock).mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(undefined),
        getClient: jest.fn().mockReturnValue(mockClient)
      }));

      await service.initialize();
      expect(Sdk.prototype.authenticate).toHaveBeenCalled();
    });
  });

  describe('processSignatureRequest', () => {
    it('should process signature request successfully', async () => {
      const mockDocumentResponse = { id: 'doc123' };
      const mockInviteResponse = { id: 'invite123' };
      const mockClient = {
        send: jest.fn()
          .mockResolvedValueOnce(mockDocumentResponse)
          .mockResolvedValueOnce(mockInviteResponse)
      };

      (Sdk as jest.Mock).mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(undefined),
        getClient: jest.fn().mockReturnValue(mockClient)
      }));

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.initialize();
      const result = await service.processSignatureRequest(mockRequest);

      expect(result).toEqual({
        success: true,
        recordId: mockRequest.recordId,
        documentId: 'doc123',
        inviteIds: ['invite123'],
        signedDocumentUrl: 'https://api.signnow.com/document/doc123'
      });
    });

    it('should handle missing required fields', async () => {
      const invalidRequest = {
        ...mockRequest,
        recordId: '',
        document: {
          ...mockRequest.document,
          contentBase64: ''
        },
        signers: []
      };

      const result = await service.processSignatureRequest(invalidRequest);

      expect(result).toEqual({
        success: false,
        recordId: '',
        documentId: '',
        inviteIds: [],
        error: 'Faltan campos obligatorios en la solicitud'
      });
    });

    it('should handle errors during signature request', async () => {
      const mockError = new Error('Test error');
      const mockClient = {
        send: jest.fn().mockRejectedValue(mockError)
      };

      (Sdk as jest.Mock).mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(undefined),
        getClient: jest.fn().mockReturnValue(mockClient)
      }));

      await service.initialize();
      const result = await service.processSignatureRequest(mockRequest);

      expect(result).toEqual({
        success: false,
        recordId: mockRequest.recordId,
        documentId: '',
        inviteIds: [],
        error: 'Test error'
      });
    });
  });

  describe('cleanupTempFiles', () => {
    it('should delete temporary file successfully', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.cleanupTempFiles('test.pdf');
      expect(fs.unlink).toHaveBeenCalledWith('test.pdf');
    });

    it('should handle errors during file deletion', async () => {
      const mockError = new Error('Delete error');
      (fs.unlink as jest.Mock).mockRejectedValue(mockError);

      await service.cleanupTempFiles('test.pdf');
      expect(fs.unlink).toHaveBeenCalledWith('test.pdf');
    });
  });
}); 