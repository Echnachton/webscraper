const parser = require("./ScrapingLogic");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
// puppeteer.use(AdblockerPlugin());

(async _=>{
    process.stdout.write("Welcome to LineSweeper \n");
    const config = getConfig();
    const browser = await initBrowser(false);
    for(let i = 0; i <= config.urlArray.length-1; i++){
        await scraperCaller(config, i, browser);
        console.log(`${i+1}/${config.urlArray.length}`);
    }
})();

function getConfig(){
    const configFileName = "../config/gaming_config.json";
    let config = fs.readFileSync(configFileName, "utf8",(err, data)=>{
        return data;
    });
    config = JSON.parse(config);
    return config;
}

async function initBrowser(headless){
    const ext = "C:\\Users\\Ivo\\Documents\\PersonalProjects\\ytCLI\\src\\uBlock0.chromium";
    const browser = await puppeteer.launch({headless:headless, args:[
        `--disable-extensions-except=${ext}`,
        `--load-extension=${ext}`
    ]});
    return browser
}

async function scraperCaller(config, iteration, browser){
    const uniqueDirName = getUniqueDirName(config.dir, config.urlArray[iteration]);
    switch(config.mode){
        case 0:
            await parser.yTChannelScraper.getAllVideos(config.urlArray[iteration], config.scrollDelta, `${uniqueDirName}/videoUrls.json`, browser);
            break;
        case 1:
            await parser.captionScraper.gotoEachVid(`${uniqueDirName}/videoUrls.json`, `${uniqueDirName}/captionUrls.json`, browser);
            break;
        case 2:
            await parser.caption2TxtConverter.mainLoop(`${uniqueDirName}/captionUrls.json`, `${uniqueDirName}/captions.json`);
            break;
        case 3:
            await parser.yTChannelScraper.getAllVideos(config.urlArray[iteration], config.scrollDelta, `${uniqueDirName}/videoUrls.json`, browser);
            await parser.captionScraper.gotoEachVid(`${uniqueDirName}/videoUrls.json`, `${uniqueDirName}/captionUrls.json`, browser);
            await parser.caption2TxtConverter.mainLoop(`${uniqueDirName}/captionUrls.json`, `${uniqueDirName}/captions.json`);
            console.log("Done!");
            break;
    }
}

function getUniqueDirName(dir, url){
    url = url.replace("videos","");
    const base = path.basename(url);
    return `${dir}${base}`;
}