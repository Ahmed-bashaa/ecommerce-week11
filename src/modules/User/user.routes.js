import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { systemRoles } from "../../utils/system-roles.js";
import * as userController from './user.controller.js'
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.put('/updateProfile',auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.updateAccount))
router.delete('/deleteProfile',auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.deleteAccount))
router.get('/getUserProfile', auth([systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPER_ADMIN]), expressAsyncHandler(userController.getUserProfile))

export default router;
