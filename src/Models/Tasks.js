const mongoose = require('mongoose')

const TasksSchema = new mongoose.Schema({
    desc : {
        type : String, 
        required : true 
    },
    completed : {
        type : Boolean,
        default : false
    },
    ownerID :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User' //this creates a link to user model.
    }
}, {
    timestamps : true
})

const Tasks = new mongoose.model('Tasks', TasksSchema)

module.exports = Tasks