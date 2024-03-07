
const express = require("express")

const app = express()



const twilio = require("twilio")

app.use(express.json())

const port = 8000

const connection = require("../Backend/model/crudModel")

const routesOfUSer = require("../Backend/routes/crudRotes")

async function startSever(){
   
    try{
    await connection;
    console.log("DATABASE_CONNECTION_ESTABLISHED");
    app.use("/api", routesOfUSer)
    app.listen(port,()=>console.log(`SERVER CONNECTION IS ESTABLISHED WITH PORT ${port}`))
    }
    catch(err){
        console.log("ERR WHILE CONNECTING TO DB",err)
    }
}
startSever()


