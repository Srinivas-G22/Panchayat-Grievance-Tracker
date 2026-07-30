import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const dashScreenshotPath = path.join(rootDir, "public", "dash_screenshot.png");
const detailScreenshotPath = path.join(rootDir, "public", "detail_screenshot.png");
const htmlPath = path.join(rootDir, "presentation.html");
const pdfPath = path.join(rootDir, "presentation.pdf");

const edgePath = `C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe`;

function run() {
  console.log("1. Capturing Dashboard screenshot via Edge...");
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --window-size=1400,900 --screenshot="${dashScreenshotPath}" "http://localhost:5173/"`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Screenshot warning:", e.message);
  }

  console.log("2. Capturing Detail Page screenshot via Edge...");
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --window-size=1400,1000 --screenshot="${detailScreenshotPath}" "http://localhost:5173/detail/1001"`, { stdio: "inherit" });
  } catch (e) {
    console.warn("Screenshot warning:", e.message);
  }

  let dashBase64 = "";
  let detailBase64 = "";

  if (fs.existsSync(dashScreenshotPath)) {
    dashBase64 = fs.readFileSync(dashScreenshotPath).toString("base64");
  }
  if (fs.existsSync(detailScreenshotPath)) {
    detailBase64 = fs.readFileSync(detailScreenshotPath).toString("base64");
  }

  console.log("3. Writing presentation.html with distinct Midnight Gold & Emerald theme (7 slides)...");
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Panchayat Grievance Tracker - Executive Presentation</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, 'Trebuchet MS', sans-serif;
      background: #060913;
      color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Distinct Dark Executive Slide Container */
    .slide {
      width: 297mm;
      height: 210mm;
      padding: 18mm 22mm 16mm;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #0b1329;
      color: #f1f5f9;
      overflow: hidden;
      border: 1px solid #1e293b;
    }

    /* Cover Slide Styling - Obsidian Gold & Emerald Accent */
    .slide-cover {
      background: radial-gradient(circle at 80% 20%, #1e1b4b 0%, #0b1329 60%, #060913 100%);
      color: #ffffff;
    }
    .cover-top-tag {
      font-size: 13px;
      font-weight: 800;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border: 1.5px solid #f59e0b;
      display: inline-block;
      padding: 6px 18px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.12);
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
    }
    .cover-header {
      margin-top: 15px;
    }
    .cover-title {
      font-size: 42px;
      font-weight: 900;
      background: linear-gradient(90deg, #ffffff 0%, #fef08a 50%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.15;
      margin-bottom: 14px;
      letter-spacing: -0.02em;
    }
    .cover-subtitle {
      font-size: 19px;
      color: #cbd5e1;
      font-weight: 400;
      max-width: 850px;
      line-height: 1.5;
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      background: rgba(15, 23, 42, 0.8);
      padding: 20px 24px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    .cover-meta-item strong {
      display: block;
      font-size: 11px;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    .cover-meta-item span {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }

    /* Common Slide Headers */
    .slide-header {
      border-bottom: 2px solid #334155;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .slide-num-tag {
      font-size: 12px;
      font-weight: 800;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 4px 12px;
      border-radius: 12px;
    }
    .slide-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .slide-subtitle {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
      margin-top: 3px;
    }

    /* Content Layout Components */
    .content-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 14px;
    }

    /* Solution Box */
    .solution-banner {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      color: #ffffff;
      padding: 26px 32px;
      border-radius: 16px;
      border: 1.5px solid #6366f1;
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
    }
    .solution-quote {
      font-size: 21px;
      font-weight: 700;
      line-height: 1.5;
      color: #fef08a;
      font-style: italic;
    }

    /* Grid Boxes - Dark Glassmorphism Theme */
    .three-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .two-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .card-box {
      background: #131c31;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    .card-box h3 {
      font-size: 17px;
      color: #38bdf8;
      font-weight: 800;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-box p, .card-box li {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .card-box ul {
      padding-left: 18px;
      margin-top: 6px;
    }
    .card-box li {
      margin-bottom: 5px;
    }

    /* Simple Calculation Cards */
    .calc-card {
      background: #131c31;
      border: 1px solid #0284c7;
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.15);
    }
    .calc-title {
      font-size: 15px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    .calc-example {
      background: #0f172a;
      color: #fef08a;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      margin: 4px 0;
      border: 1px solid #334155;
    }
    .calc-desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.4;
    }

    /* Screenshot Container */
    .screenshot-frame {
      border: 1.5px solid #334155;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      background: #0f172a;
    }
    .screenshot-frame img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      object-position: top;
      display: block;
    }
    .screenshot-title {
      background: #1e293b;
      color: #f8fafc;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-bottom: 1px solid #334155;
    }

    /* Status Badges */
    .status-badge-ok {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid #10b981;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
    }
    .status-badge-pending {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid #f59e0b;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
    }

    /* Slide Footer */
    .slide-footer {
      border-top: 1px solid #1e293b;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: TITLE / COVER -->
  <div class="slide slide-cover">
    <div class="cover-top-tag">Ministry of Panchayati Raj • Civic Portal</div>
    <div class="cover-header">
      <h1 class="cover-title">Gram Panchayat Grievance Tracker</h1>
      <p class="cover-subtitle">A simple, open, and clear civic complaint register for village communities.</p>
    </div>
    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <strong>Purpose</strong>
        <span>Village Public Service Tracking</span>
      </div>
      <div class="cover-meta-item">
        <strong>Key Feature</strong>
        <span>Click Any Card for Full Case Details</span>
      </div>
      <div class="cover-meta-item">
        <strong>Status</strong>
        <span>Live & Working System</span>
      </div>
    </div>
    <div class="slide-footer" style="color: #64748b; border-color: rgba(255,255,255,0.1);">
      <span>Gram Panchayat Civic Grievance Tracker</span>
      <span>Presentation • Slide 1 of 7</span>
    </div>
  </div>

  <!-- SLIDE 2: PROBLEM & AFFECTED PEOPLE -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">1. Problem & Affected People</h2>
        <p class="slide-subtitle">Solving communication gaps and long waiting times in village administration.</p>
      </div>
      <span class="slide-num-tag">Slide 2 of 7</span>
    </div>

    <div class="content-body">
      <div class="card-box" style="background: rgba(239, 68, 68, 0.1); border-color: #ef4444;">
        <h3 style="color: #fca5a5;">⚠️ The Main Issue</h3>
        <p style="color: #fecaca; font-size: 14px; font-weight: 600;">
          Villagers file complaints about broken drains, dark streetlights, or dirty drinking water, but wait for weeks without any updates or explanations for why repairs are delayed.
        </p>
      </div>

      <div class="three-grid">
        <div class="card-box">
          <h3 style="color: #f59e0b;">👨‍🌾 Villagers & Families</h3>
          <ul>
            <li><strong>No Updates:</strong> Don't know if anyone is working on their complaint.</li>
            <li><strong>Health & Safety:</strong> Deal with dirty water or dark roads every day.</li>
            <li><strong>No Voice:</strong> Can't see who is responsible or when work will finish.</li>
          </ul>
        </div>

        <div class="card-box">
          <h3 style="color: #06b6d4;">👷 Repair Crew & Technicians</h3>
          <ul>
            <li><strong>Missing Equipment:</strong> Hard to explain when special machinery or pumps are missing.</li>
            <li><strong>Permit Delays:</strong> Waiting for official permissions from highway or electric departments.</li>
            <li><strong>Unclear Priorities:</strong> No clear daily list of urgent jobs.</li>
          </ul>
        </div>

        <div class="card-box">
          <h3 style="color: #a855f7;">🏛️ Village Leaders & Officers</h3>
          <ul>
            <li><strong>Hard to Monitor:</strong> Can't easily see which ward needs urgent help.</li>
            <li><strong>Delayed Actions:</strong> Find out about overdue problems late.</li>
            <li><strong>No Clear Records:</strong> Missing past notes on what work was completed.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>Problem Overview</span>
    </div>
  </div>

  <!-- SLIDE 3: SOLUTION IN ONE SENTENCE -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">2. Solution Overview</h2>
        <p class="slide-subtitle">Simple, clear, and open tracking for every villager.</p>
      </div>
      <span class="slide-num-tag">Slide 3 of 7</span>
    </div>

    <div class="content-body">
      <div class="solution-banner">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24; margin-bottom: 6px;">Our Solution in One Simple Sentence</div>
        <div class="solution-quote">
          "An easy-to-use digital system for rural communities that lets villagers lodge civic complaints, track repair progress step-by-step, and see clear explanations whenever work is delayed."
        </div>
      </div>

      <div class="three-grid" style="margin-top: 8px;">
        <div class="card-box" style="border-top: 3px solid #38bdf8;">
          <h3>🔍 Click Any Card for Details</h3>
          <p>Clicking any complaint card opens a full page with complete details about the citizen, officer, and complaint status.</p>
        </div>

        <div class="card-box" style="border-top: 3px solid #f59e0b;">
          <h3>⚠️ Clear Reason for Delays</h3>
          <p>Shows the exact reason why work is delayed (such as waiting for digging permits or heavy suction pumps).</p>
        </div>

        <div class="card-box" style="border-top: 3px solid #10b981;">
          <h3>⏱️ 5-Step Progress Bar</h3>
          <p>Shows step-by-step progress from Filing &rarr; Inspection &rarr; Material Arrival &rarr; Work Done &rarr; Final Sign-Off.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>Solution Statement</span>
    </div>
  </div>

  <!-- SLIDE 4: SCREENSHOTS OF WORKING SOLUTION -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">3. Screenshots of Working Solution</h2>
        <p class="slide-subtitle">Real views of our main complaint register and detailed full-page view.</p>
      </div>
      <span class="slide-num-tag">Slide 4 of 7</span>
    </div>

    <div class="content-body">
      <div class="two-grid">
        <div class="screenshot-frame">
          <div class="screenshot-title">A. Main Complaint Register (Click Any Card)</div>
          ${dashBase64 ? `<img src="data:image/png;base64,${dashBase64}" alt="Dashboard Screenshot" />` : `<div style="padding:40px; text-align:center; color:#64748b;">Dashboard Screenshot Preview</div>`}
        </div>

        <div class="screenshot-frame">
          <div class="screenshot-title">B. Full-Page Case File with Delay Reasons & Step Progress</div>
          ${detailBase64 ? `<img src="data:image/png;base64,${detailBase64}" alt="Detail Page Screenshot" />` : `<div style="padding:40px; text-align:center; color:#64748b;">Detail Page Screenshot Preview</div>`}
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>Screenshots</span>
    </div>
  </div>

  <!-- SLIDE 5: HOW FIGURES ARE CALCULATED -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">4. How Numbers Are Calculated</h2>
        <p class="slide-subtitle">Plain English explanation of how days, repair speeds, and alert targets work.</p>
      </div>
      <span class="slide-num-tag">Slide 5 of 7</span>
    </div>

    <div class="content-body">
      <div class="two-grid">
        <div class="calc-card">
          <div class="calc-title">1. Days Waiting (Pending Time)</div>
          <div class="calc-example">Days Waiting = Today's Date minus Date Filed</div>
          <div class="calc-desc">Counts how many days a complaint has been waiting since it was lodged.<br><em>Example: Filed July 1, Today is July 10 &rarr; 9 Days Waiting.</em></div>
        </div>

        <div class="calc-card">
          <div class="calc-title">2. Total Repair Time (Resolved Cases)</div>
          <div class="calc-example">Repair Days = Date Fixed minus Date Filed</div>
          <div class="calc-desc">Measures the exact number of days taken to finish the repair.<br><em>Example: Filed July 1, Fixed July 5 &rarr; 4 Days to Repair.</em></div>
        </div>

        <div class="calc-card">
          <div class="calc-title">3. Average Repair Speed</div>
          <div class="calc-example">Average = Total Repair Days divided by Fixed Complaints</div>
          <div class="calc-desc">Shows how fast the Panchayat team fixes complaints overall.<br><em>Example: 40 total repair days across 10 fixed complaints &rarr; 4 Days Average.</em></div>
        </div>

        <div class="calc-card">
          <div class="calc-title">4. Target Deadline & Overdue Red Alerts</div>
          <div class="calc-example">Urgent Cases: 3-Day Target | Standard Cases: 7-Day Target</div>
          <div class="calc-desc">If a complaint passes its target deadline without being fixed, the system automatically marks it with a bright Red Alert flag.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>Calculations Explained</span>
    </div>
  </div>

  <!-- SLIDE 6: WHAT WORKS & WHAT IS UNFINISHED -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">5. What Works & What Is Unfinished</h2>
        <p class="slide-subtitle">Clear summary of features ready today and items to build next.</p>
      </div>
      <span class="slide-num-tag">Slide 6 of 7</span>
    </div>

    <div class="content-body">
      <div class="two-grid">
        <div class="card-box" style="border-top: 3px solid #10b981; background: rgba(16, 185, 129, 0.08);">
          <h3><span class="status-badge-ok">READY TODAY</span> What Works Fully</h3>
          <ul>
            <li>✅ <strong>Clickable Cards:</strong> Click any card on the dashboard to open a full details page.</li>
            <li>✅ <strong>Full-Page View:</strong> Shows complainant name, ward, assigned officer, and target deadlines.</li>
            <li>✅ <strong>Clear Delay Reasons:</strong> Explains specific obstacles (like missing machinery or road permits).</li>
            <li>✅ <strong>5-Step Progress Bar:</strong> Visual steps showing progress from filing to final inspection.</li>
            <li>✅ <strong>Officer History Log:</strong> Full list of past notes and status changes with timestamps.</li>
            <li>✅ <strong>Search & Filters:</strong> Easily filter by ward, department, or search by citizen name.</li>
          </ul>
        </div>

        <div class="card-box" style="border-top: 3px solid #f59e0b; background: rgba(245, 158, 11, 0.08);">
          <h3><span class="status-badge-pending">UNFINISHED</span> Items Still to Add</h3>
          <ul>
            <li>⏳ <strong>Automatic Mobile SMS Updates:</strong> Sending text messages to citizens when their complaint status changes.</li>
            <li>⏳ <strong>Attach Photos from Phone:</strong> Allowing villagers to take a photo of the damaged pipe or street light when filing.</li>
            <li>⏳ <strong>Local Language Switch:</strong> One-click button to toggle text between English, Hindi, and local languages.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>System Status</span>
    </div>
  </div>

  <!-- SLIDE 7: NEXT MAJOR IMPROVEMENT -->
  <div class="slide">
    <div class="slide-header">
      <div>
        <h2 class="slide-title">6. Next Improvement We Would Make</h2>
        <p class="slide-subtitle">Adding a village map with smart travel routes for repair teams.</p>
      </div>
      <span class="slide-num-tag">Slide 7 of 7</span>
    </div>

    <div class="content-body">
      <div class="card-box" style="border: 1.5px solid #38bdf8; background: #131c31; padding: 22px;">
        <h3 style="font-size: 20px; color: #38bdf8; margin-bottom: 10px;">🗺️ Interactive Village Map & Smart Repair Routes</h3>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 14px;">
          The next best improvement is to show all complaints on an <strong>interactive map of the village</strong> and automatically create the best travel path for repair teams.
        </p>

        <div class="three-grid">
          <div class="card-box" style="background: #0f172a; border-color: #334155;">
            <strong style="color: #38bdf8; display: block; font-size: 13px; margin-bottom: 4px;">1. Map Pins</strong>
            <p style="font-size: 12px; color: #cbd5e1;">Mark open complaints as pins on a map so technicians can see exact locations.</p>
          </div>

          <div class="card-box" style="background: #0f172a; border-color: #334155;">
            <strong style="color: #fbbf24; display: block; font-size: 13px; margin-bottom: 4px;">2. Group Nearby Jobs</strong>
            <p style="font-size: 12px; color: #cbd5e1;">Group nearby issues together (like 4 broken streetlights on one road) into a single trip.</p>
          </div>

          <div class="card-box" style="background: #0f172a; border-color: #334155;">
            <strong style="color: #34d399; display: block; font-size: 13px; margin-bottom: 4px;">3. Save Time & Fuel</strong>
            <p style="font-size: 12px; color: #cbd5e1;">Creates the shortest route for repair trucks, fixing issues much faster and saving fuel.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Panchayat Grievance Register</span>
      <span>Future Plan</span>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent);
  console.log("4. Saved presentation.html");

  console.log("5. Generating presentation.pdf via Edge...");
  try {
    execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, "/")}"`, { stdio: "inherit" });
    console.log(`Successfully generated presentation.pdf at: ${pdfPath}`);
  } catch (e) {
    console.error("Failed to generate PDF via Edge:", e.message);
  }
}

run();
