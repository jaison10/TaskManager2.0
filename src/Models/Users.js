const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./Tasks')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim : true
    },
    age : {
        type : Number,
        validate(value){
            if (value < 0){
                throw new Error("Age must be positive.")
            }
        }
    },
    email : {
        type : String, 
        trim : true,
        lowercase : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){ //validator is in-built library for validations.
                throw new Error("Mail is Invalid.")
            }
        }
    },
    password : {
        type: String,
        trim : true,
        required : true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter Stronger Password!")
            }
        }
    },
    Tokens : [{
        "token" : {
            type : String,
            required : true
        }
    }],
    profile : {
        type : Buffer
    }
}, {
    timestamps : true
})

//this is a virtual property of user schema -this creates a relationship b/w User and Tasks.
userSchema.virtual("mytasks", {
    ref : "Tasks",
    localField : "_id",      // here _id stores the user id.
    foreignField : "ownerID" //in tasks, ownerID stores the user id
    // ----------------------  this is how the relationship is established.
})

//statics makes it a Model function - which is accessible in the entire model.
userSchema.statics.findByCredentials = async (email, password)=>{
        const user = await User.findOne({"email" : email})
        if(!user){
            throw new Error('User not found!')
        }
        const isMatched =await bcrypt.compare( password, user.password)
        if(!isMatched){
            throw new Error('Password not matched!')
        }
        return user
}

//methods makes the function specific for an instance of the Model.
userSchema.methods.generateToken = async function(){
    return  jwt.sign({_id : this._id.toString()}, process.env.TOKENKEY , {expiresIn: '1h'} )
}

//This will be auto called when res.send is done for the user data.
//when sending data to the user, some fields are hidden from user, that is being done here.
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.Tokens

    return userObject
}

//middleware which does this operation 'before' 'saving' value to the database.
userSchema.pre('save', async function(next){
    const currentUser = this
    console.log(currentUser);
    if(currentUser.isModified('password')){
        console.log(currentUser.password);
        const hashedPass = await bcrypt.hash(currentUser.password, 8)
        console.log("hased pass : ",  hashedPass);
        currentUser.password = hashedPass
    }
    next()
})


const User = mongoose.model('User', userSchema);

module.exports = User