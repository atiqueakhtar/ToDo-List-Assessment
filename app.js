const express = require('express')
const session = require('express-session');
const mongoose  = require('mongoose');
const MongoDbSession = require('connect-mongodb-session')(session);
const UserModel = require('./models/User');
const TodoModel = require('./models/Todo');
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoURI = 'mongodb+srv://dbAtique:atiqueakhtar@cluster0.y1gn9.mongodb.net/dbSessions?retryWrites=true&w=majority'
const app = express();
const PORT = 3000;
let todoItemEmail;

let date = new Date();
let year = date.getFullYear();
let month = date.getMonth()+1;
let todayDate = String(date.getDate()).padStart(2,'0');
let defaultDate = year + '-' + month + '-' + todayDate;
let selectedDate = defaultDate;

const store = new MongoDbSession({
    uri: mongoURI,
    collection: 'mySessions'
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: "My secret Key",
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.set('view engine', 'ejs');

const isAuth = (req, res, next) => {
    console.log(req.session.isAuth)
    if(req.session.isAuth){
        next();
    }
    else{
        return res.redirect('./login');
    }
}

const cleanAndValidate = (email, password) => {

    return new Promise(async (resolve, reject) => {
        if(typeof email != "string") email = "";
        if(typeof password != "string") password = "";

        if(!email || !password)
            reject("Invalid Data Provided.");

        if(!validator.isEmail(email))
            reject("Invalid Email.");

        if(password.length < 8)
            reject("Password too short.");

        let user = await UserModel.findOne({email});
        if(user)
            reject("User Already Exists.");

        resolve();
    })
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((res) => {
    console.log("Atique's MongoDb connected.");
})

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, phonenumber, gender } = req.body;
    try{
        await cleanAndValidate(email, password);
    }
    catch(err){
        res.send(err);
        return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 13);
    let user = new UserModel({
        firstname, 
        lastname,
        email,
        password: hashedPassword,
        phonenumber,
        gender
    });
    user.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { loginId, password } = req.body;
    console.log(loginId);
    todoItemEmail = loginId;
    let user = await UserModel.findOne({email: loginId});
    console.log(user);
    if(!user){
        return res.send("User not found!");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(isMatch){
        req.session.isAuth = true;
        res.redirect('/dashboard')
    }
    else{
        res.send("Wrong Password!");
    }
});

app.get('/dashboard', isAuth, async (req, res) => {
    console.log("selctedDate: ", selectedDate);
    try {
        let todos = await TodoModel.find({date: selectedDate, email: todoItemEmail});
        console.log(todos);
        return res.render('dashboard', {todos: todos});
    }
    catch(err) {
        res.send({
            status: 400,
            message: "An internal error occured",
            error: err
        });
    }
})

app.post('/select-date', isAuth, (req, res) => {
    
    selectedDate = req.body.date;
    try {
        res.redirect('/dashboard');
    }
    catch(err) {
        res.send({
            status: 400,
            message: "An error has occured",
            error: err
        });
    }
});

app.post('/create-item', isAuth, async (req, res) => {
    console.log(todoItemEmail, req.body);
    let todo = new TodoModel({
        todo: req.body.itemName,
        email: todoItemEmail,
        date: selectedDate
    });

    try {
        let result = await todo.save();
        res.redirect('/dashboard');
    }
    catch(err) {
        res.send({
            status: 400,
            message: "An error has occured",
            error: err
        });
    }
});

app.patch('/edit-item', isAuth, async (req, res) => {

    try {
        let result = await TodoModel.findOneAndUpdate({_id: req.body._id}, {todo: req.body.message});

        res.send({
            status: 200,
            message: "Data updated Successfully",
            data: result
        });
    }
    catch(err) {
        res.send({
            status: 400,
            message: "An error occured cannot update item",
            error: err
        });
    }
});

app.post('/delete-item', isAuth, async (req, res) => {
    try {
        let result = await TodoModel.deleteOne({_id: req.body._id});

        res.send({
            status: 200,
            message: "Data deleted Successfully",
            data: result
        });
    }
    catch(err) {
        res.send({
            status: 400,
            message: "An error occured cannot update item",
            error: err
        });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/');
    })
})

app.listen(PORT, () => {
    console.log(`Listening at PORT ${PORT}`);
})