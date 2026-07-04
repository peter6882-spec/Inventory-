# 銷售看板 → Google Sheet 匯出設定

後台銷售看板的「↗ 匯出 Google Sheet」按鈕，會把全部銷售日彙總寫進你指定的 Google 試算表。
只需做一次以下設定（約 5 分鐘）。

## 步驟

1. 開一個 Google 試算表（新開或用現有的都可以）
2. 上方選單 → **擴充功能** → **Apps Script**
3. 刪掉編輯器裡的預設內容，貼上下方整段程式碼，按儲存（磁片圖示）
4. 右上角 **部署** → **新增部署作業**
   - 類型選 **網路應用程式**
   - 「執行身分」選 **我**
   - 「誰可以存取」選 **任何人**
   - 按部署，過程中會要求授權，一路允許
5. 複製產生的 **網路應用程式網址**（`https://script.google.com/macros/s/...../exec`）
6. 回到管理後台 → 銷售看板 → **品項設定** → 最下方「Google Sheet 匯出端點」貼上網址 → 儲存端點
7. 之後點「↗ 匯出 Google Sheet」，資料就會寫進試算表的「銷售統計」分頁（每次匯出整份覆蓋更新）

> 注意：若之後修改了 Apps Script 程式碼，需要重新「部署 → 管理部署作業 → 編輯 → 版本選新版本」才會生效。

## Apps Script 程式碼

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = '銷售統計';
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1).setValue('更新時間：' + (data.exportedAt || new Date()));
  sh.getRange(2, 1, 1, data.header.length).setValues([data.header]);
  if (data.rows && data.rows.length) {
    sh.getRange(3, 1, data.rows.length, data.header.length).setValues(data.rows);
  }
  return ContentService.createTextOutput('ok');
}
```

## 資料格式（供未來擴充參考）

後台送出的 JSON：

```json
{
  "type": "salesSummary",
  "exportedAt": "2026/7/4 08:30:00",
  "header": ["日期", "9吋厚", "12吋厚", "9吋薄", "12吋薄", "筆數"],
  "rows": [["2026-07-04", 11, 15, 36, 19, 2]]
}
```
