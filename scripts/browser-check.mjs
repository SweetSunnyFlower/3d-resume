import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createStaticServer } from '../server.mjs';

const server = createStaticServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: process.env.SOFTWARE_WEBGL === '1' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [],
});
const report = [];
const output = new URL('../verification/', import.meta.url);
await mkdir(output, { recursive: true });
try {
  for (const device of [
    { name: 'desktop', viewport: { width: 1440, height: 960 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  ]) {
    const { name, ...deviceOptions } = device;
    const context = await browser.newContext({ ...deviceOptions, serviceWorkers: 'block' });
    const external = [], failed = [], errors = [];
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
      external.push(url.href);
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(origin);
    await page.waitForSelector('.intro__cta--in', { timeout: 45000 });
    await page.waitForFunction(() => [...document.querySelectorAll('h1 span')].every(s => s.classList.contains('in')));
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.reference').count(), 15);
    await page.screenshot({ path: new URL(`${device.name}-intro.png`, output).pathname });
    await page.locator('.intro__cta').focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('.about-btn--in');
    await page.waitForTimeout(2000);
    const initialRail = await page.locator('.vsh-scrollbar__handle-0').getAttribute('style');
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(700);
    assert.notEqual(await page.locator('.vsh-scrollbar__handle-0').getAttribute('style'), initialRail,
      'keyboard must advance the journey after activating Explore with Enter');
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 3200);
    await page.waitForTimeout(4000);
    const movedRail = await page.locator('.vsh-scrollbar__handle-0').getAttribute('style');
    assert.notEqual(movedRail, initialRail, 'wheel input must advance the virtual scroll rail');
    await page.screenshot({ path: new URL(`${device.name}-flight.png`, output).pathname });
    await page.locator('.about-btn').click();
    await page.waitForSelector('.about--in');
    await page.waitForTimeout(2200);
    assert.equal(await page.locator('.about').getAttribute('aria-hidden'), 'false');
    await page.locator('.close-btn').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'SOURCE-LINK', 'Tab stays inside About');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('close-btn')), true);
    await page.screenshot({ path: new URL(`${device.name}-about.png`, output).pathname });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.about').classList.contains('about--in'));
    await page.waitForTimeout(1200);
    await page.locator('.sound-btn').click();
    await page.waitForFunction(() => !document.querySelector('.sound-btn').classList.contains('sound-btn--on'));
    assert.equal(await page.locator('.sound-btn').getAttribute('aria-pressed'), 'false');
    await page.locator('.sound-btn').click();
    assert.equal(await page.locator('.sound-btn').getAttribute('aria-pressed'), 'true');
    if (device.name === 'desktop') {
      await page.mouse.wheel(0, 100000);
      await page.waitForSelector('.outro--in', { timeout: 45000 });
      await page.waitForTimeout(2200);
      await page.screenshot({ path: new URL('desktop-outro.png', output).pathname });
      await page.locator('.outro__cta').click();
      await page.waitForFunction(() => !document.querySelector('.intro').classList.contains('intro--out'), null, { timeout: 15000 });
      await page.waitForSelector('.intro__cta--in');
    }
    assert.deepEqual(external, [], 'no remote runtime requests');
    assert.deepEqual(failed, [], 'no missing local resources');
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    report.push({ viewport: device.name, references: 15, wheel: true, about: true,
      soundToggle: true, replay: device.name === 'desktop', externalRequests: external, failed, errors });
    console.log(`${device.name}: passed; zero external requests, missing resources, or page errors`);
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile(new URL('browser-report.json', output), JSON.stringify(report, null, 2) + '\n');
}
