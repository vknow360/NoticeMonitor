const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Route to fetch examination notices
app.get("/api/notices", async (req, res) => {
    try {
        const response = await axios.get(
            "https://mmmut.ac.in/ExaminationSchedule",
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            }
        );
        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("Error fetching notices:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch notices",
        });
    }
});

// Health check route
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
