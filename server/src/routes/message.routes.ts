import express from 'express'
import { isUserLogin } from '../middleware/protectedRoutes'
import { getAllMessage, getUserForSideBar, markMessageAsSeen, sendMessage } from '../controller/message.controller'
const router = express.Router()
router.route('/users').get(isUserLogin,getUserForSideBar);
router.route('/:id').get(isUserLogin,getAllMessage);
router.patch('/mark/:id',isUserLogin,markMessageAsSeen);
router.put('/send/:id',isUserLogin,sendMessage);

export default router;