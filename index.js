
const express = require("express")

const app = express()

app.use(express.json())

const port = 8000

const connection = require("./model/crudModel")

const routesOfUSer = require("./routes/crudRotes")

async function startSever(){
   
    try{
    await connection;
    console.log("DATABASE_CONNECTION_ESTABLISHED");
   
    app.listen(port,()=>console.log(`SERVER CONNECTION IS ESTABLISHED WITH PORT ${port}`))
    }
    catch(err){
        console.log("ERR WHILE CONNECTING TO DB",err)
    }
}
startSever()

app.get("/",(req,res)=>{
   res.send("Hello world")
})

app.use("/api", routesOfUSer)
