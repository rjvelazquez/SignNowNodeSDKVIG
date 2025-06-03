import express from 'express';
import SalesforceController from '../controllers/SalesforceController';
import { SalesforceService } from '../services/SalesforceService';

const router = express.Router();
const salesforceService = new SalesforceService();
const salesforceController = new SalesforceController(salesforceService);

// Ruta para listar templates
router.get('/templates', (req, res) => salesforceController.listTemplates(req, res));

// ... existing code ...

export default router; 