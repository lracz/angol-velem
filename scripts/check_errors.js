import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('BROWSER PAGE ERROR:', err.toString());
    });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');

    // Wait for load
    await page.waitForTimeout(2000);

    // Try clicking login if present
    try {
        console.log('Attempting login...');
        await page.type('input[type="email"]', 'test@test.com');
        await page.type('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
    } catch (e) {
        console.log('No login form found, assuming already logged in or error.');
    }

    // Click on "Szótár" tab just in case
    try {
        const tabs = await page.$$('nav button');
        if (tabs.length > 0) {
            await tabs[0].click();
            await page.waitForTimeout(1000);
        }
    } catch (e) { }

    // Click on "Alapvető Szavak" category
    try {
        console.log('Looking for category buttons...');
        const catButtons = await page.$$('button');
        for (const btn of catButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Alapvető')) {
                console.log('Clicking "Alapvető Szavak"...');
                await btn.click();
                await page.waitForTimeout(2000);
                break;
            }
        }
    } catch (e) {
        console.log('Failed to click category:', e);
    }

    await browser.close();
    console.log('Done.');
})();
