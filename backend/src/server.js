const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/memoryDatabase');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events')); // Add this line

app.use(errorHandler);

app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/qr', require('./routes/qr'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));