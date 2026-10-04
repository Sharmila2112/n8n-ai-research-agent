// n8n "Code in JavaScript" node - mode: Run Once for All Items
// Input: the Markdown node output (HTML in the "data" field)
// Output: a Word-compatible .doc file in binary field "data", plus the report title

const html = $input.first().json.data;

const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const title = titleMatch
  ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
  : 'Research Report';

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 50) || 'research_report';

const today = new Date().toISOString().slice(0, 10);
const fileName = `${slug}_${today}.doc`;

const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: 21cm 29.7cm; margin: 2cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #222222; }
  h1 { font-size: 22pt; color: #1F3864; margin-bottom: 4pt; }
  h2 { font-size: 15pt; color: #2F5496; border-bottom: 1px solid #cccccc; margin-top: 18pt; }
  a { color: #0563C1; }
  li { margin-bottom: 4pt; }
  table { border-collapse: collapse; }
  td, th { border: 1px solid #999999; padding: 4px 8px; }
  .footer { font-size: 9pt; color: #777777; margin-top: 24pt; border-top: 1px solid #cccccc; padding-top: 6pt; }
</style>
</head>
<body>
${html}
<p class="footer">Generated automatically on ${today}. Verify key facts using the linked sources.</p>
</body>
</html>`;

const binary = await this.helpers.prepareBinaryData(
  Buffer.from(doc, 'utf8'),
  fileName,
  'application/msword'
);

return [{ json: { fileName, title }, binary: { data: binary } }];
