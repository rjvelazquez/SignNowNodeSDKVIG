# SignNow Node SDK

SDK para interactuar con la API de SignNow.

## Endpoints Principales

### Templates

```http
# Listar todos los templates
GET /user/templates

# Listar todos los documentos (incluyendo templates)
GET /user/documentsv2
```

### Documentos

```http
# Obtener un documento específico
GET /v2/documents/{documentId}

# Subir un nuevo documento
POST /v2/documents
Content-Type: multipart/form-data
```

### Firmas

```http
# Enviar documento para firma
POST /v1/template-signature-requests
Content-Type: application/json

{
  "recordId": "test-001",
  "templateId": "80b7f301ba2e4fc4ad6894fc22f3e0cb7bbcb6dd",
  "documentName": "Documento de prueba con dos firmantes",
  "signers": [
    {
      "order": 1,
      "email": "test@test.com",
      "role": "Recipient 1",
      "nombre": "Nombre",
      "subject": "Solicitud de firma",
      "message": "Por favor firme el documento"
    }
  ]
}

# Verificar estado de firma
GET /v2/documents/{documentId}
```

## Ejemplos de Uso

### Listar Templates
```typescript
const templates = await salesforceService.listTemplates();
console.log('Templates encontrados:', templates.length);
```

### Enviar Documento para Firma
```typescript
const documentId = '123456789';
const signers = [{
  email: 'firmante@ejemplo.com',
  role: 'firmante',
  order: 1
}];

await salesforceService.sendDocumentForSignature(documentId, signers);
```

## Notas Importantes

- Todos los endpoints requieren autenticación
- Los templates son documentos con la propiedad `template: true`
- Para crear un template, primero sube un documento y luego conviértelo en template
- Los documentos enviados para firma pueden ser monitoreados usando el endpoint de verificación de estado

# signNow API NODE.JS SDK
## v3.0.0

[![Node.js Version](https://img.shields.io/badge/supported->=20-blue?logo=node.js)](https://nodejs.org/)

### Requirements
- Node.js 20 or higher

### Installation
Get SDK code
```bash
git clone git@github.com:signnow/SignNowNodeSDK.git
```
Install dependencies
```bash
npm install
```

### Configuration
Copy `.env.example` to `.env` and fill your credentials in the required values
```bash
cp .env.example .env
```

### Run tests
To run tests you need to have a valid `.env.test` file with credentials for testing.
If you don't have it, you can create it by copying the `.env.test.dist` file and renaming it to `.env.test`.
However, the file will be created automatically if you just run test execution with the following commands:
```bash
npm run test
```

### Usage
To start using the SDK, you need to create a new instance of the SDK API client and authenticate it using the credentials from the `.env` file.
Example of sending a request to get a document by id:
```typescript

import { Sdk, DocumentGet } from '@signnow/api-sdk';
import type { Document } from '@signnow/api-sdk';

const sdk = await new Sdk().authenticate();
const client = sdk.getClient();

const documentGet = new DocumentGet('29db9956636d481f9c532ef64951ae78209f7483');
const responseDocumentGet = await client.send<Document>(documentGet);
console.log('response document get', responseDocumentGet);
```

### Examples
You can find more examples of API usage in the [`examples`](./examples) directory.

## Templates

### Listar Templates

Para obtener la lista de templates disponibles, puedes usar el siguiente endpoint:

```http
GET /user/templates
```

Este endpoint devuelve una lista de templates con la siguiente estructura:

```json
[
  {
    "id": "string",
    "name": "string",
    "roles": ["string"],
    "owner_email": "string",
    "thumbnail": {
      "small": "string",
      "medium": "string",
      "large": "string"
    },
    "template": true
  }
]
```

### Listar Todos los Documentos (incluyendo templates)

Si necesitas ver todos los documentos, incluyendo templates, puedes usar:

```http
GET /user/documentsv2
```

### Obtener Copias de un Template

Para obtener las copias de un template específico:

```http
GET /v2/templates/{templateId}/copies
```

Donde `{templateId}` es el ID del template del cual quieres obtener las copias.

### Notas Importantes

- Los templates son documentos que tienen la propiedad `template: true`
- El endpoint `/user/templates` filtra automáticamente solo los documentos que son templates
- El endpoint `/user/documentsv2` muestra todos los documentos, incluyendo templates
- Para crear un nuevo template, primero debes subir un documento y luego convertirlo en template