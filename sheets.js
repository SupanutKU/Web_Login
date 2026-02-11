const { google } = require("googleapis");
const path = require("path");

const SPREADSHEET_ID = "ใส่_SPREADSHEET_ID_ตรงนี้";
const SHEET_NAME = "Sheet1";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service_account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

/*async function appendDutyRow(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.date,
        data.name,
        data.steam,
        data.checkIn,
        data.checkOut,
        data.total
      ]]
    }
  });
}*/

module.exports = { appendDutyRow };
