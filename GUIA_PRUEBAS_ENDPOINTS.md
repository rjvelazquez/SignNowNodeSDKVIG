# Guía de Pruebas de Endpoints - SignNow API

## 1. Verificar Estado del Servidor
```bash
GET https://c8191lwr-3000.use2.devtunnels.ms/health
```
Respuesta esperada:
```json
{
  "status": "ok"
}
```

## 2. Listar Templates Disponibles
```bash
GET https://c8191lwr-3000.use2.devtunnels.ms/v1/templates
```
Respuesta esperada:
```json
[
  {
    "id": "template123",
    "name": "Nombre del Template",
    "roles": ["Rol1", "Rol2"],
    "owner_email": "propietario@ejemplo.com",
    "thumbnail": {
      "small": "url_thumbnail_small",
      "medium": "url_thumbnail_medium",
      "large": "url_thumbnail_large"
    }
  }
]
```

## 3. Solicitud de Firma con Template
```bash
POST https://c8191lwr-3000.use2.devtunnels.ms/v1/template-signature-requests
Content-Type: application/json

{
  "recordId": "ID_UNICO",
  "templateId": "ID_TEMPLATE",
  "documentName": "Nombre del Documento",
  "signers": [
    {
      "order": 1,
      "email": "firmante1@ejemplo.com",
      "role": "Rol1",
      "nombre": "Nombre Firmante 1",
      "subject": "Asunto del correo",
      "message": "Mensaje personalizado",
      "expiration_days": 5
    }
  ]
}
```

## 4. Solicitud de Firma con Archivo Local
```bash
POST https://c8191lwr-3000.use2.devtunnels.ms/v1/file-signature-requests
Content-Type: application/json

{
  "recordId": "ID_UNICO",
  "filePath": "ruta/al/archivo.pdf",
  "signers": [
    {
      "order": 1,
      "email": "firmante1@ejemplo.com",
      "role": "Rol1",
      "nombre": "Nombre Firmante 1",
      "fields": [
        {
          "type": "signature",
          "page": 1,
          "x": 100,
          "y": 200,
          "width": 200,
          "height": 50,
          "required": true,
          "label": "Firma"
        }
      ]
    }
  ]
}
```

## 5. Solicitud de Firma con Base64
```bash
POST https://c8191lwr-3000.use2.devtunnels.ms/v1/signature-requests
Content-Type: application/json

{
  "recordId": "ID_UNICO",
  "document": {
    "filename": "nombre_archivo.pdf",
    "contentBase64": "CONTENIDO_BASE64_DEL_PDF"
  },
  "expirationDate": "2024-12-31T23:59:59Z",
  "signers": [
    {
      "order": 1,
      "email": "firmante1@ejemplo.com",
      "role": "Rol1",
      "nombre": "Nombre Firmante 1",
      "fields": [
        {
          "type": "signature",
          "page": 1,
          "x": 100,
          "y": 200,
          "width": 200,
          "height": 50,
          "required": true,
          "label": "Firma"
        }
      ]
    }
  ]
}
```

## 6. Probar Flujo Básico
```bash
POST https://c8191lwr-3000.use2.devtunnels.ms/v1/test-flow
Content-Type: application/json

{
  "filePath": "ruta/al/archivo.pdf",
  "recipientEmail": "destinatario@ejemplo.com"
}
```


## Ejemplos de Uso

### Ejemplo 1: Solicitud de Firma con Template
```json
{
  "recordId": "a1B3k00000Xyz123",
  "templateId": "template123",
  "documentName": "Autorización de Verificación Electrónica",
  "signers": [
    {
      "order": 1,
      "email": "firmante1@ejemplo.com",
      "role": "Solicitante",
      "nombre": "Juan Pérez",
      "subject": "Solicitud de firma - Autorización",
      "message": "Por favor firme el documento de autorización",
      "expiration_days": 5
    },
    {
      "order": 2,
      "email": "firmante2@ejemplo.com",
      "role": "CoFirmante",
      "nombre": "María García",
      "subject": "Solicitud de firma - Autorización",
      "message": "Por favor firme el documento de autorización",
      "expiration_days": 3
    }
  ]
}
```

### Ejemplo 2: Solicitud de Firma con Archivo Local
```json
{
  "recordId": "a1B3k00000Xyz123",
  "filePath": "D:\\ruta\\al\\archivo.pdf",
  "signers": [
    {
      "order": 1,
      "email": "firmante1@ejemplo.com",
      "role": "Solicitante",
      "nombre": "Juan Pérez",
      "fields": [
        {
          "type": "signature",
          "page": 1,
          "x": 100,
          "y": 200,
          "width": 200,
          "height": 50,
          "required": true,
          "label": "Firma del Solicitante"
        },
        {
          "type": "date",
          "page": 1,
          "x": 100,
          "y": 300,
          "width": 150,
          "height": 30,
          "required": true,
          "label": "Fecha de Firma"
        }
      ]
    }
  ]
}
``` 