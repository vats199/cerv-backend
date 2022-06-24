

exports.handler = async(event, callback)=>{

    try {
            console.log("Inside Lambda Fn!");
            // if(event.httpMethod=='GET'){
                const db = require('./db');
                console.log("database connected");
            const dbCon = await db.sequelize.sync()
            const response = {
                statusCode: 200, 
                body: JSON.stringify("database connected")
            }
            console.log('Hi');
            return response;

    // }
        } catch (error) {
            return error
        }

}