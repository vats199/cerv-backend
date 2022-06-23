const fs = require('fs');

const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.catererBucketName;
const region = process.env.AWSBucketRegion;
const accessKey = process.env.AWSUserAccessKey;
const secretKey = process.env.AWSUserSecretKey;

const s3 = new S3({
    region,
    accessKeyId: accessKey,
    secretAccessKey: secretKey
})

function uploadFile(file){
    const fileStream = fs.createWriteStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }
    
    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile;

function getFileStream(fileKey) {
    const downloadParams = {
      Key: fileKey,
      Bucket: bucketName
    }
  
    return s3.getObject(downloadParams).createReadStream()
  }
  exports.getFileStream = getFileStream

