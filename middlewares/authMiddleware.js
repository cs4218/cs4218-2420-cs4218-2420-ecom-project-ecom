import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected routes token base
export const requireSignIn = async (req, res, next) => {
    try {
        if (!req.headers.authorization) { 
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const token = req.headers.authorization.replace(/^Bearer\s+/, ""); // handles "Bearer xyz"
        const decode = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

//admin access
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }
        const user = await userModel.findById(req.user._id);
        if(user.role !== 1) {
            return res.status(403).json({
                success: false,
                message: "UnAuthorized Access",
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            error,
            message: "Error in admin middleware",
        });
    }
};