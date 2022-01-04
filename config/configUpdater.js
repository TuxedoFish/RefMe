import AWS from "aws-sdk";

// Makes request to S3 bucket to get app config
const getConfig = () => {
    return new Promise(async (resolve, reject) => {
        // This bucket should always exist
        S3_BUCKET = "liversedge-application-configs";
        S3_FILE_NAME = "refme.txt";

        // Initialize the Amazon Cognito credentials provider
        const region = "eu-west-2";
        AWS.config.update({
            region,
            credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: "eu-west-2:14d6cdae-3602-457b-b791-3c66c8d1c62b",
            })
        });

        var params = {
            Bucket: S3_BUCKET,
            Key: S3_FILE_NAME
        }

        // Create a new service object
        var s3 = new AWS.S3();

        s3.getObject(params, function(err, data) {
            // Handle any error and exit
            if (err)
                reject(err);

            // No error happened
            // Convert Body from a Buffer to a String
            let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
            resolve(objectData)
        });
    });
}

export { getConfig }