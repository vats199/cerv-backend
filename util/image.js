const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudname,
  api_key: process.env.cloudAPI,
  api_secret: process.env.cloudSecret,
});

module.exports = cloudinary;