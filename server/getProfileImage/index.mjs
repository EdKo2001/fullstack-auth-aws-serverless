import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

const s3 = new S3Client({ region: "us-east-2" });
const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);

const SECRET_KEY = process.env.JWT_SECRET;
const S3_BUCKET = process.env.S3_BUCKET_NAME;

export const handler = async (event) => {
  try {
    const token = event.headers?.Authorization?.split(" ")[1];
    if (!token) {
      return { statusCode: 401, body: "Unauthorized: No token provided" };
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    const { Item } = await dynamoDb.send(
      new GetCommand({
        TableName: "Users",
        Key: { email },
      })
    );

    if (!Item || !Item.profileImage) {
      return { statusCode: 404, body: "User or profile image not found" };
    }

    const fileKey = Item.profileImage.split("/").at(-1); // Extract S3 file name

    // Fetch image from S3
    const s3Command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
    });
    const { Body, ContentType } = await s3.send(s3Command);

    if (!Body) {
      return { statusCode: 404, body: "Image not found in S3" };
    }

    // Convert the image to base64
    const byteArray = await Body.transformToByteArray();
    const base64Image = Buffer.from(byteArray).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": ContentType,
      },
      body: base64Image,
      isBase64Encoded: true, // Important for images
    };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
