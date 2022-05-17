module.exports = {
  type: "service_account",
  project_id: process.env.FIREBASEPROJID,
  private_key_id: process.env.FIREBASEPKID,
  private_key: process.env.FIREBASEPK,
  client_email: "firebase-adminsdk-4tqtw@cerv19.iam.gserviceaccount.com",
  client_id: process.env.FIREBASECLIENTID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASECERTURL
}
