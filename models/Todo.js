const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    todo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Todo', todoSchema); 