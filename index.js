const express = require("express")

const app = express()

const bcrypt= require("bcrypt")

const jwt = require("jsonwebtoken")

const twilio = require("twilio")

app.use(express.json())

const connection = require("./database")
  


app.listen(8000,async ()=>{

    console.log("Server is connected")

   await connection.connect(function(err){
        if(err){
            console.log("error connection to the database",err.message)
            return
        }
        console.log("database is connected")

    })

})





//to get data from the table 

app.get("/users",VerifyToken,async(req,res)=>{
    const query = "select * from employees;"
    connection.query(query,function(err,results){
        if(err) throw new Error;
        res.send(results)
    })
})




// to get a single person data
app.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "SELECT * FROM employees WHERE employee_id = ?";
        await connection.query(query, [userId],function(err,rows,feilds){
            if(err){
                res.status(500).json({error : "Internal server error"})
                return
            }
            if(rows.length === 0){
                res.status(400).json({error : "No employee is found with that Id"})
                return
            }

        const personData = rows [0]
        res.json(personData)
        });
    } catch (error) {
        console.error("Error retrieving user data:", error);
        res.status(500).send("Internal Server Error");
    }
});




//Sign up api


app.post("/newuser",VerifyToken, async (req, res) => {
    try {
        const { first_name, last_name, department_id,salary ,password } = req.body;

        const hashedPassword = await bcrypt.hash(password,10)

        // Check if the user already exists based on employee_id and first_name
        const query1 = "SELECT * FROM employees WHERE last_name = ? or first_name = ?";
        await connection.query(query1, [last_name, first_name], async (err, results) => {
            if (err) {
                console.error("Error checking user existence:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (results.length !== 0) {
                return res.status(400).json({ error: "User already exists" });
            }

            // If the user does not already exist, insert the new user into the database
            const query = "INSERT INTO employees (first_name, last_name, department_id, salary,passwords) VALUES (?, ?, ?, ?, ?)";
            await connection.query(query, [ first_name, last_name, department_id,salary ,hashedPassword]);
             res.status(201).json({ message: "User created successfully" });
        });
    } catch (err) {
        console.error("Error creating new user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});




// to delete a user from the database

app.delete("/deleteuser/:id",async(req,res)=>{
    try{
        const employee_id = req.params.id;
        const query = "delete from employees where employee_id = ?";
        await connection.query(query,[employee_id],(err,results)=>{
            if (err) {
               return res.status(500).json({error:"Internal server error"})
            }
            else{
                if(results.affectedRows === 0){
                  return res.status(400).json({error: "User Already Removed"})
                }
            }
            res.status(200).json({message : `user with ${employee_id} is removed successfully`})

        })


    }
    catch(err){
        console.log("error is",err.message)
        res.status(500).json({error:"Internal server error"})
    }
})





//to update a user name using put method


app.put("/updateuser/:id",async(req,res)=>{
    try{
        const employee_id = req.params.id;
        const{first_name,last_name} = req.body;
        const query = "update employees set first_name = ?,last_name = ? where employee_id = ?";
        await connection.query(query,[first_name,last_name,employee_id],function(err,results){
            if(err){
                res.status(500).json({error:"Internal server error"})
            }
            else{
                res.status(200).json({message:`user with ${employee_id} updated successfully`})
            }
        })
    }
    catch(err){
        res.status(500).json({error:"Internal server error"})
        console.log("error is",err.message)
    }
})





//login api

app.post("/login", async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            console.log("yes")
            return res.status(400).json({ error: "userId and password are required" });

        }

        // Fetch user from the database based on the userId
        const query = "SELECT * FROM employees WHERE employee_id = ?";
        await connection.query(query, [userId],async (err, results) => {
            if (err) {
                console.error("Error retrieving user data:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            // Check if the user exists
            if (results.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = results[0];
            console.log(user)
            const hashedPassword = user.passwords;
            console.log(hashedPassword)

            // Compare the provided password with the hashed passwordrs
            const isPasswordValid = await bcrypt.compare(password, hashedPassword);
            console.log(isPasswordValid)

            if (isPasswordValid) {
                // Passwords match, generate a JWT token
                const token = jwt.sign({ userId: user.employee_id }, "Dataevolve@112", { expiresIn: "1h" });
                return res.status(200).json({ message: "Login successful", token });
            } else {
                // Passwords don't match
                return res.status(401).json({ error: "Invalid username or password" });
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//opt sending and the otp verification  


app.post("/otpSend", async (req, res) => {
    const { number } = req.body;
    const receiver = `+91${number}`
    try {
const accountSid = "AC9c547b52c117b740d49f8f0fee128996";
const authToken = "8886015fbf88bf01092dad3af7709098";
const verifySid = "VAe957993352552c67c137f56469ace9f4";
const client = require("twilio")(accountSid, authToken);

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: receiver, channel: "sms" })
  .then((verification) => console.log(verification.status))
  .then(() => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: receiver, code: otpCode })
        .then((verification_check) =>{
            if(verification_check.status === "approved"){
                console.log("Otp is verified")
            }
            else{
                console.log("InValid Otp")
            }
        })
        .then(() => readline.close());
    });
  });

    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


//token verification

const secretKey = "Dataevolve@112"
function VerifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Authorization Denied: Header format incorrect");
        return res.status(401).json({ error: "Authorization denied" });
    }
    
    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    try {
        const result = jwt.verify(token, secretKey);
        console.log("Token Verified:", result);
        req.user = result;
        next();
    } catch (err) {
        console.error("Token Verification Error:", err);
        return res.status(401).json({ error: "Invalid Token" });
    }
}






