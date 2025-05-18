const express = require("express");
const multer = require("multer");

const transporter = require("../utils/emailing");

const router = express.Router();

require("dotenv").config();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf", "image/png", "image/jpeg", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/xml", "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain", "text/csv"
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported file type"));
        }
    },
});

router.post("/sendnewproject", upload.array("attachments"), async (req, res) => {

    const fields = req.body;
    const files = req.files;

    const attachments = files?.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
    }));

    const textBody = Object.entries(fields)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Project Submission from ${fields.name || "unknown user"}`,
            text: textBody,
            attachments,
        });

        res.status(200).json({ message: "Email sent", info });
    } catch (error) {
        console.error("Email send failed:", error);
        res.status(500).json({ message: "Email sending failed", error: error.message });
    }

});

router.post("/sendmessage", express.json(), async (req, res) => {
    console.log(req.body);
    const fields = req.body;
    const textBody = Object.entries(fields)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Project Submission from ${fields.name || "unknown user"}`,
            text: textBody,
        });

        res.status(200).json({ message: "Email sent", info });
    } catch (error) {
        console.error("Email send failed:", error);
        res.status(500).json({ message: "Email sending failed", error: error.message });
    }
});


module.exports = router;