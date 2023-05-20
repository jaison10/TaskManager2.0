const express = require('express')
const User = require('../Models/Users')
const auth = require('../middleware/auth')
const Tasks = require('../Models/Tasks')
const multer = require('multer')
const sharp = require('sharp')

const router  = new express.Router()

router.post('/createUser', async(req, res)=>{
    const newUser = new User(req.body)
    try{
        const token = await newUser.generateToken()
        newUser.Tokens = newUser.Tokens.concat({token})
        await newUser.save()
        res.status(201).send({newUser, token})
    }catch(e){
        res.status(400).send(e)      
    }
})

router.post('/user/login', async(req, res)=>{
    try{
        const foundUser = await User.findByCredentials(req.body.email, req.body.password)
        const token = await foundUser.generateToken()
        foundUser.Tokens = foundUser.Tokens.concat({token})
        await foundUser.save()
        res.status(200).send({foundUser, token})
    }catch(e){
        console.log("ERROR, ", e);
        res.status(400).send({ error : e})
    }
})


router.patch('/updateUser', auth, async(req, res)=>{
    const nonAllowedUpdates = ['name']
    const updatedIncoming = Object.keys(req.body)
    const isNonValidUpdate = updatedIncoming.every((update)=> nonAllowedUpdates.includes(update))

    if(isNonValidUpdate){
        return res.status(400).send({error : 'Invalid input!'})
    }

    try{
        if(!req.user){
            return res.status(404).send()
        }
        updatedIncoming.forEach((update)=>{
            //overwrite received user's values with the value incoming and then save.
            req.user[update] = req.body[update]
        })
        await req.user.save()
        
        res.status(400).send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/getAllUsers', auth, async(req, res)=>{

    try{
        const AllUsers = await User.find({})
        res.send(AllUsers)                     
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/getuser/me', auth, async(req, res) =>{
    if(req.user){
        res.status(200).send(req.user)
    }
})

const upload = multer({
    limits : {
        fileSize : 1000000, //1MB
    },
    fileFilter(req, file, cb){
        const validTypes = ['jpg', 'png', 'jpeg']
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            cb(new Error("Incorrect file type."))
        }
        cb(undefined, true)
    }
})
router.post('/user/me/profile', auth, upload.single('profilepic'), async (req, res)=>{ //here 'profilepic' is the key value under 'form-data' of body of incoming from browser.
    const buffer = await sharp(req.file.buffer).resize({
        width : 250,
        height : 250
    }).png().toBuffer()
   
    req.user.profile = buffer
    await req.user.save()
    res.send()
}, (error, req, res,next )=>{ //whatever error thrown by the middleware will be caught and sent properly to the client.
    res.status(400).send(error.message)
})

router.post('/user/me/deleteprofile', auth, async(req, res)=>{
    req.user.profile = undefined
    await req.user.save()
    res.send()
})

router.post('/user/logout', auth, async(req, res)=>{
    try{
        if(req.user){
            console.log("logout token " , req.token);
            req.user.Tokens = req.user.Tokens.filter((tok)=>{
                console.log("Each token ", tok);
                return tok.token !== req.token
            })
        }
        await req.user.save()
        res.status(200).send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/user/logoutAll', auth, async(req, res)=>{
    try{
        if(req.user){
            req.user.Tokens = []
        }
        await req.user.save()
        res.status(200).send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.delete('/deleteCurUser', auth, async(req, res)=> {
    try{
        const user = await User.findByIdAndDelete(req.user._id)
        if(user){
            res.status(200).send()
            console.log("starting to delete tasks");
            await Tasks.deleteMany({ownerID : req.user._id})
        }else{
            res.status(404).send()
        }

        res.status(200).send()
    }catch(e){
        console.log("Error ", e);
        res.status(500).send(e)
    }
})

router.post('/deleteAll', async(req, res)=>{
    try{
        const results = await User.deleteMany({age : [0,13,23,20,12,10]})
        res.send("deleted")
    }
    catch(e){
        res.send("Deletion failed!")
    }
})

module.exports = router