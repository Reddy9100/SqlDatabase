const connection = require("../model/crudModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
    try {
        const query = "SELECT * FROM users;";
        const [rows, _] = await connection.query(query);
        res.status(200).json({ users: rows });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const singleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "SELECT * FROM users WHERE id = ?";
        const [rows, _] = await connection.query(query, [userId]);
        if (rows.length === 0) {
            res.status(400).json({ error: "No User found with that Id" });
            return;
        }
        const personData = rows[0];
        res.json(personData);
    } catch (error) {
        console.error("Error retrieving user data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const signUpUser = async (req, res) => {
    try {
        const { id, name, cityId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query1 = "SELECT * FROM users WHERE id = ?";
        const [existingUsers, _] = await connection.query(query1, [id]);
        if (existingUsers.length !== 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const query = "INSERT INTO users (id, name, cityId, password) VALUES (?, ?, ?, ?)";
        await connection.query(query, [id, name, cityId, hashedPassword]);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating new user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { userId, password } = req.body;
        if (!userId || !password) {
            return res.status(400).json({ error: "userId and password are required" });
        }

        const query = "SELECT * FROM users WHERE id = ?";
        const [rows, _] = await connection.query(query, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];
        const hashedPassword = user.password;

        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (isPasswordValid) {
            const token = jwt.sign({ userId: user.id }, "Dataevolve@112", { expiresIn: "10h" });
            return res.status(200).json({ message: "Login successful", token });
        } else {
            return res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const query = "DELETE FROM users WHERE id = ?";
        const [result, _] = await connection.query(query, [userId]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "User Already Removed" });
        }
        res.status(200).json({ message: `User with ${userId} is removed successfully` });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    getAllUsers,
    singleUser,
    signUpUser,
    loginUser,
    deleteUser
};

