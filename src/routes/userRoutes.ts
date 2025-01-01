import { createUser,updateUser,deleteUser,loginUser } from '../controllers/userControllers';
import { Router } from 'express';
const router = Router();

router.post('/create', createUser);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', loginUser);

export default router;