require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const IPv4 = process.env.IPv4;
const PORT_BE = process.env.PORT_BE;
const PORT_FE = process.env.PORT_FE;

const app = express();
const http = require('http').createServer(app);

app.use(cors({
    origin: `http://${IPv4}:${PORT_FE}`,
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/scenarios', require('./routes/scenario'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/user', require('./routes/user'));

connectDB();

http.listen(PORT_BE, () => console.log(`🚀 Server running on http://${IPv4}:${PORT_BE}`));
