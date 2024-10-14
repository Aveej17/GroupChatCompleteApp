const jwt = require('jsonwebtoken');
const getTokenFromHeader = require('../utils/getTokenFromHeader');
const verifyToken = require('../utils/verifyToken');

const { UserGroup } = require('../models');
// const { UserGroup } = require('../models/userGroups');

exports.authentication = (req, res, next) => {
    // console.log("Body:", req.body);
    // console.log("In auth printing headers");
    
    // console.log("Headers:", req.headers);

    const token = getTokenFromHeader(req);
    const decodedUser = verifyToken(token);
    // console.log(decodedUser);
    

    if (!decodedUser) {
        return res.status(401).json({ message: 'Invalid/Expired token, please login again' });
    }

    // console.log(decodedUser.id + " DU");
    const authId = decodedUser.id;

    

    req.body.authId = authId;

    // req.authId = authId;
    // console.log(req.authId);
    
    
    // console.log(req.body.authId);

    next();
}

 // Adjust import as necessary
 // Correct import from index.js

 exports.isAdmin = async (req, res, next) => {
     console.log("checking access");
     
     const userId = req.body.authId; // Get user ID from the authenticated user
     const groupId = req.params.groupId; // Get group ID from the request parameters
    //  console.log(userId);
    //  console.log(groupId);
    //  console.log("UserGroup:", UserGroup); // Should now log the UserGroup model
 
     try {
         // Find the user in the UserGroup table for the specified group
         const userGroup = await UserGroup.findOne({
             where: {
                 userId,
                 groupId
             }
         });
 
        //  console.log(userGroup); // This should log the userGroup object if found
         
         // Check if the userGroup entry exists and if they are an admin
         if (!userGroup || !userGroup.isAdmin) {
             return res.status(403).json({ success: false, message: "Access denied" });
         }
 
         next();
     } catch (error) {
         console.error("Error checking admin status:", error);
         return res.status(500).json({ success: false, message: "Internal server error" });
     }
 };
 