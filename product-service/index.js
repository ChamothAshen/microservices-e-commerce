const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

app.use(cors());
app.use(express.json());

// MongoDB Connection (optional)
let isMongoConnected = false;
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Product Service: Connected to MongoDB');
        isMongoConnected = true;
        seedInitialProducts();
    })
    .catch(err => {
        console.warn('Product Service: MongoDB not available, using in-memory storage');
        console.warn('Error:', err.message);
        // Continue without MongoDB - service will work with in-memory fallback
    });

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

const Product = mongoose.model('Product', productSchema);

// In-memory fallback storage
let inMemoryProducts = [
    {
        _id: '1',
        name: 'Wireless Headphones',
        description: 'Premium noise-canceling wireless headphones',
        price: 299.99,
        stock: 50,
        createdAt: new Date()
    },
    {
        _id: '2',
        name: 'Smart Watch',
        description: 'Fitness tracking smart watch with heart rate monitor',
        price: 199.99,
        stock: 100,
        createdAt: new Date()
    },
    {
        _id: '3',
        name: 'Laptop Stand',
        description: 'Ergonomic aluminum laptop stand',
        price: 49.99,
        stock: 75,
        createdAt: new Date()
    }
];
let nextProductId = 4;

// Seed initial products
async function seedInitialProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany([
                {
                    name: 'Wireless Headphones',
                    description: 'Premium noise-canceling wireless headphones',
                    price: 299.99,
                    stock: 50
                },
                {
                    name: 'Smart Watch',
                    description: 'Fitness tracking smart watch with heart rate monitor',
                    price: 199.99,
                    stock: 100
                },
                {
                    name: 'Laptop Stand',
                    description: 'Ergonomic aluminum laptop stand',
                    price: 49.99,
                    stock: 75
                }
            ]);
            console.log('Seeded initial products');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
}

// Get all products
app.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const products = await Product.find({});
            res.json(products);
        } else {
            // In-memory fallback
            res.json(inMemoryProducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get product by ID
app.get('/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } else {
            // In-memory fallback
            const product = inMemoryProducts.find(p => p._id === req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new product
app.post('/', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        if (mongoose.connection.readyState === 1) {
            const product = new Product({
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0
            });

            const result = await product.save();

            res.status(201).json({
                message: 'Product created',
                productId: result._id
            });
        } else {
            // In-memory fallback
            const newProduct = {
                _id: String(nextProductId++),
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                createdAt: new Date()
            };
            inMemoryProducts.push(newProduct);
            res.status(201).json({
                message: 'Product created',
                productId: newProduct._id
            });
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update product
app.put('/:id', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (stock !== undefined) updateData.stock = parseInt(stock);

        updateData.updatedAt = new Date();

        if (mongoose.connection.readyState === 1) {
            const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product updated', product });
        } else {
            // In-memory fallback
            const productIndex = inMemoryProducts.findIndex(p => p._id === req.params.id);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            inMemoryProducts[productIndex] = {
                ...inMemoryProducts[productIndex],
                ...updateData
            };
            
            res.json({ message: 'Product updated', product: inMemoryProducts[productIndex] });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete product
app.delete('/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const result = await Product.findByIdAndDelete(req.params.id);

            if (!result) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product deleted' });
        } else {
            // In-memory fallback
            const productIndex = inMemoryProducts.findIndex(p => p._id === req.params.id);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            inMemoryProducts.splice(productIndex, 1);
            res.json({ message: 'Product deleted' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'product-service', dbState: mongoose.connection.readyState });
});

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
