/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const OUT = path.join(process.cwd(), 'docs/generated/aidrun-dual-role-ui-board.svg');

const COLORS = {
  ink: '#121212',
  sand: '#E7DDCE',
  canvas: '#F6F1E8',
  sun: '#E4B84D',
  clay: '#C76B4B',
  blindBg: '#0D0D0D',
  blindSurface: '#171717',
  blindText: '#F7F2E8',
  blindPrimary: '#F4C64E',
  volunteerBg: '#F7F2E9',
  volunteerSheet: '#FFFDFC',
  volunteerLine: '#D7CCBC',
  success: '#2E6B4C',
  warning: '#D18B1F',
  danger: '#C63A2D',
  softDanger: '#FCE5E0',
  softWarning: '#FFF2D2',
  softSuccess: '#E9F2EC',
  muted: '#5B534A',
  mutedDark: '#D9CFBE',
};

const FONT = `'Noto Sans SC', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif`;

const blindScreens = [
  ['角色进入页', '同一 App 的双角色入口'],
  ['语音登录 / 身份引导', '零键盘输入的首屏登录'],
  ['紧急联系人设置', '认证链路中的安全必填项'],
  ['极简首页', '只保留一键跑步和紧急求助'],
  ['位置确认', '自然语言地点确认'],
  ['时间确认', '语音提取跑步时间段'],
  ['订单提交成功', '提交后进入匹配播报'],
  ['匹配中', '持续反馈供需状态'],
  ['匹配延迟', '延迟时提供替代方案'],
  ['志愿者接单通知', '接单后播报核心信息'],
  ['服务中状态', '低干扰、高安全感的陪跑状态'],
  ['偏航预警', '高风险状态强化视觉等级'],
  ['完成确认', '结束后通过二选一确认'],
  ['语音评价', '点赞和评论都走语音'],
  ['SOS 触发页', '全局最高优先级状态'],
  ['简化个人中心', '只保留必要服务与安全入口'],
];

const volunteerScreens = [
  ['手机号注册', '注册入口清晰且轻量'],
  ['实名认证', '上传身份证后进入核验'],
  ['人脸核验', '摄像头引导页'],
  ['培训视频', '3 个短模块完成培训'],
  ['考试通过状态', '即时开放接单能力'],
  ['首页待命态', '地图 + 状态开关 + 待命信息'],
  ['订单推送态', '高匹配订单弹出'],
  ['订单详情', '接单前完整决策页'],
  ['接单成功', '已锁定订单并准备联系'],
  ['联系盲人', '标准化联系入口'],
  ['路线导航 / 服务中', '路径和时间线同步'],
  ['完成服务 / 积分到账', '服务闭环反馈页'],
  ['服务记录', '历史订单列表'],
  ['积分明细', '积分来源与消耗流水'],
  ['积分商城列表', '商品筛选和卡片浏览'],
  ['商品详情 / 兑换', '突出积分门槛与地址信息'],
  ['我的资料', '聚合个人设置与消息帮助'],
  ['可服务时间设置', '减少时间冲突'],
  ['消息中心', '系统消息分类聚合'],
  ['帮助中心', 'FAQ 和客服入口'],
];

const safetyScreens = [
  ['匹配延迟', '等待超时提醒', '提醒'],
  ['未匹配成功', '明确结束本轮匹配', '风险升级'],
  ['盲人取消订单', '同步志愿者与平台', '提醒'],
  ['志愿者取消申请', '需要理由和审核', '风险升级'],
  ['路线偏离提醒', '偏航高风险状态', '强制求助'],
  ['长时间停留提醒', '停滞异常识别', '提醒'],
  ['紧急求助联动', 'SOS 全链路响应', '强制求助'],
  ['服务完成但需修改', '对服务事实提出修正', '提醒'],
  ['争议反馈入口', '标准化纠纷处理入口', '风险升级'],
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rect(x, y, w, h, fill, rx = 0, stroke = '', strokeWidth = 1, extra = '') {
  const strokeAttrs = stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${strokeAttrs}${extra}/>`;
}

function circle(cx, cy, r, fill, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${extra}/>`;
}

function line(x1, y1, x2, y2, stroke, strokeWidth = 1, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}"${extra}/>`;
}

function text(x, y, value, size = 16, fill = COLORS.ink, weight = 400, anchor = 'start') {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;
}

function multiline(x, y, lines, size = 14, fill = COLORS.muted, weight = 400, lineHeight = size + 8) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines
    .map((lineText, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${esc(lineText)}</tspan>`)
    .join('')}</text>`;
}

function chip(x, y, label, fill, color, width = 112) {
  return [
    rect(x, y, width, 30, fill, 15),
    text(x + width / 2, y + 20, label, 12, color, 700, 'middle'),
  ].join('');
}

function sectionShell(x, y, w, h, title, subtitle) {
  return [
    rect(x, y, w, h, '#F3ECE2', 30, '#DED4C6'),
    text(x + 32, y + 54, title, 32, COLORS.ink, 800),
    multiline(x + 32, y + 90, [subtitle], 16, COLORS.muted, 400, 24),
  ].join('');
}

function noteCard(x, y, label, body, theme = 'light') {
  const bg = theme === 'dark' ? '#1A1A1A' : '#FFFDFC';
  const stroke = theme === 'dark' ? '#2A2A2A' : '#DED3C4';
  const labelColor = theme === 'dark' ? COLORS.blindPrimary : COLORS.ink;
  const bodyColor = theme === 'dark' ? '#E5DAC4' : COLORS.muted;
  return [
    rect(x, y, 250, 128, bg, 20, stroke),
    text(x + 16, y + 28, label, 15, labelColor, 800),
    multiline(x + 16, y + 56, [body], 13, bodyColor, 400, 20),
  ].join('');
}

function phoneShell(x, y, role = 'blind') {
  const isBlind = role === 'blind';
  const screenFill = isBlind ? COLORS.blindBg : COLORS.volunteerBg;
  const shell = [];
  shell.push(rect(x, y, 300, 650, '#0B0B0B', 28, '#2A2A2A'));
  shell.push(rect(x + 10, y + 10, 280, 630, screenFill, 22));
  shell.push(rect(x + 104, y + 6, 92, 8, isBlind ? '#222' : '#CFC5B7', 4));
  shell.push(text(x + 22, y + 34, '09:41', 11, isBlind ? COLORS.blindText : COLORS.ink, 700));
  shell.push(rect(x + 244, y + 26, 13, 7, isBlind ? COLORS.blindText : COLORS.ink, 2));
  shell.push(rect(x + 261, y + 26, 10, 7, isBlind ? COLORS.blindText : COLORS.ink, 2, '', 1, ' opacity="0.75"'));
  shell.push(rect(x + 275, y + 26, 13, 7, isBlind ? COLORS.blindText : COLORS.ink, 2, '', 1, ' opacity="0.45"'));
  return shell.join('');
}

function renderBlindScreen(x, y, idx, titleText, subtitle) {
  const items = [];
  items.push(rect(x, y, 620, 860, '#121212', 24, '#272727'));
  items.push(text(x + 22, y + 40, titleText, 22, COLORS.blindText, 800));
  items.push(multiline(x + 22, y + 72, [subtitle], 13, '#D8CCB8', 400, 20));
  items.push(phoneShell(x + 22, y + 96, 'blind'));
  items.push(chip(x + 42, y + 144, '盲人端', '#1E1E1E', COLORS.blindPrimary, 76));
  items.push(text(x + 58, y + 192, blindScreens[idx][0], 22, COLORS.blindText, 800));
  items.push(multiline(x + 42, y + 224, [blindScreens[idx][1]], 13, '#D7CCB8', 400, 20));

  const px = x + 42;
  const py = y + 280;

  if (idx === 0) {
    items.push(rect(px, py, 236, 102, COLORS.blindPrimary, 22));
    items.push(rect(px, py + 120, 236, 102, '#171717', 22, '#2A2A2A'));
    items.push(text(px + 118, py + 58, '盲人端', 26, COLORS.ink, 800, 'middle'));
    items.push(text(px + 118, py + 178, '志愿者端', 26, COLORS.blindText, 800, 'middle'));
  } else if (idx === 3) {
    items.push(rect(px, py, 236, 134, COLORS.blindPrimary, 26));
    items.push(rect(px, py + 152, 236, 116, COLORS.danger, 26));
    items.push(text(px + 118, py + 76, '一键跑步', 28, COLORS.ink, 800, 'middle'));
    items.push(text(px + 118, py + 218, '紧急求助', 28, COLORS.blindText, 800, 'middle'));
  } else if (idx === 14) {
    items.push(rect(px, py, 236, 418, COLORS.danger, 26));
    items.push(text(px + 20, py + 46, '紧急求助已触发', 24, '#FFF8F5', 800));
    items.push(multiline(px + 20, py + 84, ['系统正在同步位置并自动拨打', '紧急联系人与平台客服。'], 14, '#FFE8E2', 400, 22));
    ['已通知志愿者', '已发送定位短信', '正在呼叫紧急联系人'].forEach((t, i) => {
      items.push(rect(px + 18, py + 136 + i * 76, 200, 58, '#B33226', 18));
      items.push(text(px + 34, py + 171 + i * 76, t, 15, '#FFF8F5', 700));
    });
  } else {
    items.push(rect(px, py, 236, 94, '#171717', 20, '#2A2A2A'));
    items.push(text(px + 18, py + 30, blindScreens[idx][0], 16, COLORS.blindText, 700));
    items.push(multiline(px + 18, py + 56, [blindScreens[idx][1]], 12, '#D7CCB8', 400, 18));
    items.push(rect(px, py + 116, 236, 80, idx === 8 || idx === 11 ? COLORS.danger : COLORS.blindPrimary, 20));
    items.push(text(px + 118, py + 164, idx === 8 ? '更换时间段' : idx === 11 ? '立即求助' : '确认继续', 20, idx === 8 || idx === 11 ? COLORS.blindText : COLORS.ink, 800, 'middle'));
    items.push(rect(px, py + 214, 236, 72, '#171717', 20, '#2A2A2A'));
    items.push(text(px + 118, py + 258, idx === 8 ? '调整起点' : '查看详情', 18, COLORS.blindText, 700, 'middle'));
  }

  items.push(noteCard(x + 330, y + 170, '语音播报', `示例：${blindScreens[idx][0]} 的关键语音提示。`, 'dark'));
  items.push(noteCard(x + 330, y + 318, '震动反馈', '关键状态短震 1-2 次，风险态连续短震。', 'dark'));
  items.push(noteCard(x + 330, y + 466, '误触防护', '仅保留主动作，次级操作明确下沉。', 'dark'));
  return items.join('');
}

function renderVolunteerScreen(x, y, idx, titleText, subtitle) {
  const items = [];
  items.push(rect(x, y, 620, 860, COLORS.volunteerBg, 24, COLORS.volunteerLine));
  items.push(text(x + 22, y + 40, titleText, 22, COLORS.ink, 800));
  items.push(multiline(x + 22, y + 72, [subtitle], 13, COLORS.muted, 400, 20));
  items.push(phoneShell(x + 22, y + 96, 'volunteer'));
  items.push(chip(x + 42, y + 144, '志愿者端', COLORS.ink, COLORS.blindText, 86));
  items.push(text(x + 58, y + 192, volunteerScreens[idx][0], 22, COLORS.ink, 800));
  items.push(multiline(x + 42, y + 224, [volunteerScreens[idx][1]], 13, COLORS.muted, 400, 20));

  const px = x + 42;
  const py = y + 278;

  if (idx >= 5 && idx <= 10) {
    items.push(rect(px - 18, py - 40, 236, 250, '#ECE4D7', 24));
    items.push(line(px + 14, py + 6, px + 188, py + 164, '#121212', 12, ' stroke-linecap="round" opacity="0.85"'));
    items.push(line(px + 28, py + 42, px + 206, py + 14, '#D8CCBC', 10, ' stroke-linecap="round"'));
    items.push(line(px + 12, py + 148, px + 192, py + 98, '#D0C4B5', 10, ' stroke-linecap="round"'));
    items.push(circle(px + 46, py + 46, 12, '#121212'));
    items.push(circle(px + 184, py + 118, 12, COLORS.sun));
  }

  if (idx === 0 || idx === 1 || idx === 2) {
    items.push(rect(px, py, 236, 168, '#FFFDFC', 20, '#E1D6C8'));
    items.push(text(px + 18, py + 28, idx === 0 ? '手机号' : idx === 1 ? '身份证正面' : '开始识别', 15, COLORS.muted, 700));
    items.push(rect(px + 18, py + 46, 200, 42, '#F8F2EA', 14, '#E2D6C6'));
    items.push(text(px + 30, py + 73, idx === 0 ? '138 0000 8888' : idx === 1 ? '上传照片' : '请正视镜头', 18, COLORS.ink, 800));
    items.push(rect(px, py + 196, 236, 56, COLORS.ink, 18));
    items.push(text(px + 118, py + 230, idx === 0 ? '注册并继续' : idx === 1 ? '开始人脸核验' : '开始识别', 16, COLORS.blindText, 800, 'middle'));
  } else if (idx === 5 || idx === 6 || idx === 8 || idx === 10) {
    items.push(rect(px - 18, py + 184, 272, 220, '#FFFDFC', 24, '#E1D6C8'));
    items.push(rect(px + 80, py + 198, 80, 6, '#D7CCBC', 3));
    items.push(text(px, py + 230, idx === 5 ? '首页待命' : idx === 6 ? '候选订单' : idx === 8 ? '前往碰面点' : '服务时间线', 20, COLORS.ink, 800));
    items.push(rect(px, py + 254, 236, 82, '#FFFDFC', 18, '#E1D6C8'));
    items.push(text(px + 14, py + 280, idx === 5 ? '今日可服务 18:00-20:00' : idx === 6 ? '人民公园东门' : idx === 8 ? '盲人用户 · 林先生' : '18:03 已碰面', 15, COLORS.ink, 800));
    items.push(multiline(px + 14, py + 304, [idx === 10 ? '地点：人民公园东门' : '系统匹配度高，适合立即接单'], 12, COLORS.muted, 400, 18));
    items.push(rect(px, py + 354, 236, 50, COLORS.ink, 16));
    items.push(text(px + 118, py + 385, idx === 6 ? '一键接单' : idx === 10 ? '完成服务' : '立即联系', 15, COLORS.blindText, 800, 'middle'));
  } else {
    items.push(rect(px, py, 236, 100, '#FFFDFC', 20, '#E1D6C8'));
    items.push(text(px + 16, py + 30, volunteerScreens[idx][0], 16, COLORS.ink, 800));
    items.push(multiline(px + 16, py + 58, [volunteerScreens[idx][1]], 12, COLORS.muted, 400, 18));
    items.push(rect(px, py + 124, 236, 56, COLORS.ink, 18));
    items.push(text(px + 118, py + 158, idx === 15 ? '立即兑换' : idx === 19 ? '联系客服' : '继续操作', 16, COLORS.blindText, 800, 'middle'));
    items.push(rect(px, py + 198, 236, 72, '#FFFDFC', 18, '#E1D6C8'));
    items.push(text(px + 16, py + 242, idx === 13 ? '当前积分 268' : idx === 18 ? '2 条未读消息' : '辅助信息', 18, COLORS.ink, 800));
  }

  items.push(noteCard(x + 330, y + 170, '信息优先级', '距离、时间、位置与风险信息优先。'));
  items.push(noteCard(x + 330, y + 318, 'CTA 顺序', '主动作置前，次级动作保持可见但不抢占。'));
  items.push(noteCard(x + 330, y + 466, '地图 / 卡片联动', '地图提供上下文，卡片承载决策与完成闭环。'));
  return items.join('');
}

function renderSafetyScreen(x, y, idx, titleText, subtitle, level) {
  const items = [];
  const levelFill = level === '强制求助' ? COLORS.softDanger : level === '风险升级' ? COLORS.softDanger : COLORS.softWarning;
  const levelColor = level === '强制求助' ? COLORS.danger : level === '风险升级' ? COLORS.danger : '#8A6100';
  items.push(rect(x, y, 620, 860, COLORS.volunteerBg, 24, COLORS.volunteerLine));
  items.push(text(x + 22, y + 40, titleText, 22, COLORS.ink, 800));
  items.push(multiline(x + 22, y + 72, [subtitle], 13, COLORS.muted, 400, 20));
  items.push(phoneShell(x + 22, y + 96, 'volunteer'));
  items.push(chip(x + 42, y + 144, '安全态', COLORS.softDanger, COLORS.danger, 70));
  items.push(text(x + 58, y + 192, safetyScreens[idx][0], 22, COLORS.ink, 800));
  items.push(multiline(x + 42, y + 224, [safetyScreens[idx][1]], 13, COLORS.muted, 400, 20));
  items.push(rect(x + 42, y + 278, 236, 116, levelFill, 22, '#E1D6C8'));
  items.push(text(x + 58, y + 308, level, 20, levelColor, 800));
  items.push(multiline(x + 58, y + 340, ['系统提示并要求用户立刻确认当前情况。'], 13, COLORS.muted, 400, 18));
  items.push(rect(x + 42, y + 418, 236, 56, COLORS.ink, 18));
  items.push(text(x + 160, y + 452, '查看处理方案', 16, COLORS.blindText, 800, 'middle'));
  items.push(rect(x + 42, y + 492, 236, 56, '#FFFDFC', 18, '#E1D6C8'));
  items.push(text(x + 160, y + 526, '联系平台', 16, COLORS.ink, 800, 'middle'));
  items.push(noteCard(x + 330, y + 170, '触发条件', '超过阈值后自动进入异常态。'));
  items.push(noteCard(x + 330, y + 318, '系统响应', '同步提醒盲人、志愿者、联系人与平台。'));
  items.push(noteCard(x + 330, y + 466, '风险级别', `${level}，影响界面颜色和动作优先级。`));
  return items.join('');
}

const COLS = 4;
const BOARD_W = 620;
const BOARD_H = 860;
const GAP_X = 28;
const GAP_Y = 26;

let svg = [];
const totalHeight = 14480;
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="2720" height="${totalHeight}" viewBox="0 0 2720 ${totalHeight}">`);
svg.push(rect(0, 0, 2720, totalHeight, '#ECE4D7'));

svg.push(sectionShell(40, 40, 2640, 1140, '00 Cover', '助盲跑双端高保真 Figma 导入板：封面、基础层、组件目录、盲人端、志愿者端和安全态一次成稿。'));
svg.push(rect(72, 150, 1120, 970, '#121212', 32));
svg.push(circle(1040, 188, 180, COLORS.sun, ' opacity="0.14"'));
svg.push(text(130, 250, '助盲跑', 72, COLORS.blindText, 800));
svg.push(multiline(130, 318, ['连接盲人跑者与志愿者的移动端体验方案，', '围绕安全、效率与陪伴重构双角色服务流程。'], 24, '#E7DDCC', 400, 36));
['单 App / 双角色', '极简盲操 + 高效接单', '温暖中性 + Uber 式秩序感', '页面 / 标注 / 组件一体交付'].forEach((item, i) => {
  svg.push(rect(130, 430 + i * 136, 930, 98, '#181818', 22, '#2C2C2C'));
  svg.push(text(162, 470 + i * 136, `0${i + 1}`, 15, '#CBBE9A', 700));
  svg.push(text(220, 490 + i * 136, item, 28, COLORS.blindText, 800));
});
svg.push(rect(1230, 150, 1418, 970, '#FFFDFC', 32, '#E0D5C7'));
svg.push(text(1282, 232, '产品骨架', 40, COLORS.ink, 800));
svg.push(multiline(1282, 282, ['受 Figma Starter 页面数限制启发，最终文件采用 3 个页面 + 6 个 Section。', '新账号可编辑后，可将这张完整设计板导入并继续拆成更细的 Figma 组件。'], 18, COLORS.muted, 400, 28));
[
  ['安全优先', COLORS.danger, '异常预警、SOS、紧急联系人与平台联动先于一切。'],
  ['极简盲操', COLORS.sun, '盲人端只保留必须动作，不用底部导航。'],
  ['高效接单', COLORS.ink, '志愿者端以地图、订单卡与单步 CTA 为核心。'],
  ['温暖陪伴', COLORS.clay, '降低距离感，保留公益的温度而不是冰冷科技感。'],
].forEach((item, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const bx = 1282 + col * 340;
  const by = 380 + row * 188;
  svg.push(rect(bx, by, 300, 150, '#F7F2E9', 22, '#E6DACB'));
  svg.push(circle(bx + 22, by + 24, 8, item[1]));
  svg.push(text(bx + 42, by + 32, item[0], 24, COLORS.ink, 800));
  svg.push(multiline(bx + 22, by + 68, [item[2]], 14, COLORS.muted, 400, 22));
});
svg.push(rect(1282, 760, 1316, 300, '#121212', 28));
svg.push(text(1314, 818, '双端链路', 28, COLORS.blindText, 800));
[
  ['盲人端', '登录 / 一键跑步 / 语音确认 / 匹配 / 服务中 / 完成评价', COLORS.blindPrimary],
  ['志愿者端', '认证 / 待命 / 订单详情 / 联系导航 / 完成 / 积分复盘', COLORS.blindText],
  ['安全态', '匹配延迟 / 取消 / 偏航 / 长停 / SOS / 争议反馈', '#E59E8C'],
].forEach((item, i) => {
  svg.push(rect(1314, 852 + i * 74, 1252, 58, '#1A1A1A', 16, '#2D2D2D'));
  svg.push(text(1332, 888 + i * 74, item[0], 16, item[2], 700));
  svg.push(text(1428, 888 + i * 74, item[1], 16, '#F2E8D5', 400));
});

svg.push(sectionShell(40, 1220, 2640, 1220, '01 Foundations', '共享品牌层只保留最低限度识别。真正拉开双端差异的是信息密度、交互方式和安全语义。'));
svg.push(rect(72, 1328, 1500, 500, '#FFFDFC', 26, '#E6DBCD'));
svg.push(text(104, 1382, '色彩与角色层', 30, COLORS.ink, 800));
[
  ['Brand / Ink', COLORS.ink], ['Brand / Sand', COLORS.sand], ['Brand / Sun', COLORS.sun], ['Brand / Clay', COLORS.clay],
  ['Blind / Background', COLORS.blindBg], ['Blind / Surface', COLORS.blindSurface], ['Blind / Primary', COLORS.blindPrimary], ['Blind / Text', COLORS.blindText],
  ['Volunteer / Background', COLORS.volunteerBg], ['Volunteer / Sheet', COLORS.volunteerSheet], ['Success', COLORS.success], ['Danger', COLORS.danger],
].forEach((item, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const bx = 104 + col * 350;
  const by = 1438 + row * 126;
  svg.push(rect(bx, by, 312, 92, '#FAF7F1', 18, '#E7DED3'));
  svg.push(rect(bx + 16, by + 16, 58, 58, item[1], 14));
  svg.push(text(bx + 94, by + 42, item[0], 15, COLORS.ink, 700));
  svg.push(text(bx + 94, by + 66, item[1], 13, COLORS.muted, 400));
});
svg.push(rect(72, 1860, 1500, 520, '#121212', 26));
svg.push(text(104, 1914, '字级系统', 30, COLORS.blindText, 800));
[
  ['Display 48', '助盲跑 · 双端高保真'],
  ['Title 32', '服务完成，积分已到账'],
  ['Section 24', '正在为您匹配志愿者'],
  ['Body 18', '通过语音确认当前位置和跑步时间。'],
  ['Body 16', '地图和底部卡片共同完成接单决策。'],
  ['Meta 13', '用于状态标签和辅助说明。'],
].forEach((item, i) => {
  svg.push(text(104, 1988 + i * 64, item[0], 13, '#CDBE9E', 700));
  svg.push(text(260, 1990 + i * 64, item[1], [48, 32, 24, 18, 16, 13][i], COLORS.blindText, 800));
});
svg.push(rect(1610, 1328, 1038, 1052, '#FFFDFC', 26, '#E4D8CB'));
svg.push(text(1642, 1382, '布局与交互规则', 30, COLORS.ink, 800));
[
  ['盲人端', '黑底高对比、超大触达区、任何阶段 1 次触达进入 SOS。'],
  ['志愿者端', '地图优先、CTA 最多 3 个、关键信息 5 秒内可读。'],
  ['导航', '盲人端不使用底部 Tab；志愿者端固定 4 Tab。'],
  ['标注', '盲人端标注语音/震动/误触；志愿者端标注 CTA 顺序与地图联动。'],
  ['状态', '红色 = 风险升级，黄色 = 提醒，绿色 = 完成。'],
  ['扩展', 'AI 视觉识别与空间音频仅保留未来扩展位。'],
].forEach((item, i) => {
  const by = 1440 + i * 140;
  svg.push(rect(1642, by, 974, 102, '#FBF8F3', 18, '#E8DED4'));
  svg.push(text(1660, by + 36, item[0], 16, COLORS.ink, 800));
  svg.push(multiline(1810, by + 34, [item[1]], 14, COLORS.muted, 400, 22));
});

svg.push(sectionShell(40, 2480, 2640, 980, '02 Components', '按共享层、盲人端专属、志愿者端专属三个层次组织组件目录。'));
svg.push(rect(72, 2586, 820, 842, '#FFFDFC', 26, '#E6DBCD'));
svg.push(rect(930, 2586, 820, 842, '#121212', 26, '#2A2A2A'));
svg.push(rect(1788, 2586, 860, 842, '#FFFDFC', 26, '#E6DBCD'));
svg.push(text(104, 2640, '共享组件', 28, COLORS.ink, 800));
svg.push(text(962, 2640, '盲人端专属', 28, COLORS.blindText, 800));
svg.push(text(1820, 2640, '志愿者端专属', 28, COLORS.ink, 800));
svg.push(rect(104, 2690, 220, 54, COLORS.ink, 18));
svg.push(text(214, 2724, '主按钮 / Primary', 16, COLORS.blindText, 800, 'middle'));
svg.push(rect(104, 2780, 720, 138, '#F7F2E9', 24, '#E2D7C8'));
svg.push(rect(424, 2794, 80, 6, '#D7CCBC', 3));
svg.push(text(128, 2832, '底部弹层 / Bottom Sheet', 20, COLORS.ink, 800));
svg.push(text(128, 2866, '用于订单详情、完成反馈、兑换确认等场景。', 14, COLORS.muted, 400));
svg.push(chip(104, 2950, '状态标签 / 在线', COLORS.softSuccess, COLORS.success, 120));
svg.push(chip(242, 2950, '状态标签 / 风险', COLORS.softDanger, COLORS.danger, 130));
svg.push(rect(104, 3010, 720, 124, '#FFFDFC', 20, '#E2D7C8'));
svg.push(text(128, 3044, '确认弹窗 / Confirm Dialog', 20, COLORS.ink, 800));
svg.push(text(128, 3078, '用于取消订单、兑换确认、权限申请等高风险动作。', 14, COLORS.muted, 400));
svg.push(rect(104, 3160, 720, 82, '#121212', 18));
svg.push(text(128, 3210, 'Toast / 系统提示：定位权限已开启', 16, COLORS.blindText, 700));
svg.push(rect(962, 2690, 720, 112, COLORS.blindPrimary, 24));
svg.push(text(1322, 2756, '超大主按钮 / 一键跑步', 24, COLORS.ink, 800, 'middle'));
svg.push(rect(962, 2828, 720, 112, COLORS.danger, 24));
svg.push(text(1322, 2894, 'SOS 警报面板', 24, COLORS.blindText, 800, 'middle'));
svg.push(rect(962, 2966, 720, 100, COLORS.blindSurface, 20, '#2A2A2A'));
svg.push(text(994, 3000, '语音提示条', 18, COLORS.blindText, 800));
svg.push(text(994, 3032, '“已为您匹配到志愿者，请耐心等待。”', 14, COLORS.mutedDark, 400));
svg.push(rect(962, 3092, 720, 144, COLORS.blindSurface, 20, '#2A2A2A'));
svg.push(text(994, 3128, '全屏确认面板', 20, COLORS.blindText, 800));
svg.push(text(994, 3164, '服务已结束，是否确认完成？', 16, COLORS.mutedDark, 400));
svg.push(rect(1820, 2690, 760, 152, COLORS.ink, 24));
svg.push(text(1844, 2730, '订单卡 / 高匹配', 20, COLORS.blindText, 800));
svg.push(multiline(1844, 2766, ['人民公园东门 · 18:00-19:00', '距离 1.2 km · 慢跑 30 分钟'], 14, '#DDD2C5', 400, 22));
svg.push(rect(2404, 2792, 152, 36, COLORS.sun, 18));
svg.push(text(2480, 2816, '一键接单', 14, COLORS.ink, 800, 'middle'));
svg.push(rect(1820, 2868, 760, 164, '#FFFDFC', 24, '#E2D7C8'));
svg.push(text(1844, 2906, '服务时间线', 20, COLORS.ink, 800));
svg.push(line(1862, 2934, 1862, 2998, COLORS.ink, 6, ' stroke-linecap="round"'));
svg.push(circle(1862, 2934, 12, COLORS.ink));
svg.push(circle(1862, 2998, 12, COLORS.sun));
svg.push(text(1892, 2940, '18:03 已碰面', 16, COLORS.ink, 700));
svg.push(text(1892, 3004, '18:18 进入内圈', 16, COLORS.ink, 700));

svg.push(sectionShell(40, 3500, 2640, 4740, '10 Blind Flows', '16 个盲人端高保真流程页，每页都带语音播报、震动反馈和误触防护标注。'));
blindScreens.forEach((screen, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = 72 + col * (BOARD_W + GAP_X);
  const y = 3620 + row * (BOARD_H + GAP_Y);
  svg.push(renderBlindScreen(x, y, i, screen[0], screen[1]));
});

svg.push(sectionShell(40, 8300, 2640, 5900, '20 Volunteer Flows', '20 个志愿者端高保真流程页，参考 Uber Rider 的地图 + 底部卡片结构，但保持独立品牌气质。'));
volunteerScreens.forEach((screen, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = 72 + col * (BOARD_W + GAP_X);
  const y = 8420 + row * (BOARD_H + GAP_Y);
  svg.push(renderVolunteerScreen(x, y, i, screen[0], screen[1]));
});

svg.push(sectionShell(40, 14250, 2640, 2060, '30 Safety & Edge States', '9 个异常与安全态页面，覆盖匹配失败、取消、偏航、长停、SOS 与争议反馈。'));
safetyScreens.forEach((screen, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = 72 + col * (BOARD_W + GAP_X);
  const y = 14370 + row * (BOARD_H + GAP_Y);
  svg.push(renderSafetyScreen(x, y, i, screen[0], screen[1], screen[2]));
});

svg.push(`</svg>`);

fs.writeFileSync(OUT, svg.join('\n'));
console.log(OUT);
