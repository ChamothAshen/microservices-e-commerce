const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// MongoDB Connection (optional)
let db;
let ordersCollection;
let inMemoryOrders = []; // Fallback in-memory storage

if (MONGODB_URI) {
    MongoClient.connect(MONGODB_URI)
        .then(client => {
            console.log('Order Service: Connected to MongoDB');
            db = client.db('ecommerce');
            ordersCollection = db.collection('orders');
        })
        .catch(error => {
            console.warn('Order Service: MongoDB not available, using in-memory storage');
            console.warn('Error:', error.message);
        });
} else {
    console.log('Order Service: No MongoDB URI provided, using in-memory storage');
}

// Get all orders
app.get('/', async (req, res) => {
    try {
        if (ordersCollection) {
            const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.json(orders);
        } else {
            // In-memory fallback
            res.json([...inMemoryOrders].sort((a, b) => b.createdAt - a.createdAt));
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get order by ID
app.get('/:id', async (req, res) => {
    try {
        if (ordersCollection) {
            // Validate ObjectId format
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid order ID format' });
            }
            
            const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(order);
        } else {
            // In-memory fallback
            const order = inMemoryOrders.find(o => o._id === req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.json(order);
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new order
app.post('/', async (req, res) => {
    try {
        const { items, userEmail } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items are required' });
        }

        const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

        if (ordersCollection) {
            const result = await ordersCollection.insertOne({
                items,
                userEmail: userEmail || 'guest',
                total,
                status: 'pending',
                createdAt: new Date()
            });

            res.status(201).json({
                message: 'Order created',
                orderId: result.insertedId,
                total
            });
        } else {
            // In-memory fallback
            const newOrder = {
                _id: String(Date.now()),
                items,
                userEmail: userEmail || 'guest',
                total,
                status: 'pending',
                createdAt: new Date()
            };
            inMemoryOrders.push(newOrder);
            
            res.status(201).json({
                message: 'Order created',
                orderId: newOrder._id,
                total
            });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update order status
app.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        if (ordersCollection) {
            // Validate ObjectId format
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid order ID format' });
            }
            
            const result = await ordersCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { 
                    $set: { 
                        status,
                        updatedAt: new Date()
                    } 
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ message: 'Order status updated' });
        } else {
            // In-memory fallback
            const order = inMemoryOrders.find(o => o._id === req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            order.status = status;
            order.updatedAt = new Date();
            res.json({ message: 'Order status updated' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'order-service' });
});

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
