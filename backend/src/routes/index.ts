import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import { createComparison } from '../controllers/comparisonController';
import { validateComparisonRequest } from '../middleware/validateComparison';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Comparison endpoint (Requirement 7.1)
router.post('/compare', validateComparisonRequest, createComparison);

export default router;
