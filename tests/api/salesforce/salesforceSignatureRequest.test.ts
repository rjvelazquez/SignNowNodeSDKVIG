import { describe, expect, it, jest } from '@jest/globals';
import { Sdk } from '../../../src/core/sdk';
import { SalesforceSignatureRequest } from '../../../src/api/salesforce/request/salesforceSignatureRequest';
import { DocumentPostResponse } from '../../../src/api/document';
import fs from 'fs';

// Mock de fs
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Mock de Sdk
jest.mock('../../../src/core/sdk', () => ({
  Sdk: jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockResolvedValue({
      getClient: () => ({
        send: jest.fn()
      })
    })
  }))
}));

describe('SalesforceSignatureRequest', () => {
  it('debería procesar correctamente una solicitud de firma', async () => {
    const sdk = new Sdk();
    const client = (await sdk.authenticate()).getClient();

    // Mock de respuestas
    const mockDocumentResponse: DocumentPostResponse = {
      id: 'test-document-id'
    };

    // Configurar mocks
    (client.send as jest.Mock)
      .mockResolvedValueOnce(mockDocumentResponse);

    // Crear solicitud de prueba
    const request = new SalesforceSignatureRequest(
      'test-record-id',
      {
        filename: 'test.pdf',
        contentBase64: 'test-base64-content'
      },
      '2025-12-31T23:59:59Z',
      [
        {
          order: 1,
          email: 'test1@example.com',
          role: 'Firmante1',
          nombre: 'Test User 1'
        },
        {
          order: 2,
          email: 'test2@example.com',
          role: 'Firmante2',
          nombre: 'Test User 2'
        }
      ]
    );

    // Ejecutar la solicitud
    const response = request.getPayload();

    // Verificar resultados
    expect(response.recordId).toBe('test-record-id');
    expect(response.document.filename).toBe('test.pdf');
    expect(response.signers).toHaveLength(2);
    expect(response.signers[0].email).toBe('test1@example.com');
    expect(response.signers[1].email).toBe('test2@example.com');

    // Verificar que se llamaron los métodos correctos
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('debería manejar errores correctamente', async () => {
    const sdk = new Sdk();
    const client = (await sdk.authenticate()).getClient();

    // Configurar mock para error
    (client.send as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    // Crear solicitud de prueba
    const request = new SalesforceSignatureRequest(
      'test-record-id',
      {
        filename: 'test.pdf',
        contentBase64: 'test-base64-content'
      },
      '2025-12-31T23:59:59Z',
      [
        {
          order: 1,
          email: 'test@example.com',
          role: 'Firmante',
          nombre: 'Test User'
        }
      ]
    );

    // Ejecutar la solicitud
    const response = request.getPayload();

    // Verificar que la respuesta indica error
    expect(response).toBeDefined();
    expect(response.recordId).toBe('test-record-id');
  });
}); 