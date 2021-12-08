const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs')

const url = "https://www.artstation.com/wlop"
const targetDir = "pics"

function saveImageToDisk(url, filename){
    fetch(url)
    .then(res => {
        const dest = fs.createWriteStream(filename);
        res.body.pipe(dest)
    })
    .catch((err) => {
        console.log(err)
    })
}

;(async () => {
const browser = await puppeteer.launch({headless: false});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1600 })
await page.goto(url);
    
const pics = await page.$$('a.project-image');

const picPaths = await Promise.all(pics.map(async (a) => {
    return await (await a.getProperty( 'href')).jsonValue()
}));

console.log(picPaths.length)

for (const path of picPaths) {
    await page.goto(path);
    const titleNode = await page.$('aside > div > h1')
    const bigPicNode = await page.$('main > project-assets > div > div > div > picture > img')
    
    if (titleNode && bigPicNode) {
        const title = await (await titleNode.getProperty( 'textContent')).jsonValue()
        const imageHref = await (await bigPicNode.getProperty( 'src')).jsonValue()
        saveImageToDisk(imageHref, `./images/${title}.jpg`)
    }

    await new Promise(r => setTimeout(r, 1000))
}

await browser.close();
})();