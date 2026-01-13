const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
    numTicket: { type:String, required: true, trim: true },
    fechaHora: { type: Date, required: true, default: Date.now},
    productos: { type: [String], default: []},
    total: { type:String, require: true , trim: true},
});
module.exports = mongoose.model('ticket', ticketSchema);