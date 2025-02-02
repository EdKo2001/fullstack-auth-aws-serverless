import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(ddbClient);
const SECRET_KEY = process.env.JWT_SECRET;

export const handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "Users",
        Key: { email },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const isValid = await bcrypt.compare(password, result.Item.password);
    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        user: {
          name: result.Item.name,
          email: result.Item.email,
          profileImage: result.Item.profileImage,
        },
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
