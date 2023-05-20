const jwt = require('jsonwebtoken')
const User = require('../Models/Users')

const auth = async(req, res, next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ','') //receiving header being sent where Authorization is the key
        console.log("Incoming token for auth : " , token);
        const decoded = jwt.verify(token, process.env.TOKENKEY) //the decoded will have the _id of the user.
        const user = await User.findOne({ "_id" : decoded._id, "Tokens.token" : token})
        if(user){
            req.token = token
            req.user = user
            next()
        }else{
            throw new Error()
        }
        
    }catch(e){
        res.status(401).send({ error : 'Please Authenticate!'})
    }
}

module.exports = auth