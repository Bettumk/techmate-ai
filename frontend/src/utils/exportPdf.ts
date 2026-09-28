/**
 * TechMate AI - High Fidelity PDF Export Utility
 * Generates beautifully formatted, printable PDF documents with TechMate header,
 * styled code blocks, tables, and pagination.
 */

export function exportDocumentToPdf(options: {
  title: string;
  subtitle?: string;
  category?: string;
  content: string;
  author?: string;
}) {
  const { title, subtitle, category, content, author = 'TechMate AI' } = options;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download your PDF.');
    return;
  }

  // Convert basic markdown to styled HTML
  let formattedHtml = content
    .replace(/^### (.*$)/gim, '<h3 style="color:#1e3a8a;font-size:16px;margin-top:18px;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#0f172a;font-size:19px;margin-top:22px;margin-bottom:10px;border-bottom:2px solid #3b82f6;padding-bottom:6px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#0f172a;font-size:24px;margin-top:24px;margin-bottom:12px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([a-zA-Z]*)\n([\s\S]*?)```/gim, '<pre style="background:#0f172a;color:#f8fafc;padding:14px;border-radius:8px;font-family:Consolas,Monaco,monospace;font-size:12px;overflow-x:auto;margin:12px 0;"><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code style="background:#f1f5f9;color:#0f172a;padding:2px 6px;border-radius:4px;font-family:Consolas,monospace;font-size:12px;">$1</code>')
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-bottom:5px;line-height:1.6;">$1</li>')
    .replace(/\n\n/gim, '<p style="margin-bottom:12px;line-height:1.6;color:#334155;"></p>');

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fullDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title} - TechMate AI</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm 18mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 14px;
          margin-bottom: 24px;
        }
        .brand {
          font-size: 20px;
          font-weight: 800;
          color: #2563eb;
          letter-spacing: -0.5px;
        }
        .brand-tag {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .badge {
          display: inline-block;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .doc-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }
        .doc-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 20px 0;
        }
        .content {
          font-size: 13px;
        }
        ul, ol {
          padding-left: 22px;
          margin-bottom: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 10px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #0f172a;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 10px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">TechMate AI</div>
          <div class="brand-tag">Intelligent CSE, Coding & Career Mentor</div>
        </div>
        <div class="doc-meta">
          <div>Generated on: ${today}</div>
          <div>Author: ${author}</div>
        </div>
      </div>

      <div>
        ${category ? `<span class="badge">${category}</span>` : ''}
        <h1 class="doc-title">${title}</h1>
        ${subtitle ? `<p class="doc-subtitle">${subtitle}</p>` : ''}
      </div>

      <div class="content">
        ${formattedHtml}
      </div>

      <div class="footer">
        <div>TechMate AI — Learn. Build. Code. Grow.</div>
        <div>Confidential & Educational Use</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullDocument);
  printWindow.document.close();
}
