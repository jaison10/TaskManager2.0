const { MongoClient, ObjectId } = require('mongodb');
// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'task-manager';
const id = new ObjectId()
console.log(id);
async function main() {
    try{
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        // const collection = await db.collection('users').insertOne({
        //     _id : id,
        //     name : "John 3"
        // });
        // console.log(collection);

        // var tasks = await db.collection('tasks').insertMany([
        //     {
        //         Desc : 'Learn ASP.Net',
        //         Completed : false
        //     },
        //     {
        //         Desc : 'NodeJS deep',
        //         Completed : false
        //     }
        // ])
        // console.log(tasks);

        console.log( db.collection('users').find({name : "John"}));
    }catch(error){
        console.log("Error occured", error);
        client.close
    }
    return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());

