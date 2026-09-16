import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { MOBILE_ACTIONS, CHARACTER_IDS } from '../../apps/web/src/animation/core/contracts.mjs';
const boundary = JSON.parse(readFileSync(new URL('../../native/reports/browser-boundary.json', import.meta.url), 'utf8'));
test.skip(boundary.status === 'BLOCKED', 'Browser URL policy prohibits this workflow and alternate-browser/CDP workarounds.');
/** Run with a locally installed browser: NATIVE_TEST_URL=http://127.0.0.1:4175. */
test('all native WebGL timelines preserve source SVG motion',async({page})=>{
 test.setTimeout(180000);
 test.skip(boundary.status === 'BLOCKED', 'Browser URL policy blocks this workflow and alternate-browser/CDP workarounds; official DOM-free Canvas proof is separate.');
 const url=process.env.NATIVE_TEST_URL;
 test.skip(!url,'Start node scripts/native-harness-server.mjs and supply NATIVE_TEST_URL to execute this separate WebGL gate.');
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url!);
 await page.getByRole('button',{name:'Run all native checks'}).click();
 const actions=MOBILE_ACTIONS.length*CHARACTER_IDS.length;
 await expect(page.getByRole('status')).toHaveText(`PASS: ${actions}/${actions} timelines. Evidence saved.`,{timeout:150000});
 expect(errors).toEqual([]);
});
