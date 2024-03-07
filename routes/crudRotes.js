const express = require("express")
const VerifyToken = require("../middleware/loginMiddleWare")
const router = express.Router()
const{
    getAllUsers,
    singleUser,
    signUpUser,
    loginUser,
    deleteUser
} = require("../controller/crudController")

/*****ALL USERS GET API  **************/
router.get("/users",VerifyToken,getAllUsers)
/**************************************/

/*** TO GET A SINGLE USER ******/
router.get("/users/:id",VerifyToken,singleUser )
/**********************************/

/*** SIGNUP API  *****************/
router.post("/newuser",signUpUser)
/*********************************/


/********LOGIN API ******************/
router.post("/login",loginUser)  
/************************************/


/******* DELETE USER API **************/
router.delete("/deleteuser/:id",VerifyToken,deleteUser)
/*************************************/

module.exports = router




