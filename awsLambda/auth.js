const jwt = require('jsonwebtoken')
const fs = require('fs')
const cert = fs.readFileSync('dev-3sdvkvha.pem')

exports.handler = async (event) => {

    try {
        console.log("Inside Lambda Fn!");
        if (event.httpMethod == 'POST') {
            let token = event.headers.Authorization
            if (!token) {
                const response = {
                    statusCode: 401,
                    body: JSON.stringify("User not Authenticated!")
                }
                return response;
            } else {
                token = token.split(' ')[1]

                try {
                    const veri = jwt.verify(token, cert);

                    const response = {
                        statusCode: 200,
                        body: veri.sub
                    }
                    // let response;
                    // return response.statusCode(200).json({message: "User authorized!", id: veri.sub});

                    return response;

                } catch (error) {

                    const response = {
                        statusCode: 401,
                        body: JSON.stringify("User not Authenticated!")
                    }
                    return response;
                }
            }

        }
    } catch (error) {
        return error
    }

}