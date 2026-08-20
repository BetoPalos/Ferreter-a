import { getVercelOidcToken } from "@vercel/oidc";
import { IdentityPoolClient } from "google-auth-library";
import { google } from "googleapis";

const PROJECT_NUMBER = "467274224915";
const POOL_ID = "vercel-dashboard-beto";
const PROVIDER_ID = "vercel";

const SERVICE_ACCOUNT_EMAIL =
  "dashboard-beto-sheets@dashboard-beto.iam.gserviceaccount.com";

const AUDIENCE =
  `//iam.googleapis.com/projects/${PROJECT_NUMBER}` +
  `/locations/global/workloadIdentityPools/${POOL_ID}` +
  `/providers/${PROVIDER_ID}`;

const IMPERSONATION_URL =
  `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
  `${SERVICE_ACCOUNT_EMAIL}:generateAccessToken`;

class VercelOidcSupplier {
  async getSubjectToken(): Promise<string> {
    return await getVercelOidcToken();
  }
}

async function getGoogleAccessToken(): Promise<string> {
  const externalClient = new IdentityPoolClient({
    audience: AUDIENCE,

    subject_token_type:
      "urn:ietf:params:oauth:token-type:jwt",

    token_url:
      "https://sts.googleapis.com/v1/token",

    subject_token_supplier:
      new VercelOidcSupplier(),

    service_account_impersonation_url:
      IMPERSONATION_URL,

    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });

  const result = await externalClient.getAccessToken();

  if (!result.token) {
    throw new Error(
      "No se pudo obtener un access token de Google Cloud."
    );
  }

  return result.token;
}

export async function getGoogleSheetsClient() {
  const accessToken = await getGoogleAccessToken();

  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.sheets({
    version: "v4",
    auth: oauth2Client,
  });
}

export async function readSheet(
  spreadsheetId: string,
  range: string
): Promise<unknown[][]> {
  const sheets = await getGoogleSheetsClient();

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

  return response.data.values ?? [];
}