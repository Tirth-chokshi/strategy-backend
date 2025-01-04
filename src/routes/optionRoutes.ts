import express from 'express';
import { fetchValues, getOptionDetails, suggestion } from '../controllers/optionControllers';

const router = express.Router();

router.post('/details', getOptionDetails)
router.post('/values', fetchValues)
router.post('/suggestions', suggestion)

export default router;
