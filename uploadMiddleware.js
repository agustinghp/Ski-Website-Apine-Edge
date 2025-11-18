const multer = require('multer');
const sharp = require('sharp');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configure Cloudflare R2 Client (S3-compatible)
// R2 offers free egress (bandwidth), making it more cost-effective than S3
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT, // e.g., https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // Your R2 public URL or custom domain

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Upload buffer to R2
const uploadToR2 = async (buffer, key, contentType = 'image/jpeg') => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
    });

    await r2Client.send(command);
    
    // Return the public URL
    // Use custom domain if configured, otherwise use R2 public URL
    return `${PUBLIC_URL}/${key}`;
};

// Delete image from R2
const deleteFromR2 = async (imageUrl) => {
    try {
        // Extract the key from the URL
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('Error deleting from R2:', error);
    }
};

// Process and save profile image
const processProfileImage = async (buffer, userId) => {
    const filename = `profiles/profile-${userId}-${Date.now()}.jpg`;

    // Process image with sharp
    const processedBuffer = await sharp(buffer)
        .resize(400, 400, {
            fit: 'cover',
            position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();

    // Upload to R2
    const imageUrl = await uploadToR2(processedBuffer, filename);
    return imageUrl;
};

// Process and save product image
const processProductImage = async (buffer, productId, index = 0) => {
    const filename = `products/product-${productId}-${index}-${Date.now()}.jpg`;

    // Process image with sharp
    const processedBuffer = await sharp(buffer)
        .resize(600, 600, {
            fit: 'cover',      // Always exactly 600x600
            position: 'center' // Centers the crop
        })
        .jpeg({ quality: 85 })
        .toBuffer();

    // Upload to R2
    const imageUrl = await uploadToR2(processedBuffer, filename);
    return imageUrl;
};

// Process and save service image
const processServiceImage = async (buffer, serviceId, index = 0) => {
    const filename = `services/service-${serviceId}-${index}-${Date.now()}.jpg`;

    // Process image with sharp
    const processedBuffer = await sharp(buffer)
        .resize(600, 600, {
            fit: 'cover',      // Always exactly 600x600
            position: 'center' // Centers the crop
        })
        .jpeg({ quality: 85 })
        .toBuffer();

    // Upload to R2
    const imageUrl = await uploadToR2(processedBuffer, filename);
    return imageUrl;
};

// Delete image (wrapper function)
const deleteImage = async (imageUrl) => {
    await deleteFromR2(imageUrl);
};

module.exports = {
    upload,
    processProfileImage,
    processProductImage,
    processServiceImage,
    deleteImage
};
