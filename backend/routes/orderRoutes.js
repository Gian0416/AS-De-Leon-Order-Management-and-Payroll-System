import express from 'express';
import {
    getAllOrders, getOrderById, createOrder, getCustomers,
    approveOrder, declineOrder, nextStatus,
    recordPayment, setLabor, setInstallDate,
    addItem, editItem, setItemPrice, deleteItem
} from '../../../controllers/transaction-status/1.1.1-transaction-list/orderController.js';

const router = express.Router();

router.get('/customers',                 getCustomers);
router.get('/',                          getAllOrders);
router.post('/',                         createOrder);

export default router;
