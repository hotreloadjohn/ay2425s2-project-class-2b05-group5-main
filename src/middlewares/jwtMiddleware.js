require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;   
const tokenAlgorithm = process.env.JWT_ALGORITHM;

// The generateToken function generates a token using the payload and options provided.
module.exports.generateToken = function (req, res, next) {

    const payload = {
        member_id: res.locals.member_id,
        username: res.locals.username,
        role: res.locals.role,
        timestamp: new Date()
    };

    const options = {
        algorithm: tokenAlgorithm,
        expiresIn: tokenDuration,
    };

    const callback = (err, token) => {
        if (err) {
            console.error("Error jwt:", err);
            res.status(500).json(err);
        } else {
            res.locals.token = token;
            next();
        }
    };

    const token = jwt.sign(payload, secretKey, options, callback);
};

// The sendToken function sends the token to the client.
module.exports.sendToken = function (req, res, next) {
    res.status(200).json({
        message: res.locals.message,
        token: res.locals.token,
        username: res.locals.username,
        member_id: res.locals.member_id,
        role: res.locals.role,
    });
};

// The verifyToken function verifies the token provided in the request header.
module.exports.verifyToken = function (req, res, next){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    const callback = function (err, decoded) {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }

        res.locals.username = decoded.username;
        res.locals.member_id = decoded.member_id,
        res.locals.role = decoded.role;
        res.locals.tokenTimestamp = decoded.timestamp;

        next();
    };

    jwt.verify(token, secretKey, callback);
};

// The verifyIsAdmin function checks if the user has the administrator role.
module.exports.verifyIsAdmin = function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "your-secure-jwt-secret");
  
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
      }
  
      req.user = decoded; // Attach user info to the request
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };