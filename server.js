const express = require("express");
const app = express();
const connectDB = require("./config/db");

connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("Hello World"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));

// Define Routes
app.use("/api/users", require("./routes/Users"));
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/contacts", require("./routes/Contacts"));
