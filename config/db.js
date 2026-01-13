const mongoose = require('mongoose');

const connectDB =async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Successfully connected to Mongo!');
    }catch(e){
        console.error('❌ Connection Error to Mongo');
        process.exit(1);

    }
}
module.exports = connectDB;