 const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('id_venta').populate('id_producto');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTicket = async (req, res) => {
    try {
        const ticket = new Ticket(req.body);
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getTickets, createTicket };