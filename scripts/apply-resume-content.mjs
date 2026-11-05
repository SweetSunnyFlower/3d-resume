/**
 * Replace the ATMOS demo content with Gao Bingbing's resume content.
 * The scene and renderer stay untouched; data, fonts and text change only.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mainPath = path.join(root, 'public', 'main.js');
let js = await readFile(mainPath, 'utf8');
js = js.replaceAll('17301252017', '17301250217');
js = js.replaceAll('/fonts/noto-sans-sc.ttf', '/fonts/noto-sans-sc-subset.ttf');

const wrap20 = (text) => {
  return String(text).split('\n').map((line) => {
    const chars = [...line];
    const rows = [];
    for (let i = 0; i < chars.length; i += 20) rows.push(chars.slice(i, i + 20).join(''));
    return rows.join('\n');
  }).join('\n');
};

const facts = [
  {
    sup: '基本信息', title: '高兵兵',
    body: '高兵兵\nGo 后端开发工程师 / AI 全栈工程师\n男\n17301250217\n844540467@qq.com\n北京',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: '职业概况', title: '职业概况',
    body: '2016 年起从事软件研发，现就职于柯信信息（北京）有限公司，参与文心一言服务端研发；具备 Go 流式对话、Agent 任务化、MCP 接入与 AI 全栈实践。',
    source: 'https://www.cnblogs.com/sweetsunnyflower',
  },
  {
    sup: '前端开发', title: '前端开发',
    body: 'TypeScript、Vue2/Vue3、React、Next.js、Pinia、Vuex、Redux、Zustand、TanStack Query、Axios、Tailwind CSS、shadcn/ui、微信小程序。',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: '后端开发', title: '后端开发',
    body: 'Go（Gin、Fiber）、PHP（Laravel、ThinkPHP、Yaf、Lumen）、Node.js（Express、ElysiaJS、AdonisJS）；MySQL、Redis、Elasticsearch、Memcache。',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: 'AI 与 Agent', title: 'AI 与 Agent',
    body: 'Agent Harness、自动规划、任务状态流转、工具调用、Skills、上下文管理、沙箱执行；MCP 接入、AI SDK、SSE 流式响应。',
    source: 'https://github.com/SweetSunnyFlower/pi-agent',
  },
  {
    sup: '工作经历', title: '柯信信息（北京）',
    body: '2023.12 至今：数字人创新业务部 / 数字人FDE组负责客服 Agent；NewApp产品研发组 / 基础服务端研发组参与文心一言。',
    source: 'https://github.com/SweetSunnyFlower/pi-agent',
  },
  {
    sup: '项目', title: '客服 Agent',
    body: '多 IM 智能客服：消息归一化落库、预处理流水线（回声抑制、白名单、内部静音、@ 挂起代答）、Eino 会话 Agent、RAG 检索与工具循环。',
    source: 'https://github.com/SweetSunnyFlower/pi-agent',
  },
  {
    sup: '项目', title: '文心一言',
    body: 'C 端核心服务端：SSE 流式对话、任务化能力、旅游规划地图 MCP、竞速与熔断、跨实例恢复、热配置与灰度。',
    source: 'https://github.com/SweetSunnyFlower/pi-agent',
  },
  {
    sup: '项目', title: '百度超级链',
    body: '通用订单与支付平台，对接微信、支付宝、银联，覆盖充值、消费、退款、优惠券与财务统计。',
    source: 'https://xchain.baidu.com',
  },
  {
    sup: '项目', title: '度小满商户 App',
    body: '商户端后端迭代与重构，统一数据访问、拆分业务模块，使用 Go 重构服务端。',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: '项目', title: '联想商城小程序',
    body: '后端由 Lumen 升级至 Laravel 8.6，完成邀请有礼、风控限制、埋点与积分通知。',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: '项目', title: '配置编排中心',
    body: '私有配置可视化管理，对接交易与核心系统，接入审批流和 ERP。',
    source: 'https://github.com/sweetsunnyflower',
  },
  {
    sup: '开源项目', title: '开源项目',
    body: 'pi-agent、MovieNight、MycoStudio、email-box、pdm-reader、itv、database-dashboard 等。',
    source: 'https://github.com/SweetSunnyFlower/pi-agent',
  },
  {
    sup: 'AI 辅助开发', title: 'AI 辅助开发',
    body: '使用 Codex、Claude Code 完成 Web、移动与桌面端项目（React Native、Flutter、Wails、Tauri 2），结合测试与运行验证。',
    source: 'https://github.com/SweetSunnyFlower/MycoStudio',
  },
  {
    sup: '联系方式', title: '感谢查看',
    body: 'GitHub：github.com/sweetsunnyflower · 博客：cnblogs.com/sweetsunnyflower · 期待与您交流。',
    source: 'https://www.cnblogs.com/sweetsunnyflower',
  },
];

for (const font of ['4ee96395e07a04577aab.ttf', '86e747d8b10ce7e39527.otf']) {
  const from = `e.exports=i.p+"${font}"`;
  const to = 'e.exports="/fonts/noto-sans-sc-subset.ttf"';
  if (js.includes(from)) {
    js = js.split(from).join(to);
  } else if (!js.includes(to)) {
    throw new Error(`Could not locate font ${font}`);
  }
}

js = js.replaceAll('See the source', '查看详情');

const referenceBuild = 'const i=document.createElement("div");i.className="reference",e.appendChild(i);const n=document.createElement("div");n.className="reference__title",n.textContent=lm[t].title,i.appendChild(n);const r=document.createElement("source-link");r.setAttribute("data-href",lm[t].source),i.appendChild(r)';
const referenceBuildNew = 'const i=document.createElement("div");i.className="reference",e.appendChild(i);const n=document.createElement("div");n.className="reference__title",n.textContent=lm[t].title,i.appendChild(n);const b=document.createElement("div");b.className="reference__body",b.textContent=lm[t].body,i.appendChild(b)';
if (js.includes(referenceBuild)) {
  js = js.split(referenceBuild).join(referenceBuildNew);
} else if (!js.includes('reference__body')) {
  throw new Error('Could not locate reference build logic');
}

const shuffle = 'let e=lm.map((e=>({value:e,sort:Math.random()}))).sort(((e,t)=>e.sort-t.sort)).map((({value:e})=>e));';
if (js.includes(shuffle)) {
  js = js.split(shuffle).join('let e=lm.slice();');
} else if (!js.includes('let e=lm.slice();')) {
  throw new Error('Could not locate lm shuffle logic');
}

const wrapped = facts.map((fact) => ({ ...fact, body: wrap20(fact.body) }));
const start = js.indexOf('lm=[{');
const end = js.indexOf('}];', start) + 3;
if (start < 0 || end < 3) throw new Error('Could not locate lm data block');
js = js.slice(0, start) + 'lm=' + JSON.stringify(wrapped) + ';' + js.slice(end);

const welcome = 'Hello passengers and welcome aboard. Please sit back, relax, and enjoy the view while we tell you some of our favourite facts about the aviation world.';
const legacyWelcome = '高兵兵\nGo 后端开发工程师 / AI 全栈工程师\n男\n17301250217\n844540467@qq.com\n北京';
const resumeWelcome = legacyWelcome;
const oldWelcomePrefix = '高兵兵 · Go 后端开发工程师 / A\\nI 全栈工程师';
if (js.includes(welcome)) {
  js = js.replace(welcome, resumeWelcome.replaceAll('\n', '\\n'));
} else if (js.includes(legacyWelcome)) {
  js = js.replace(legacyWelcome, resumeWelcome.replaceAll('\n', '\\n'));
} else if (js.includes(oldWelcomePrefix)) {
  const bodyStart = js.indexOf('body:"高兵兵');
  const bodyEnd = js.indexOf('",bodyMaxWidth:4.8', bodyStart);
  if (bodyStart < 0 || bodyEnd < 0) throw new Error('Could not locate legacy welcome body');
  js = js.slice(0, bodyStart + 6) + resumeWelcome.replaceAll('\n', '\\n') + js.slice(bodyEnd);
} else if (js.includes('高兵兵\\nGo 后端开发工程师') || js.includes('高兵兵 · Go 后端开发工程师')) {
  // 已经替换为中文欢迎语，保持幂等。
} else {
  throw new Error('Could not locate welcome text');
}
js = js.replace('bodyMaxWidth:3.2,bodyFontSize:.3', 'bodyMaxWidth:4.8,bodyFontSize:.22');

await writeFile(mainPath, js);
console.log('Applied resume content and CJK font references to main.js');
