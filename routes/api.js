import Router from '@koa/router'
import * as providerController from '../controller/provider.js'
import * as logController from '../controller/log.js'
import * as userController from '../controller/user.js'

const router = new Router()

// Provider routes
router.get('/api/providers', providerController.getAll)
router.post('/api/providers', providerController.create)
router.patch('/api/providers/:id/toggle', providerController.toggle)
router.patch('/api/providers/:id', providerController.update)
router.delete('/api/providers/:id', providerController.remove)

// Log routes
router.get('/api/logs', logController.getAll)
router.delete('/api/logs', logController.clear)

// User routes
router.post('/api/user/self', userController.getSelf)
router.post('/api/user/checkin', userController.checkIn)

export default router
