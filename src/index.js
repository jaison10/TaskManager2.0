const express = require('express')
require("./db/mongoose")
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
 
var bodyParser = require('body-parser')

const app = express();

const port = process.env.PORT

//MIDDLEWARE which runs before the route is fired. - moved to middleware folder.
// app.use((req, res, next)=>{
//     if(req.method == 'POST'){
//         return console.log("Get requests are disabled.");
//     }
//     next() //the route will be executed only if this is called.
// })

app.use(bodyParser.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, ()=>{
    console.log("Listenng to PORT ", port);
})




