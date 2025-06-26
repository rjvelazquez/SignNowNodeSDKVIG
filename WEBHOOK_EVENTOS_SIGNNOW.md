# Documentación de Eventos Webhook - SignNow

Esta guía describe los eventos de webhook más comunes de SignNow y su propósito. Úsala como referencia para saber cuándo y por qué se dispara cada evento en tu integración.

---

## Eventos de Documentos

- **user.document.create**  
  Se dispara cuando se crea un nuevo documento.

- **user.document.update**  
  Se dispara cuando se actualiza un documento existente.

- **user.document.delete**  
  Se dispara cuando se elimina un documento.

- **user.document.open**  
  Se dispara cuando un usuario abre un documento.

- **user.document.complete**  
  Se dispara cuando un documento ha sido completado (todas las firmas y acciones requeridas han sido realizadas).

---

## Eventos de Invitaciones de Firma (Field Invite)

- **user.document.fieldinvite.create**  
  Se dispara cuando se crea una invitación de campo para firmar.

- **user.document.fieldinvite.sent**  
  Se dispara cuando la invitación de campo ha sido enviada al firmante.

- **user.document.fieldinvite.accept**  
  Se dispara cuando el firmante acepta la invitación de campo.

- **user.document.fieldinvite.decline**  
  Se dispara cuando el firmante rechaza la invitación de campo.

- **user.document.fieldinvite.revoke**  
  Se dispara cuando la invitación de campo es revocada.

- **user.document.fieldinvite.resend**  
  Se dispara cuando la invitación de campo es reenviada.

- **user.document.fieldinvite.delete**  
  Se dispara cuando la invitación de campo es eliminada.

- **user.document.fieldinvite.replace**  
  Se dispara cuando la invitación de campo es reemplazada.

- **user.document.fieldinvite.signed**  
  Se dispara cuando el firmante ha firmado usando la invitación de campo.

- **user.document.fieldinvite.consent.declined**  
  El firmante ha rechazado el consentimiento de la invitación de campo.

- **user.document.fieldinvite.consent.agreed**  
  El firmante ha aceptado el consentimiento de la invitación de campo.

- **user.document.fieldinvite.authentication.failed**  
  Fallo en la autenticación del firmante para la invitación de campo.

- **user.document.fieldinvite.email.delivery.failed**  
  Fallo en la entrega del correo electrónico de la invitación de campo.

---

## Eventos de Documentos Freeform

- **user.document.freeform.create**  
  Se dispara cuando se crea una invitación de firma libre (freeform).

- **user.document.freeform.signed**  
  Se dispara cuando se firma un documento mediante invitación freeform.

- **user.document.freeform.cancel**  
  Se dispara cuando se cancela una invitación freeform.

- **user.document.freeform.resend**  
  Se dispara cuando se reenvía una invitación freeform.

---

## Eventos de Grupos de Documentos (Document Group)

- **user.document_group.create**  
  Se dispara cuando se crea un grupo de documentos.

- **user.document_group.update**  
  Se dispara cuando se actualiza un grupo de documentos.

- **user.document_group.delete**  
  Se dispara cuando se elimina un grupo de documentos.

- **user.document_group.complete**  
  Se dispara cuando un grupo de documentos ha sido completado.

- **user.document_group.open**  
  Se dispara cuando se abre un grupo de documentos.

---

## Eventos de Invitaciones de Grupo (Group Invite)

- **user.document_group.invite.create**  
  Se dispara cuando se crea una invitación de grupo.

- **user.document_group.invite.sent**  
  Se dispara cuando la invitación de grupo ha sido enviada.

- **user.document_group.invite.resend**  
  Se dispara cuando la invitación de grupo es reenviada.

- **user.document_group.invite.reassign**  
  Se dispara cuando la invitación de grupo es reasignada a otro firmante.

- **user.document_group.invite.cancel**  
  Se dispara cuando la invitación de grupo es cancelada.

- **user.document_group.invite.declined**  
  Se dispara cuando el firmante rechaza la invitación de grupo.

- **user.document_group.invite.signed**  
  Se dispara cuando el firmante ha firmado usando la invitación de grupo.

- **user.document_group.invite.update**  
  Se dispara cuando se actualiza una invitación de grupo.

- **user.document_group.invite.authentication.failed**  
  Fallo en la autenticación del firmante para la invitación de grupo.

- **user.document_group.invite.email.delivery.failed**  
  Fallo en la entrega del correo electrónico de la invitación de grupo.

---

## Eventos de Consentimiento en Invitaciones de Grupo

- **user.document_group.invite.consent.declined**  
  El firmante ha rechazado el consentimiento de la invitación de grupo.

- **user.document_group.invite.consent.accepted**  
  El firmante ha aceptado el consentimiento de la invitación de grupo.

- **user.document_group.invite.consent.revoked**  
  El consentimiento de la invitación de grupo ha sido revocado.

- **user.document_group.invite.consent.withdrawn**  
  El consentimiento de la invitación de grupo ha sido retirado.

- **user.document_group.invite.consent.agreed**  
  El firmante ha aceptado el consentimiento de la invitación de grupo.

---

## Otros eventos

- **user.template.copy**  
  Se dispara cuando se copia una plantilla.

- **user.template.delete**  
  Se dispara cuando se elimina una plantilla.

- **user.template.update**  
  Se dispara cuando se actualiza una plantilla.

- **user.invite.expired**  
  Se dispara cuando una invitación ha expirado. 