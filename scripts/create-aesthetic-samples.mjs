import { writeFileSync } from "node:fs";

const baseStyle = {
  font: "Noto Sans JP",
  text: "#172033",
  muted: "#56657A",
  border: "#D6E0EA",
};

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function cell(id, value, style, x, y, w, h) {
  return `        <mxCell id="${id}" value="${value}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/>
        </mxCell>`;
}

function text(id, value, x, y, w, h, size = 16, color = baseStyle.text, bold = false, align = "left") {
  const style = `text;html=1;strokeColor=none;fillColor=none;align=${align};verticalAlign=middle;fontSize=${size};fontStyle=${bold ? 1 : 0};fontFamily=${baseStyle.font};fontColor=${color};`;
  return cell(id, esc(value), style, x, y, w, h);
}

function lane(id, x, y, w, h, fill = "#EEF4F8", stroke = baseStyle.border) {
  const style = `rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=${fill};strokeColor=${stroke};strokeWidth=1;`;
  return cell(id, "", style, x, y, w, h);
}

function card(id, title, body, x, y, w, h, stroke, fill = "#FFFFFF", titleColor = baseStyle.text, bodyColor = baseStyle.muted) {
  const value = `${esc(title)}&lt;br&gt;&lt;font style=&quot;font-size: 12px; color: ${bodyColor};&quot;&gt;${esc(body)}&lt;/font&gt;`;
  const style = `rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=${fill};strokeColor=${stroke};strokeWidth=2;fontSize=17;fontStyle=1;fontFamily=${baseStyle.font};fontColor=${titleColor};align=center;verticalAlign=middle;spacing=10;`;
  return cell(id, value, style, x, y, w, h);
}

function chip(id, value, x, y, w, fill, stroke, color) {
  const style = `rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=${fill};strokeColor=${stroke};strokeWidth=1;fontSize=13;fontStyle=1;fontFamily=${baseStyle.font};fontColor=${color};align=center;verticalAlign=middle;`;
  return cell(id, esc(value), style, x, y, w, 34);
}

function simpleBox(id, value, x, y, w, h, fill, stroke, color = baseStyle.text, size = 15, bold = false, align = "center") {
  const style = `rounded=1;whiteSpace=wrap;html=1;arcSize=8;fillColor=${fill};strokeColor=${stroke};strokeWidth=1;fontSize=${size};fontStyle=${bold ? 1 : 0};fontFamily=${baseStyle.font};fontColor=${color};align=${align};verticalAlign=middle;spacing=10;`;
  return cell(id, esc(value).replaceAll("\n", "&lt;br&gt;"), style, x, y, w, h);
}

function circle(id, title, body, x, y, w, h, fill, stroke, color = baseStyle.text, bodyColor = baseStyle.muted) {
  const value = body
    ? `${esc(title)}&lt;br&gt;&lt;font style=&quot;font-size: 11px; color: ${bodyColor};&quot;&gt;${esc(body)}&lt;/font&gt;`
    : esc(title);
  const style = `ellipse;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};strokeWidth=2;fontSize=15;fontStyle=1;fontFamily=${baseStyle.font};fontColor=${color};align=center;verticalAlign=middle;spacing=8;`;
  return cell(id, value, style, x, y, w, h);
}

function ring(id, x, y, w, h, stroke) {
  const style = `ellipse;whiteSpace=wrap;html=1;fillColor=none;strokeColor=${stroke};strokeWidth=1;dashed=1;`;
  return cell(id, "", style, x, y, w, h);
}

function edge(id, source, target, color = "#2F80ED", dashed = false, points = [], extraStyle = "") {
  const pointXml = points.length
    ? `
            <Array as="points">
${points.map((p) => `              <mxPoint x="${p[0]}" y="${p[1]}"/>`).join("\n")}
            </Array>`
    : "";
  const style = `edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeWidth=2;strokeColor=${color};${dashed ? "dashed=1;" : ""}${extraStyle}`;
  return `        <mxCell id="${id}" value="" style="${style}" edge="1" parent="1" source="${source}" target="${target}">
          <mxGeometry relative="1" as="geometry">${pointXml}
          </mxGeometry>
        </mxCell>`;
}

