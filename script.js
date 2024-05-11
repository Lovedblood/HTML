
//Important Imports
const express = require("express");
const { MongoClient } = require("mongodb"); 
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const requireAuth = require('./auth.js')

//Collection Schemas
const Admin = require('./models/Admin.js')
const Product = require('./models/Product.js')
const Customer = require('./models/Customer.js')
const Order = require('./models/Order.js')


//Important Values
const app = express();
const port = 8000;
const publicurl = "mongodb+srv://public:public@secluster.hyn2q8s.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=SECluster";
const privateurl = 'mongodb+srv://yousef:yousef123456@secluster.hyn2q8s.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=SECluster';
const client = new MongoClient(publicurl)
const db = client.db('ecommerce');





//Public & Private API Connections
client.connect().then( () => {
    console.log('Connected Public MongoDB (Browse/Search)');
});-
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
mongoose.connect(privateurl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected Private MongoDB (Admin Priv)');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

//important Express stuff
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//creat token funct
const createToken = (id) => {
    return jwt.sign({ id }, 'secret', { expiresIn: '5h' });
};

//set  custom cookie
app.get('/set-cookie', (req, res) => {
    res.cookie('myCookie', 'Hello, this is my cookie!', { maxAge: 7 * 24 * 60 * 60 * 1000 }); // Expires in 7 days
    res.send('Cookie set successfully!');
});

//admin logout
app.get('/logoutadmin', (req, res) => {
    res.clearCookie('admintoken'); 

});


//register admin
app.post('/regadmin', async (req, res) => {
    const { Username, AdminID, Password } = req.body;

    try {

        const admin = await Admin.create({
            Username,
            AdminID,
            Password,
        });

        const token = createToken(admin._id)
        res.cookie('admintoken', token, { maxAge: 7 * 24 * 60 * 60 * 1000 })


        res.status(201).json(admin);
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//login admin
app.post('/logadmin', async (req, res) => {
    const { Username, Password } = req.body;
    try{
        const admin = await Admin.login( Username, Password )
        const token = createToken(admin._id)
        res.cookie('admintoken', token, { maxAge: 7 * 24 * 60 * 60 * 1000 })
        res.send('Successfully logged in as ' + admin.Username)
    }catch(err){
        console.log(err)
    }
});


//logout
app.get('/logout', (req, res) => {
    res.clearCookie('admintoken'); 

});


//register
app.post('/reg', async (req, res) => {
    const { Username, CustomerID, Password, Address, Email, Name, PhoneNumber, Birthdate } = req.body;

    try {

        const customer = await Customer.create({
            Username,
            CustomerID,
            Password, 
            Address,
            Email,
            Name,
            PhoneNumber,
            Birthdate,
        });


        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//login
app.post('/log', async (req, res) => {
    const { Username, Password } = req.body;
    try{
        const customer = await Customer.login( Username, Password )
        res.send('Successfully logged in as ' + customer.Username)
    }catch(err){
        console.log(err)
    }
});


//get all customers
app.get('/customers', (req, res) => {
    let users = [];
    db.collection('customers')
        .find()
        .forEach(Name => users.push(Name))
        .then(() => {
            res.status(200).json(users);
        })
        .catch(err => {
            res.status(500).json({ error: "could not fetch the data" });
        });
});


// find one customer
app.get('/customers/:Username', (req, res) => {
    const customerUsername = req.params.Username;

    db.collection('customers')
        .findOne({ Username: customerUsername })
        .then(customer => {
            if (customer) {
                res.status(200).json(customer);
            } else {
                res.status(404).json({ error: "Customer not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "An error occurred while fetching data" });
        });
});


//find one products
app.get('/products/:Name', (req, res) => {
    const Name = req.params.Name;

    db.collection('products')
        .findOne({ Name: Name }) 
        .then(product => {
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ error: "Product not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "An error occurred while fetching data" });
        });
});


//find all products
app.get('/products', (req, res) => {
    let products = [];
    db.collection('products')
        .find()
        .forEach(product => products.push(product))
        .then(() => {
            res.status(200).json(products);
        })
        .catch(err => {
            res.status(500).json({ error: "could not fetch the data" });
        });
});

//insert one product
app.post('/productinsert',requireAuth , (req, res) => {
    const product = req.body;

    db.collection('products')
        .insertOne(product)
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: "Could not be inserted" });
        });
});


//update one product
app.patch('/productedit/:ProductID',requireAuth, (req, res) => {
    const productID = req.params.ProductID; 

    const updateFields = req.body;

    db.collection('products')
        .updateOne({ ProductID: productID }, { $set: updateFields })
        .then(result => {
            if (result.modifiedCount > 0) {
                res.status(200).json({ message: "Product updated successfully" });
            } else {
                res.status(404).json({ error: "Product not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "An error occurred while updating data" });
        });
});


//delete one product
app.delete('/products/:ProductID',requireAuth, (req, res) => {
    const ProductID = req.params.ProductID;

    db.collection('products')
        .deleteOne({ ProductID: ProductID })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({ message: "Product deleted successfully" });
            } else {
                res.status(404).json({ error: "Product not found" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "An error occurred while deleting the product" });
        });
});






