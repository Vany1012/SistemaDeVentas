const vendedorSchema = new mongoose.Schema({
    vendedorName: { type:String, required: true, trim: true },
    vendedorId: { type:String, require: true , trim: true},
    role:{type: String, required: true, enum: ['admin', 'vendedor'], default: "vendedor" },
    email : {type:String, required: true, unique: true},
    password : {type: String, required: true},
    active: { type: Boolean, default: true}

});

module.exports = mongoose.model('vendedor', vendedorSchema);