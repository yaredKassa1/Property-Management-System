const { Op } = require("sequelize");
const db = require("../models");

const parseRangeCreatedAt = (startDate, endDate) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) { const end = new Date(endDate); end.setHours(23,59,59,999); where.createdAt[Op.lte] = end; }
  }
  return where;
};

const assetStatusReport = async (req, res, next) => {
  try {
    const assets = await db.Asset.findAll({ include: [{ model: db.User, as: "assignedUser", attributes: ["id","firstName","lastName","workUnit"] }], order: [["status","ASC"],["name","ASC"]] });
    const summary = { total: assets.length, available: assets.filter(a=>a.status==="available").length, assigned: assets.filter(a=>a.status==="assigned").length, under_maintenance: assets.filter(a=>a.status==="under_maintenance").length, in_transfer: assets.filter(a=>a.status==="in_transfer").length, disposed: assets.filter(a=>a.status==="disposed").length };
    const rows = assets.map(a => ({ assetId: a.assetId, name: a.name, category: a.category, status: a.status, condition: a.condition, location: a.location||"", workUnit: a.workUnit||"", assignedTo: a.assignedUser ? `${a.assignedUser.firstName} ${a.assignedUser.lastName}` : "", assignedWorkUnit: a.assignedUser?.workUnit||"", value: a.value||0, purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : "" }));
    res.json({ success: true, data: { summary, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const transferReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const transfers = await db.Transfer.findAll({ where: parseRangeCreatedAt(startDate, endDate), include: [{ model: db.Asset, as: "asset", attributes: ["assetId","name","category"] },{ model: db.User, as: "fromUser", attributes: ["firstName","lastName","workUnit"] },{ model: db.User, as: "toUser", attributes: ["firstName","lastName","workUnit"] },{ model: db.User, as: "requester", attributes: ["firstName","lastName"] }], order: [["createdAt","DESC"]] });
    const summary = { total: transfers.length, pending: transfers.filter(t=>t.status==="pending").length, approved: transfers.filter(t=>t.status==="approved").length, completed: transfers.filter(t=>t.status==="completed").length, rejected: transfers.filter(t=>t.status==="rejected").length };
    const rows = transfers.map(t => ({ id: t.id.slice(0,8), assetId: t.asset?.assetId||"", assetName: t.asset?.name||"", category: t.asset?.category||"", from: t.fromUser ? `${t.fromUser.firstName} ${t.fromUser.lastName}` : "Storage", fromWorkUnit: t.fromUser?.workUnit||"", to: t.toUser ? `${t.toUser.firstName} ${t.toUser.lastName}` : "", toWorkUnit: t.toUser?.workUnit||"", requestedBy: t.requester ? `${t.requester.firstName} ${t.requester.lastName}` : "", status: t.status, reason: t.reason||"", date: new Date(t.createdAt).toLocaleDateString() }));
    res.json({ success: true, data: { summary, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const inventoryReport = async (req, res, next) => {
  try {
    const assets = await db.Asset.findAll({ order: [["category","ASC"],["workUnit","ASC"],["name","ASC"]] });
    const byCategory = {};
    assets.forEach(a => { if (!byCategory[a.category]) byCategory[a.category] = { total:0, available:0, assigned:0, value:0 }; byCategory[a.category].total++; if (a.status==="available") byCategory[a.category].available++; if (a.status==="assigned") byCategory[a.category].assigned++; byCategory[a.category].value += parseFloat(a.value||0); });
    const totalValue = assets.reduce((s,a) => s + parseFloat(a.value||0), 0);
    const rows = assets.map(a => ({ assetId: a.assetId, name: a.name, category: a.category, status: a.status, condition: a.condition, workUnit: a.workUnit||"", location: a.location||"", value: parseFloat(a.value||0).toFixed(2) }));
    res.json({ success: true, data: { summary: { total: assets.length, totalValue: totalValue.toFixed(2) }, byCategory, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const assetAssignmentReport = async (req, res, next) => {
  try {
    const assets = await db.Asset.findAll({ where: { status: "assigned" }, include: [{ model: db.User, as: "assignedUser", attributes: ["id","firstName","middleName","lastName","workUnit","role"] }], order: [["workUnit","ASC"],["name","ASC"]] });
    const byWorkUnit = {};
    assets.forEach(a => { const unit = a.workUnit||"Unassigned"; if (!byWorkUnit[unit]) byWorkUnit[unit]=0; byWorkUnit[unit]++; });
    const rows = assets.map(a => ({ assetId: a.assetId, name: a.name, category: a.category, condition: a.condition, workUnit: a.workUnit||"", location: a.location||"", assignedTo: a.assignedUser ? `${a.assignedUser.firstName} ${a.assignedUser.lastName}` : "", assignedUserWorkUnit: a.assignedUser?.workUnit||"", value: parseFloat(a.value||0).toFixed(2) }));
    res.json({ success: true, data: { summary: { totalAssigned: assets.length, workUnits: Object.keys(byWorkUnit).length }, byWorkUnit, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const overdueReturnsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const returns = await db.Return.findAll({ where: parseRangeCreatedAt(startDate, endDate), include: [{ model: db.Asset, as: "asset", attributes: ["assetId","name","category","workUnit"] },{ model: db.User, as: "returner", attributes: ["firstName","lastName","workUnit"] }], order: [["returnDate","DESC"]] });
    const summary = { total: returns.length, pending: returns.filter(r=>r.status==="pending").length, received: returns.filter(r=>r.status==="received").length, completed: returns.filter(r=>r.status==="completed").length, rejected: returns.filter(r=>r.status==="rejected").length };
    const rows = returns.map(r => { const days = Math.floor((Date.now()-new Date(r.returnDate).getTime())/(1000*60*60*24)); return { assetId: r.asset?.assetId||"", assetName: r.asset?.name||"", category: r.asset?.category||"", returnedBy: r.returner ? `${r.returner.firstName} ${r.returner.lastName}` : "", workUnit: r.returner?.workUnit||"", returnDate: new Date(r.returnDate).toLocaleDateString(), daysSinceReturn: days, status: r.status, reason: r.reason||"" }; });
    res.json({ success: true, data: { summary, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const workUnitSummaryReport = async (req, res, next) => {
  try {
    const assets = await db.Asset.findAll({ order: [["workUnit","ASC"],["name","ASC"]] });
    const byWorkUnit = {};
    assets.forEach(a => { const unit = a.workUnit||"Unassigned"; if (!byWorkUnit[unit]) byWorkUnit[unit]={ total:0, available:0, assigned:0, under_maintenance:0, totalValue:0 }; byWorkUnit[unit].total++; byWorkUnit[unit].totalValue += parseFloat(a.value||0); if (a.status==="available") byWorkUnit[unit].available++; else if (a.status==="assigned") byWorkUnit[unit].assigned++; else if (a.status==="under_maintenance") byWorkUnit[unit].under_maintenance++; });
    const rows = Object.entries(byWorkUnit).map(([unit, s]) => ({ workUnit: unit, total: s.total, available: s.available, assigned: s.assigned, under_maintenance: s.under_maintenance, totalValue: s.totalValue.toFixed(2) }));
    res.json({ success: true, data: { summary: { totalWorkUnits: rows.length, totalAssets: assets.length, totalValue: assets.reduce((s,a)=>s+parseFloat(a.value||0),0).toFixed(2) }, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const assetConditionReport = async (req, res, next) => {
  try {
    const assets = await db.Asset.findAll({ include: [{ model: db.User, as: "assignedUser", attributes: ["firstName","lastName","workUnit"] }], order: [["condition","ASC"],["name","ASC"]] });
    const summary = { total: assets.length, excellent: assets.filter(a=>a.condition==="excellent").length, good: assets.filter(a=>a.condition==="good").length, fair: assets.filter(a=>a.condition==="fair").length, poor: assets.filter(a=>a.condition==="poor").length, damaged: assets.filter(a=>a.condition==="damaged").length };
    const rows = assets.map(a => ({ assetId: a.assetId, name: a.name, category: a.category, condition: a.condition, status: a.status, workUnit: a.workUnit||"", location: a.location||"", assignedTo: a.assignedUser ? `${a.assignedUser.firstName} ${a.assignedUser.lastName}` : "", value: parseFloat(a.value||0).toFixed(2) }));
    res.json({ success: true, data: { summary, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

const requestStatusReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const requests = await db.Request.findAll({ where: parseRangeCreatedAt(startDate, endDate), include: [{ model: db.User, as: "requester", attributes: ["firstName","lastName","workUnit","role"] },{ model: db.Asset, as: "asset", attributes: ["assetId","name"] }], order: [["createdAt","DESC"]] });
    const summary = { total: requests.length, pending: requests.filter(r=>r.status==="pending").length, approved: requests.filter(r=>r.status==="approved").length, rejected: requests.filter(r=>r.status==="rejected").length, completed: requests.filter(r=>r.status==="completed").length };
    const rows = requests.map(r => ({ requestId: r.id.slice(0,8), type: r.requestType||"", assetId: r.asset?.assetId||"", assetName: r.asset?.name||"", requestedBy: r.requester ? `${r.requester.firstName} ${r.requester.lastName}` : "", workUnit: r.requester?.workUnit||"", status: r.status, priority: r.priority||"", date: new Date(r.createdAt).toLocaleDateString() }));
    res.json({ success: true, data: { summary, rows, generatedAt: new Date() } });
  } catch (err) { next(err); }
};

module.exports = { assetStatusReport, transferReport, inventoryReport, assetAssignmentReport, overdueReturnsReport, workUnitSummaryReport, assetConditionReport, requestStatusReport };