const express = require("express");
const cors = require('cors');
const mysql = require("mysql");
const path = require("path");
require('dotenv').config({path: './.env'});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serverar statiska filer från 'public'-mappen
app.use(express.urlencoded({ extended: true }));

// Skapar en MySQL-anslutning
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_ACC,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

connection.connect(err => {
    if (err) {
        console.error("Connection failed: " + err);
        return;
    }
    console.log("Connected to MySQL");
});

// Routes
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to my REST API' });
});

app.get('/api/cv', (req, res) => {
    connection.query("SELECT * FROM cv", (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Ett fel uppstod när cv:et skulle hämtas." });
        }
        res.json(rows);
    });
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.post('/api/cv', (req, res) => {
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;
    if (companyname && jobtitle && location && startdate && enddate && description) {
        connection.query("INSERT INTO cv (companyname, jobtitle, location, startdate, enddate, description) VALUES (?, ?, ?, ?, ?, ?)",
            [companyname, jobtitle, location, startdate, enddate, description], (error, results) => {
                if (error) {
                    console.error('Error inserting into cv:', error);
                    return res.status(500).json({ error: "Kunde inte lägga till i databasen." });
                }
                res.status(201).json({ message: "Data tillagd i cv" });
            });
    } else {
        res.status(400).json({ error: "Du måste fylla i alla fält!" });
    }
});

app.delete('/api/cv/:id', (req, res) => {
    const cvId = req.params.id;
    connection.query('DELETE FROM cv WHERE id = ?', [cvId], (error, results) => {
        if (error) {
            console.error('Error deleting from cv:', error);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, message: 'CV post raderad' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
