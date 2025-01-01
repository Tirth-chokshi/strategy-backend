// routes/strategyRoutes.ts
import express from 'express';
import StrategyController from '../controllers/strategyControllers';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();

// Strategy routes
router.post('/create', authenticateUser, StrategyController.createStrategy);
router.get('/get',authenticateUser, StrategyController.getStrategies);
router.get('/get/user', authenticateUser, StrategyController.getStrategiesByUser);
router.get('/get/:strategyId', authenticateUser, StrategyController.getStrategyById);
router.put('/update/:strategyId', authenticateUser, StrategyController.updateStrategy);
router.delete('/delete/:strategyId', authenticateUser, StrategyController.deleteStrategy);

// Strategy details routes
router.post('/:strategyId/details', authenticateUser, StrategyController.addStrategyDetails);
router.put('/:strategyId/details/:detailId', authenticateUser, StrategyController.updateStrategyDetail);
router.delete('/:strategyId/details/:detailId', authenticateUser, StrategyController.removeStrategyDetail);

// Strategy status route
router.patch('/:strategyId/toggle-status', authenticateUser, StrategyController.toggleStrategyStatus);

export default router;