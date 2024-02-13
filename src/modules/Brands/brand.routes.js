import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as brandController from './brand.controller.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './brand.endpoints.js'
import { auth } from '../../middlewares/auth.middleware.js'
const router = Router()

router.post('/addBrand',
    auth(endPointsRoles.ADD_BRAND),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.addBrand)
)

router.put('/UpdateBrand',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.UpdateBrand)
)

router.delete('/deleteBrend',
    auth(endPointsRoles.ADD_CATEGORY),
    expressAsyncHandler(brandController.deleteBrand)
)
    
router.get('/getAllBrand', expressAsyncHandler(brandController.getAllBrand))

    
export default router