function diagram(name, id, body, background = "#F7F9FC") {
  return `<mxfile host="app.diagrams.net" modified="2026-06-03T00:00:00.000Z" agent="Codex GPT-5" version="30.0.4">
  <diagram id="${id}" name="${name}">
    <mxGraphModel dx="1800" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="0" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0" background="${background}" defaultFontFamily="${baseStyle.font}">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
${body.join("\n")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

function writeSample(filename, name, id, body, background) {
  writeFileSync(new URL(`../assets/${filename}`, import.meta.url), diagram(name, id, body, background));
}

writeSample("aesthetic-sample-executive-dashboard.drawio", "Executive Ops Dashboard", "executive-ops-dashboard", [
  text("title", "Executive Ops Dashboard", 70, 48, 620, 44, 30, "#111827", true),
  text("subtitle", "Signal-first service health view with calm density and clear escalation paths", 72, 94, 760, 28, 15, "#5B6778"),
  chip("chip1", "Board-ready", 1260, 62, 150, "#EAF3FF", "#BBD7FF", "#1D4ED8"),
  lane("summary-band", 70, 150, 1460, 150, "#F0F6FF", "#D7E6FA"),
  lane("main-band", 70, 340, 1460, 450, "#F7FAFC", "#D6E0EA"),
  card("kpi-revenue", "Revenue", "$4.8M run-rate", 125, 205, 220, 86, "#2563EB"),
  card("kpi-latency", "Latency", "p95 182ms", 390, 205, 220, 86, "#00A6A6"),
  card("kpi-risk", "Risk", "2 open escalations", 655, 205, 220, 86, "#F2994A"),
  card("kpi-slo", "SLO", "99.94% this week", 920, 205, 220, 86, "#65A30D"),
  card("kpi-cost", "Cost", "8% under plan", 1185, 205, 220, 86, "#8B5CF6"),
  text("lane-left", "Customer Journey", 120, 375, 300, 32, 20, "#111827", true),
  text("lane-right", "Operations Loop", 890, 375, 300, 32, 20, "#111827", true),
  card("touchpoint", "Touchpoint", "web, app, support", 130, 455, 210, 90, "#2563EB"),
  card("experience", "Experience Score", "freshness and sentiment", 400, 455, 230, 90, "#2563EB"),
  card("decision", "Decision Gate", "route, hold, escalate", 670, 455, 220, 90, "#00A6A6"),
  card("owner", "Owner Desk", "runbook and action", 960, 455, 220, 90, "#00A6A6"),
  card("review", "Weekly Review", "trend, budget, risk", 1230, 455, 220, 90, "#8B5CF6"),
  card("evidence", "Evidence Store", "snapshots and notes", 530, 650, 240, 90, "#8B5CF6"),
  card("incident", "Incident Lane", "only when SLO breaks", 960, 650, 220, 90, "#F2994A"),
  edge("e1", "touchpoint", "experience", "#2563EB"),
  edge("e2", "experience", "decision", "#2563EB"),
  edge("e3", "decision", "owner", "#00A6A6"),
  edge("e4", "owner", "review", "#00A6A6"),
  edge("e5", "decision", "evidence", "#8B5CF6", true, [[780, 590], [650, 590]]),
  edge("e6", "owner", "incident", "#F2994A", true),
  chip("legend1", "Primary decision flow", 1030, 830, 190, "#EAF3FF", "#BBD7FF", "#1D4ED8"),
  chip("legend2", "Evidence / exception", 1250, 830, 180, "#FFF1E3", "#F8C887", "#A25B00"),
], "#F8FAFC");

writeSample("purpose-board-brief-template.drawio", "Board Brief", "purpose-board-brief", [
  text("title", "Board Brief", 70, 46, 420, 44, 32, "#1F3A64", true),
  text("subtitle", "Purpose: a one-page decision premise for executives, PMs, and review owners", 72, 92, 860, 28, 15, "#58677A"),
  chip("phase", "Decision-ready", 1230, 60, 170, "#F6F4EE", "#AEB9C7", "#1F3A64"),
  lane("header-band", 70, 140, 1460, 80, "#1F3A64", "#1F3A64"),
  text("h1", "What decision is needed?", 100, 158, 360, 34, 22, "#FFFFFF", true),
  text("h2", "Choose the next investment, owner, and risk posture from the facts below.", 520, 160, 720, 30, 16, "#E6EDF5"),
  chip("h3", "Updated 2026-06-03", 1260, 162, 190, "#EAF7F6", "#88D1CE", "#0C6F6A"),
  lane("left-col", 70, 255, 420, 500, "#F6F4EE", "#D8D2C2"),
  lane("mid-col", 530, 255, 420, 500, "#FFFFFF", "#D6E0EA"),
  lane("right-col", 990, 255, 420, 500, "#F6F4EE", "#D8D2C2"),
  text("lt", "Decision Premise", 105, 285, 260, 30, 20, "#1F3A64", true),
  text("mt", "Current Signal", 565, 285, 260, 30, 20, "#1F3A64", true),
  text("rt", "Action Contract", 1025, 285, 260, 30, 20, "#1F3A64", true),
  simpleBox("purpose", "Purpose\nReduce review latency without increasing operational risk.", 105, 350, 330, 86, "#FFFFFF", "#7C8CA2", "#1F3A64", 15, true, "left"),
  simpleBox("success", "Success Criteria\nApproval path under 48h; rollback path documented.", 105, 465, 330, 86, "#FFFFFF", "#7C8CA2", "#1F3A64", 15, true, "left"),
  simpleBox("constraints", "Constraints\nNo new vendor; no data export outside existing policy.", 105, 580, 330, 86, "#FFFFFF", "#7C8CA2", "#1F3A64", 15, true, "left"),
  simpleBox("state", "Current State\nPrototype is live for two internal teams.", 565, 350, 330, 86, "#FFFFFF", "#1FA7A3", "#0C6F6A", 15, true, "left"),
  simpleBox("kpi", "Primary KPI\nMedian review time: 31h, down from 57h.", 565, 465, 330, 86, "#FFFFFF", "#1FA7A3", "#0C6F6A", 15, true, "left"),
  simpleBox("blocker", "Bottleneck\nSecurity exception wording needs owner approval.", 565, 580, 330, 86, "#FFF8E8", "#D98A16", "#7A4B13", 15, true, "left"),
  simpleBox("next24", "Next 24h\nApprove wording or reject the exception.", 1025, 350, 330, 86, "#FFFFFF", "#1F3A64", "#1F3A64", 15, true, "left"),
  simpleBox("next7", "Next 7d\nPilot with support desk and collect proof.", 1025, 465, 330, 86, "#FFFFFF", "#1F3A64", "#1F3A64", 15, true, "left"),
  simpleBox("owner", "Owner\nPM: Arai / Security: Ito / Ops: Mori", 1025, 580, 330, 86, "#FFFFFF", "#1F3A64", "#1F3A64", 15, true, "left"),
  edge("d1", "purpose", "state", "#1FA7A3"),
  edge("d2", "blocker", "next24", "#D98A16", true, [[945, 623], [945, 393]], "exitX=1;exitY=0.5;entryX=0;entryY=0.5;"),
  simpleBox("footer", "Deliberately excludes: implementation steps, raw logs, and detailed dependency maps. Use this template when the output must support a decision.", 70, 815, 1030, 58, "#FFFFFF", "#D6E0EA", "#58677A", 14, false, "left"),
  chip("legend1", "Decision premise", 1130, 825, 160, "#F6F4EE", "#D8D2C2", "#1F3A64"),
  chip("legend2", "Action owner", 1310, 825, 140, "#EAF7F6", "#88D1CE", "#0C6F6A"),
], "#FBFAF6");

writeSample("purpose-dependency-orbit-template.drawio", "Dependency Orbit Map", "purpose-dependency-orbit-map", [
  text("title", "Dependency Orbit Map", 70, 46, 620, 44, 32, "#F8FAFC", true),
  text("subtitle", "Purpose: show dependency radius and impact boundaries, not time or project status", 72, 92, 820, 28, 15, "#C9D3E6"),
  chip("tag", "Dependency radius", 1230, 60, 190, "#3C2A5B", "#8B5CF6", "#F8FAFC"),
  ring("ring1", 570, 315, 450, 300, "#44516F"),
  ring("ring2", 365, 210, 860, 520, "#303B55"),
  ring("ring3", 210, 135, 1170, 670, "#263047"),
  circle("core", "Core Service", "customer decision API", 710, 400, 170, 100, "#F8FAFC", "#D98A16", "#1F1433"),
  circle("auth", "Identity", "direct dependency", 470, 280, 160, 86, "#33264F", "#9F7AEA", "#FFFFFF", "#B9C2D6"),
  circle("queue", "Queue", "direct dependency", 960, 280, 160, 86, "#33264F", "#9F7AEA", "#FFFFFF", "#B9C2D6"),
  circle("db", "Primary DB", "state boundary", 470, 560, 160, 86, "#172554", "#22D3EE", "#FFFFFF", "#B9C2D6"),
  circle("cache", "Cache", "performance ring", 960, 560, 160, 86, "#172554", "#22D3EE", "#FFFFFF", "#B9C2D6"),
  circle("observability", "Observability", "indirect signal", 270, 390, 170, 86, "#2A2A4F", "#64748B", "#FFFFFF", "#B9C2D6"),
  circle("partner", "Partner API", "external edge", 1170, 390, 170, 86, "#4A2A17", "#D98A16", "#FFFFFF", "#D6B083"),
  circle("ops", "Ops Console", "human control", 700, 700, 170, 86, "#2A2A4F", "#64748B", "#FFFFFF", "#B9C2D6"),
  edge("r1", "core", "auth", "#9F7AEA", false, [[665, 410], [665, 323]], "rounded=0;exitX=0;exitY=0.15;entryX=1;entryY=0.5;"),
  edge("r2", "core", "queue", "#9F7AEA", false, [[925, 410], [925, 323]], "rounded=0;exitX=1;exitY=0.15;entryX=0;entryY=0.5;"),
  edge("r3", "core", "db", "#22D3EE", false, [[665, 490], [665, 603]], "rounded=0;exitX=0;exitY=0.85;entryX=1;entryY=0.5;"),
  edge("r4", "core", "cache", "#22D3EE", false, [[925, 490], [925, 603]], "rounded=0;exitX=1;exitY=0.85;entryX=0;entryY=0.5;"),
  edge("r5", "observability", "core", "#64748B", true, [[610, 433]], "exitX=1;exitY=0.5;entryX=0;entryY=0.45;"),
  edge("r6", "partner", "core", "#D98A16", true, [[1010, 458]], "exitX=0;exitY=0.5;entryX=1;entryY=0.55;"),
  edge("r7", "ops", "core", "#64748B", true, [], "exitX=0.5;exitY=0;entryX=0.5;entryY=1;"),
  simpleBox("q1", "FUNCTION", 260, 245, 130, 36, "#3C2A5B", "#9F7AEA", "#FFFFFF", 13, true),
  simpleBox("q2", "DATA", 1120, 610, 110, 36, "#12304A", "#22D3EE", "#FFFFFF", 13, true),
  simpleBox("q3", "EXTERNAL", 1190, 300, 130, 36, "#4A2A17", "#D98A16", "#FFFFFF", 13, true),
  simpleBox("legend", "How to read\nCenter = core object. Inner ring = direct dependencies. Outer ring = indirect signals and external edges. Do not use this for timelines.", 70, 790, 530, 92, "#1B2338", "#44516F", "#E7ECF7", 14, false, "left"),
], "#111827");

writeSample("purpose-incident-timeline-template.drawio", "Incident Timeline", "purpose-incident-timeline", [
  text("title", "Incident Timeline", 70, 46, 520, 44, 32, "#202124", true),
  text("subtitle", "Purpose: reconstruct facts, actions, and evidence in strict time order", 72, 92, 760, 28, 15, "#5F6368"),
  chip("tag", "Post-incident review", 1230, 60, 210, "#E8F4F8", "#9DCDDA", "#1E6477"),
  lane("axis", 120, 205, 1280, 4, "#3F8FA9", "#3F8FA9"),
  text("t0", "10:05", 115, 165, 80, 30, 16, "#3F8FA9", true, "center"),
  text("t1", "10:18", 405, 165, 80, 30, 16, "#3F8FA9", true, "center"),
  text("t2", "10:31", 695, 165, 80, 30, 16, "#3F8FA9", true, "center"),
  text("t3", "10:47", 985, 165, 80, 30, 16, "#3F8FA9", true, "center"),
  text("t4", "11:05", 1275, 165, 80, 30, 16, "#3F8FA9", true, "center"),
  lane("obs-lane", 70, 245, 1460, 130, "#F8FAFA", "#D7E4E8"),
  lane("impact-lane", 70, 405, 1460, 130, "#FFF8E8", "#F0C36E"),
  lane("action-lane", 70, 565, 1460, 160, "#F1F8F2", "#A8D7AE"),
  text("obs-title", "Observed facts", 105, 285, 190, 30, 18, "#202124", true),
  text("impact-title", "Impact", 105, 445, 190, 30, 18, "#7A4B13", true),
  text("action-title", "Response actions", 105, 615, 220, 30, 18, "#2E7D32", true),
  simpleBox("obs1", "Alert fired\nlog: A-104", 320, 270, 170, 72, "#FFFFFF", "#3F8FA9", "#202124", 14, true),
  simpleBox("obs2", "Error burst\ntrace: T-822", 610, 270, 170, 72, "#FFFFFF", "#3F8FA9", "#202124", 14, true),
  simpleBox("obs3", "Recovery signal\nmetric: M-119", 1190, 270, 180, 72, "#FFFFFF", "#3F8FA9", "#202124", 14, true),
  simpleBox("imp1", "Checkout degraded\nowner: support", 460, 430, 210, 72, "#FFFFFF", "#F0A500", "#7A4B13", 14, true),
  simpleBox("imp2", "Queue backlog\nstatus: slowdown", 750, 430, 210, 72, "#FFFFFF", "#F0A500", "#7A4B13", 14, true),
  simpleBox("act1", "Escalate\npager: P-77", 320, 600, 170, 72, "#FFFFFF", "#2E7D32", "#1B5E20", 14, true),
  simpleBox("act2", "Failover\nchange: C-314", 750, 600, 210, 72, "#FFFFFF", "#2E7D32", "#1B5E20", 14, true),
  simpleBox("act3", "Record evidence\nnote: N-55", 1260, 600, 190, 72, "#FFFFFF", "#2E7D32", "#1B5E20", 14, true),
  simpleBox("status1", "DEGRADED", 1420, 430, 110, 44, "#FFF3D1", "#F0A500", "#7A4B13", 13, true),
  simpleBox("status2", "RESTORED", 1420, 700, 110, 44, "#E8F5E9", "#2E7D32", "#1B5E20", 13, true),
  edge("i1", "obs1", "act1", "#3F8FA9", true, [], "exitX=0.5;exitY=1;entryX=0.5;entryY=0;"),
  edge("i2", "imp1", "imp2", "#F0A500"),
  edge("i3", "act1", "act2", "#2E7D32"),
  edge("i4", "act2", "obs3", "#2E7D32", true, [[1085, 636], [1085, 372]], "rounded=0;exitX=1;exitY=0.5;entryX=0.25;entryY=1;"),
  edge("i5", "obs3", "act3", "#3F8FA9", true, [], "exitX=0.75;exitY=1;entryX=0.5;entryY=0;"),
  simpleBox("footer", "Deliberately excludes speculation. Every event should carry time, owner, action, and evidence ID.", 70, 795, 900, 58, "#FFFFFF", "#D7E4E8", "#5F6368", 14, false, "left"),
  chip("leg1", "Observation", 1030, 805, 135, "#E8F4F8", "#9DCDDA", "#1E6477"),
  chip("leg2", "Incident impact", 1185, 805, 150, "#FFF3D1", "#F0C36E", "#7A4B13"),
  chip("leg3", "Response", 1355, 805, 120, "#E8F5E9", "#A8D7AE", "#1B5E20"),
], "#FFFFFF");

writeSample("aesthetic-sample-ai-pipeline.drawio", "AI Pipeline Studio", "ai-pipeline-studio", [
  text("title", "AI Pipeline Studio", 70, 48, 580, 44, 30, "#101828", true),
  text("subtitle", "A modular model workflow layout for data, evaluation, deployment, and feedback", 72, 94, 760, 28, 15, "#5B6778"),
  chip("chip1", "ML system map", 1260, 62, 160, "#ECFDF5", "#B7E4CF", "#047857"),
  lane("data-lane", 80, 170, 310, 620, "#F0FDF4", "#CBEAD7"),
  lane("model-lane", 440, 170, 500, 620, "#F4F7FF", "#D7E1FF"),
  lane("delivery-lane", 990, 170, 430, 620, "#FFF7ED", "#FAD6A5"),
  text("data-title", "Data Foundation", 120, 205, 230, 32, 20, "#14532D", true),
  text("model-title", "Model Factory", 480, 205, 230, 32, 20, "#1E3A8A", true),
  text("delivery-title", "Delivery and Feedback", 1030, 205, 280, 32, 20, "#7C2D12", true),
  card("sources", "Source Streams", "logs, docs, events", 125, 300, 210, 90, "#10B981"),
  card("curation", "Curation", "dedupe and labeling", 125, 510, 210, 90, "#10B981"),
  card("features", "Feature Set", "versioned contracts", 500, 300, 210, 90, "#2563EB"),
  card("train", "Training Run", "tracked parameters", 760, 300, 210, 90, "#2563EB"),
  card("eval", "Evaluation", "benchmarks and gates", 760, 510, 210, 90, "#8B5CF6"),
  card("registry", "Model Registry", "approved artifacts", 1030, 300, 220, 90, "#F2994A"),
  card("serve", "Serving Layer", "API, batch, edge", 1010, 620, 220, 90, "#F2994A"),
  card("feedback", "Feedback Review", "quality and drift", 1300, 620, 210, 90, "#DC2626"),
  card("audit", "Audit Trail", "datasets and evidence", 715, 700, 260, 82, "#00A6A6"),
  edge("e1", "sources", "features", "#10B981"),
  edge("e2", "sources", "curation", "#10B981", true),
  edge("e4", "features", "train", "#2563EB"),
  edge("e5", "train", "eval", "#8B5CF6"),
  edge("e6", "eval", "registry", "#F2994A", false, [[1000, 542], [1000, 345]], "rounded=0;exitX=1;exitY=0.35;entryX=0;entryY=0.5;"),
  edge("e7", "registry", "serve", "#F2994A", false, [], "exitX=0.5;exitY=1;entryX=0.5;entryY=0;"),
  edge("e8", "serve", "feedback", "#DC2626"),
  edge("e9", "eval", "audit", "#00A6A6", true),
  chip("legend1", "Training path", 980, 830, 145, "#EAF3FF", "#BBD7FF", "#1D4ED8"),
  chip("legend2", "Governance", 1145, 830, 130, "#E6FBFB", "#B8ECEC", "#007A7A"),
  chip("legend3", "Feedback loop", 1295, 830, 140, "#FEECEC", "#F7B4B4", "#B91C1C"),
], "#FAFBFF");

writeSample("aesthetic-sample-security-incident.drawio", "Security Incident Command", "security-incident-command", [
  text("title", "Security Incident Command", 70, 48, 680, 44, 30, "#111827", true),
  text("subtitle", "A high-contrast response map for detection, containment, remediation, and executive proof", 72, 94, 860, 28, 15, "#5B6778"),
  chip("chip1", "Incident-ready", 1260, 62, 170, "#FEF2F2", "#F9B4B4", "#B91C1C"),
  lane("detect", 80, 170, 310, 620, "#F8FAFC", "#CBD5E1"),
  lane("contain", 430, 170, 350, 620, "#FFF7ED", "#FAD6A5"),
  lane("restore", 820, 170, 350, 620, "#F0FDF4", "#CBEAD7"),
  lane("proof", 1210, 170, 310, 620, "#F5F3FF", "#DDD6FE"),
  text("detect-title", "Detect", 120, 205, 220, 32, 20, "#334155", true),
  text("contain-title", "Contain", 470, 205, 220, 32, 20, "#7C2D12", true),
  text("restore-title", "Restore", 860, 205, 220, 32, 20, "#14532D", true),
  text("proof-title", "Proof", 1250, 205, 220, 32, 20, "#4C1D95", true),
  card("sensor", "Sensor Grid", "endpoint, cloud, identity", 125, 300, 210, 90, "#64748B"),
  card("triage", "Triage Room", "severity and owner", 125, 515, 210, 90, "#64748B"),
  card("scope", "Scope Blast Radius", "accounts and assets", 475, 300, 230, 90, "#F2994A"),
  card("containment", "Containment", "tokens, hosts, routes", 475, 515, 230, 90, "#DC2626"),
  card("repair", "Remediation", "patch and rotate", 865, 300, 230, 90, "#16A34A"),
  card("validate", "Validation", "clean scans and access", 865, 515, 230, 90, "#16A34A"),
  card("timeline", "Timeline", "human-readable record", 1255, 300, 210, 90, "#8B5CF6"),
  card("exec", "Executive Brief", "impact and next steps", 1255, 515, 210, 90, "#8B5CF6"),
  card("legal", "Decision Log", "approvals and holds", 675, 690, 260, 80, "#00A6A6"),
  edge("e1", "sensor", "scope", "#64748B"),
  edge("e2", "scope", "repair", "#F2994A"),
  edge("e3", "repair", "timeline", "#16A34A"),
  edge("e4", "triage", "containment", "#DC2626"),
  edge("e5", "containment", "validate", "#DC2626"),
  edge("e6", "validate", "exec", "#16A34A"),
  edge("e7", "containment", "legal", "#00A6A6", true),
  edge("e8", "legal", "exec", "#00A6A6", true, [[935, 730], [1360, 730]]),
  edge("e9", "timeline", "exec", "#8B5CF6"),
  chip("legend1", "Containment path", 955, 830, 170, "#FEF2F2", "#F9B4B4", "#B91C1C"),
  chip("legend2", "Recovery path", 1145, 830, 150, "#ECFDF5", "#B7E4CF", "#047857"),
  chip("legend3", "Governance", 1315, 830, 130, "#EDE9FE", "#C4B5FD", "#5B21B6"),
], "#F8FAFC");

writeSample("purpose-hypothesis-helix-template.drawio", "Hypothesis Helix", "purpose-hypothesis-helix", [
  text("title", "Hypothesis Helix", 70, 46, 560, 44, 32, "#F8FAFC", true),
  text("subtitle", "Purpose: turn uncertain ideas into experiment, evidence, and go/no-go decisions", 72, 92, 860, 28, 15, "#B8C7D9"),
  chip("tag", "Experiment design", 1230, 60, 190, "#102A43", "#5DADE2", "#D9F0FF"),
  lane("h-lane", 70, 175, 300, 610, "#102A43", "#5DADE2"),
  lane("e-lane", 430, 175, 300, 610, "#3B2A12", "#F5B041"),
  lane("d-lane", 790, 175, 300, 610, "#123524", "#58D68D"),
  lane("j-lane", 1150, 175, 300, 610, "#3A1717", "#E74C3C"),
  text("ht", "Hypothesis", 105, 210, 210, 30, 20, "#D9F0FF", true),
  text("et", "Experiment", 465, 210, 210, 30, 20, "#FFE8B8", true),
  text("dt", "Evidence", 825, 210, 210, 30, 20, "#CFF6DF", true),
  text("jt", "Decision", 1185, 210, 210, 30, 20, "#FFD4D4", true),
  simpleBox("h1", "If onboarding asks one focused question,\nactivation will increase.", 115, 320, 210, 90, "#0B1B2B", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("h2", "If evidence is shown near approval,\nreviewers will decide faster.", 115, 545, 210, 90, "#0B1B2B", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("expA", "A/B Test\nsingle prompt vs current flow", 475, 300, 210, 90, "#2A1F10", "#F5B041", "#FFE8B8", 14, true),
  simpleBox("expB", "Shadow Review\nnew proof panel only", 475, 545, 210, 90, "#2A1F10", "#F5B041", "#FFE8B8", 14, true),
  simpleBox("dataA", "Result\n+9% activation\nsample: 1,240", 835, 300, 210, 90, "#10291C", "#58D68D", "#CFF6DF", 14, true),
  simpleBox("dataB", "Result\n-18h median review\nsample: 86", 835, 545, 210, 90, "#10291C", "#58D68D", "#CFF6DF", 14, true),
  simpleBox("go", "GO\nship narrow variant", 1200, 300, 210, 90, "#2A1111", "#58D68D", "#DDFBE8", 16, true),
  simpleBox("hold", "ITERATE\ncopy needs one more pass", 1200, 545, 210, 90, "#2A1111", "#E74C3C", "#FFD4D4", 16, true),
  edge("x1", "h1", "expA", "#5DADE2"),
  edge("x2", "expA", "dataA", "#F5B041"),
  edge("x3", "dataA", "go", "#58D68D"),
  edge("x4", "h2", "expB", "#5DADE2"),
  edge("x5", "expB", "dataB", "#F5B041"),
  edge("x6", "dataB", "hold", "#E74C3C"),
  edge("x7", "hold", "h2", "#E74C3C", true, [[1120, 735], [250, 735]], "exitX=0.5;exitY=1;entryX=0.5;entryY=1;"),
  simpleBox("rule", "Deliberately excludes implementation architecture and calendar timelines. Use this when the question is: what should we test next?", 70, 830, 980, 58, "#0B1B2B", "#31485E", "#B8C7D9", 14, false, "left"),
  chip("leg1", "Hypothesis", 1090, 840, 135, "#102A43", "#5DADE2", "#D9F0FF"),
  chip("leg2", "Experiment", 1245, 840, 135, "#3B2A12", "#F5B041", "#FFE8B8"),
  chip("leg3", "Decision", 1400, 840, 115, "#3A1717", "#E74C3C", "#FFD4D4"),
], "#0B1B2B");

writeSample("purpose-feature-value-matrix-template.drawio", "Feature Value Matrix", "purpose-feature-value-matrix", [
  text("title", "Feature Value Matrix", 70, 46, 620, 44, 32, "#202124", true),
  text("subtitle", "Purpose: compare feature candidates by impact, effort, and delivery risk", 72, 92, 780, 28, 15, "#5F6368"),
  chip("tag", "Prioritization map", 1230, 60, 190, "#F1F5F9", "#94A3B8", "#334155"),
  lane("plot", 190, 180, 980, 620, "#FFFFFF", "#CBD5E1"),
  text("y-label", "Higher Impact", 220, 190, 210, 30, 18, "#334155", true),
  text("x-label", "Higher Effort", 960, 782, 180, 30, 18, "#334155", true),
  simpleBox("q1", "QUICK WINS", 240, 250, 260, 58, "#E8F5E9", "#2E7D32", "#1B5E20", 16, true),
  simpleBox("q2", "STRATEGIC BETS", 760, 250, 290, 58, "#E8F4F8", "#3F8FA9", "#1E6477", 16, true),
  simpleBox("q3", "FILL-INS", 240, 610, 260, 58, "#F8FAFC", "#94A3B8", "#334155", 16, true),
  simpleBox("q4", "DEFER", 760, 610, 290, 58, "#FFF3D1", "#F0A500", "#7A4B13", 16, true),
  simpleBox("f1", "Unified Search\nR: low", 325, 350, 190, 76, "#FFFFFF", "#2E7D32", "#1B5E20", 14, true),
  simpleBox("f2", "Evidence Panel\nR: med", 555, 330, 210, 84, "#FFFFFF", "#F0A500", "#7A4B13", 14, true),
  simpleBox("f3", "Offline Mode\nR: high", 850, 395, 210, 84, "#FFFFFF", "#C62828", "#8A1F1F", 14, true),
  simpleBox("f4", "Theme Polish\nR: low", 340, 685, 180, 64, "#FFFFFF", "#64748B", "#334155", 14, true),
  simpleBox("f5", "Realtime Sync\nR: high", 850, 665, 210, 76, "#FFFFFF", "#C62828", "#8A1F1F", 14, true),
  simpleBox("axisY", "", 200, 260, 4, 470, "#CBD5E1", "#CBD5E1", "#CBD5E1", 1, false),
  simpleBox("axisX", "", 200, 775, 900, 4, "#CBD5E1", "#CBD5E1", "#CBD5E1", 1, false),
  simpleBox("legend", "Size = priority weight\nGreen = low risk\nAmber = medium risk\nRed = high risk", 1230, 270, 260, 150, "#FFFFFF", "#CBD5E1", "#334155", 14, false, "left"),
  simpleBox("purpose", "Deliberately excludes project schedule and dependency routes. Use this when the question is: what should we build first?", 210, 835, 900, 58, "#FFFFFF", "#CBD5E1", "#5F6368", 14, false, "left"),
], "#F8FAFC");

writeSample("purpose-value-conversion-sheet-template.drawio", "Value Conversion Sheet", "purpose-value-conversion-sheet", [
  text("title", "Value Conversion Sheet", 70, 46, 660, 44, 32, "#F8FAFC", true),
  text("subtitle", "Purpose: convert user pain into touchpoints, design intervention, and measurable value", 72, 92, 900, 28, 15, "#C9D3E6"),
  chip("tag", "Cross-functional value", 1210, 60, 230, "#243B63", "#82E0AA", "#E7FFF0"),
  lane("pain", 70, 175, 300, 610, "#202E4A", "#5DADE2"),
  lane("touch", 430, 175, 300, 610, "#17243B", "#5DADE2"),
  lane("value", 790, 175, 300, 610, "#173326", "#82E0AA"),
  lane("risk", 1150, 175, 300, 610, "#3B3010", "#F4D03F"),
  text("pt", "User Pain", 105, 210, 210, 30, 20, "#D9F0FF", true),
  text("tt", "Touchpoint", 465, 210, 210, 30, 20, "#D9F0FF", true),
  text("vt", "Value Delivered", 825, 210, 240, 30, 20, "#E7FFF0", true),
  text("rt", "Metric / Gap", 1185, 210, 210, 30, 20, "#FFF5C2", true),
  simpleBox("p1", "Pain\nreview evidence is scattered", 115, 325, 210, 86, "#16243E", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("p2", "Pain\nhandoff loses context", 115, 550, 210, 86, "#16243E", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("t1", "Touchpoint\napproval panel", 475, 325, 210, 86, "#10243E", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("t2", "Touchpoint\nhandoff note", 475, 550, 210, 86, "#10243E", "#5DADE2", "#D9F0FF", 14, true),
  simpleBox("v1", "Value\none-screen proof", 835, 325, 210, 86, "#103524", "#82E0AA", "#E7FFF0", 14, true),
  simpleBox("v2", "Value\ncontinuity across teams", 835, 550, 210, 86, "#103524", "#82E0AA", "#E7FFF0", 14, true),
  simpleBox("m1", "Metric\nreview time 57h -> 31h", 1195, 325, 210, 86, "#2A250E", "#F4D03F", "#FFF5C2", 14, true),
  simpleBox("m2", "Gap\nsupport owner missing", 1195, 550, 210, 86, "#3A1717", "#E74C3C", "#FFD4D4", 14, true),
  edge("v1a", "p1", "t1", "#5DADE2"),
  edge("v1b", "t1", "v1", "#82E0AA"),
  edge("v1c", "v1", "m1", "#F4D03F"),
  edge("v2a", "p2", "t2", "#5DADE2"),
  edge("v2b", "t2", "v2", "#82E0AA"),
  edge("v2c", "v2", "m2", "#E74C3C"),
  simpleBox("rule", "Deliberately excludes dependency maps and incident chronology. Use this when the question is: how does work become user value?", 70, 830, 970, 58, "#16243E", "#31485E", "#C9D3E6", 14, false, "left"),
  chip("leg1", "Pain", 1080, 840, 90, "#202E4A", "#5DADE2", "#D9F0FF"),
  chip("leg2", "Value", 1190, 840, 100, "#173326", "#82E0AA", "#E7FFF0"),
  chip("leg3", "Metric / gap", 1310, 840, 145, "#3B3010", "#F4D03F", "#FFF5C2"),
], "#16243E");
