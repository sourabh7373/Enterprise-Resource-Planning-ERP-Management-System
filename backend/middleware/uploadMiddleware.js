const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
const profileDir = path.join(uploadDir, 'profiles');
const docDir = path.join(uploadDir, 'documents');

[uploadDir, profileDir, docDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, profileDir);
    } else {
      cb(null, docDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage') {
    if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed for profile image!'), false);
    }
  } else if (file.fieldname === 'documents') {
    if (['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document type! Only PDF, Word and image documents are allowed.'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
