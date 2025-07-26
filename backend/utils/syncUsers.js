// utils/syncUsers.js
import mongoose from "mongoose";
import { userSchema } from "../models/userModel.js"; // 👈 Import schema directly
import dotenv from "dotenv";
dotenv.config();



// ✅ Setup two MongoDB connections with best options
const localDB = mongoose.createConnection(process.env.MONGODB_LOCAL_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

const atlasDB = mongoose.createConnection(process.env.MONGODB_ATLAS_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});



// ✅ Get User models for both DBs using the same schema
const LocalUser = localDB.model("User", userSchema);
const AtlasUser = atlasDB.model("User", userSchema);

// ✅ Get sync direction: 'toLocal' or 'toAtlas'
const direction = process.argv[2];



const syncUsers = async (fromModel, toModel, directionLabel) => {
   const sourceUsers = await fromModel.find();
   console.log(`📦 Found ${sourceUsers.length} users to sync (${directionLabel})`);

   for (const user of sourceUsers) {
      const userObj = user.toObject();
      delete userObj.__v; // ✅ Good practice to avoid version conflicts

      try {
         await toModel.updateOne(
            { _id: user._id },
            { $set: userObj },
            { upsert: true }
         );

         console.log(`${user.name}:`, "✅");

      } catch (err) {
         console.error(
         `${"❌"} Failed to sync user ${user._id}- ${user.name}:`,
         err.message
         );
      }
   }

   console.log(`✅ Sync ${directionLabel} complete`);
};




const run = async () => {
   try {
      await Promise.all([localDB.asPromise(), atlasDB.asPromise()]);
      console.log("🔌 Connected to both databases");

      if (direction === "toLocal") {
         await syncUsers(AtlasUser, LocalUser, "Atlas → Local");
      } else if (direction === "toAtlas") {
         await syncUsers(LocalUser, AtlasUser, "Local → Atlas");
      } else {
         console.log("❌ Invalid direction. Use: toLocal or toAtlas");
      }

      await Promise.all([localDB.close(), atlasDB.close()]);
      console.log("🔒 Database connections closed");

   } catch (err) {
      console.error("❌ Sync failed:", err);
   }
};

run();

// node utils/syncUsers.js toLocal   # ✅ Copies data from Atlas → Local
// node utils/syncUsers.js toAtlas   # ✅ Copies data from Local → Atlas

// node <space> utils/syncUsers.js <space> toLocal / toAtlas
