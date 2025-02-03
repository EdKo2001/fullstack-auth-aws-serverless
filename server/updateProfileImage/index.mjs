import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";

const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);
const s3 = new S3Client({ region: "us-east-2" });

const SECRET_KEY = process.env.JWT_SECRET;
const S3_BUCKET = process.env.S3_BUCKET_NAME;

export const handler = async (event) => {
  try {
    const token = event.headers.Authorization.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const { fileType = "image/jpeg" } = JSON.parse(event.body);

    const fileExtension = fileType.split("/")[1] || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileName,
      ContentType: fileType,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const profileImageUrl = `https://${S3_BUCKET}.s3.us-east-2.amazonaws.com/${fileName}`;
    await dynamoDb.send(
      new UpdateCommand({
        TableName: "Users",
        Key: { email },
        UpdateExpression: "SET profileImage = :profileImage",
        ExpressionAttributeValues: {
          ":profileImage": profileImageUrl,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        presignedUrl,
        profileImage: profileImageUrl,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized or invalid request" }),
    };
  }
};
