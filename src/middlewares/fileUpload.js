// /server/middleware/uploadMiddleware.js

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const trackingNumber = req.body.trackingNumber; // Get the tracking number from the request body
        if (!trackingNumber) {
            return cb(new Error('Tracking number is required'), false);
        }

        const refundImagesDir = path.join(__dirname, '../public/refund_images', trackingNumber);

        fs.mkdirSync(refundImagesDir, { recursive: true });

        cb(null, refundImagesDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).array('proofImages', 5); // Limit to 5 images

module.exports = upload;
