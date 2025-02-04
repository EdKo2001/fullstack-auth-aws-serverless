import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);
const s3 = new S3Client({ region: "us-east-2" });

const SECRET_KEY = process.env.JWT_SECRET;
const S3_BUCKET = process.env.S3_BUCKET_NAME;

export const generatePresignedUrl = async (filename, fileType) => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: filename,
    ContentType: fileType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
};

export const handler = async (event) => {
  try {
    const {
      name,
      email,
      password,
      fileType = "image/jpeg",
    } = JSON.parse(event.body);

    // Check existing user
    const existingUser = await dynamoDb.send(
      new GetCommand({ TableName: "Users", Key: { email } })
    );
    if (existingUser.Item) throw new Error("User already exists");

    // Generate unique filename
    const fileExtension = fileType.split("/")[1] || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(fileName, fileType);

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImageUrl = `https://${S3_BUCKET}.s3.us-east-2.amazonaws.com/${fileName}`;

    await dynamoDb.send(
      new PutCommand({
        TableName: "Users",
        Item: {
          name,
          email,
          password: hashedPassword,
          profileImage: profileImageUrl,
        },
      })
    );

    const token = jwt.sign({ email, name }, SECRET_KEY, { expiresIn: "1h" });

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        token,
        user: { name, email, profileImage: profileImageUrl },
        presignedUrl,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.message === "User already exists" ? 400 : 500,
      body: JSON.stringify({
        message: error.message || "Internal server error",
      }),
    };
  }
};
