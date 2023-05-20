const express = require('express')
const Tasks = require('../Models/Tasks')
const auth = require('../middleware/auth')
const router  = new express.Router()

router.patch('/updateTask/:id', auth, async(req, res)=>{
    const incomingUpdates = Object.keys(req.body)
    const _id = req.params.id
    try{
        //const updatedTask = await Tasks.findByIdAndUpdate(_id, req.body, {new : true, runValidators : true}) //new -returns modified data rather than the original.

        const task = await Tasks.findOne({_id, ownerID : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        incomingUpdates.forEach((update)=>{
            task[update] = req.body[update]
        })
        task.save()
        res.status(400).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})


router.post('/createTask',auth, async(req, res)=>{
    //const newTask = new Tasks(req.body)
    const newTask = new Tasks({
        ...req.body,
        ownerID : req.user._id
    })
    try{
        await newTask.save()
        res.status(201).send("new Task Added : ")
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/getAllTasks', auth, async (req, res)=>{
    try{
        // const AllTasks = await Tasks.find({
        //     ownerID : req.user._id,
        //     completed : req.query.completed
        // })
        // res.send(AllTasks)

        //OR
        const match = {}
        const sort = {}
        if(req.query.completed){
            match.completed = req.query.completed
        }
        if(req.query.sortBy){
            let parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }

        await req.user.populate({  //calling the virtual function which has a link to tasks
            path : 'mytasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),     //skips the given number of items and displays number of items as per limit value.
                sort
            },
        })
        res.status(200).send(req.user.mytasks)
    }catch(e){
        console.log(e);
        res.status(500).send(e)
    }
})

router.get('/getTask/:id', auth, async(req, res)=>{
    const _id = req.params.id
    //here _id neednt be converted to an object manually as the mongoose itself does it for us as we know that the _id in server is an object
    try{
        const TaskByID = await Tasks.findOne({_id, ownerID : req.user._id})
        if(!TaskByID){
            return res.status(400).send("Not found!")
        }else{
            res.status(200).send(TaskByID)
        }
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/deleteAllTasks', auth, async(req,res)=>{
    try{
        await Tasks.deleteMany({ownerID : req.user._id})
        res.status(200).send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/deleteTask/:id', auth, async(req,res)=>{
    try{
        const task = await Tasks.findOneAndDelete({_id : req.params.id, ownerID : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send()
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router