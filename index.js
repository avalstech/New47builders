// index.js (Node.js 18)

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "47BuildersProjectLeads";

// Index names
const GSI_COUNTRY_CREATED_AT = "GSI_CountryCreatedAt";
const GSI_DATE_BUCKET_CREATED_AT = "GSI_DateBucketCreatedAt";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-admin-token",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
    }

    // Simple placeholder admin token check (optional but recommended)
    // Set ADMIN_TOKEN as an environment variable in Lambda
    const adminToken = (event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"] || "").trim();
    const expectedToken = process.env.ADMIN_TOKEN || "";
    if (expectedToken && adminToken !== expectedToken) {
      return { statusCode: 401, headers, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    const qs = event.queryStringParameters || {};
    const country = (qs.country || "").trim();
    const from = (qs.from || "").trim(); // ISO string
    const to = (qs.to || "").trim();     // ISO string
    const month = (qs.month || "").trim(); // YYYY-MM

    // Defaults for time window if none supplied
    const now = new Date();
    const defaultTo = now.toISOString();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const start = from || defaultFrom;
    const end = to || defaultTo;

    let params;

    // Case 1: Filter by country and date range using GSI_CountryCreatedAt
    if (country) {
      params = {
        TableName: TABLE_NAME,
        IndexName: GSI_COUNTRY_CREATED_AT,
        KeyConditionExpression: "#country = :country AND #createdAt BETWEEN :start AND :end",
        ExpressionAttributeNames: {
          "#country": "country",
          "#createdAt": "createdAt",
        },
        ExpressionAttributeValues: {
          ":country": country,
          ":start": start,
          ":end": end,
        },
        ScanIndexForward: false, // newest first
        Limit: 200,
      };
    }
    // Case 2: Filter by month (dateBucket) using GSI_DateBucketCreatedAt
    else if (month) {
      params = {
        TableName: TABLE_NAME,
        IndexName: GSI_DATE_BUCKET_CREATED_AT,
        KeyConditionExpression: "#dateBucket = :month AND #createdAt BETWEEN :start AND :end",
        ExpressionAttributeNames: {
          "#dateBucket": "dateBucket",
          "#createdAt": "createdAt",
        },
        ExpressionAttributeValues: {
          ":month": month,
          ":start": `${month}-01T00:00:00.000Z`,
          ":end": end,
        },
        ScanIndexForward: false,
        Limit: 200,
      };
    }
    // Case 3: No country and no month
    // In DynamoDB, there is no efficient global date range query without an index partition.
    // We return "this month" by default using dateBucket.
    else {
      const currentMonth = new Date().toISOString().slice(0, 7);
      params = {
        TableName: TABLE_NAME,
        IndexName: GSI_DATE_BUCKET_CREATED_AT,
        KeyConditionExpression: "#dateBucket = :month",
        ExpressionAttributeNames: { "#dateBucket": "dateBucket" },
        ExpressionAttributeValues: { ":month": currentMonth },
        ScanIndexForward: false,
        Limit: 200,
      };
    }

    const result = await ddb.query(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: result.Items?.length || 0,
        items: result.Items || [],
        nextToken: result.LastEvaluatedKey || null,
      }),
    };
  } catch (err) {
    console.error("List leads error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: "Server error" }) };
  }
};
