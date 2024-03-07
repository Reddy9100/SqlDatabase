const jwt = require("jsonwebtoken")

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

module.exports = VerifyToken