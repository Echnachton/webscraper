const parser = require("./ScrapingLogic");
const fs = require("fs");
const path = require("path");

(_=>{
    process.stdout.write("Welcome to LineSweeper \n");
    const config = getConfig();
    for(let i = 0; i <= config.urlArray.length-1; i++){
        scraperCaller(config, i);
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

async function scraperCaller(config, iteration){
    const uniqueDirName = getUniqueDirName(config.dir, config.urlArray[iteration]);
    switch(config.mode){
        case 0:
            await parser.yTChannelScraper.getAllVideos(config.urlArray[iteration], config.scrollDelta, `${uniqueDirName}/videoUrls.json`);
            break;
        case 1:
            await parser.captionScraper.gotoEachVid(`${uniqueDirName}/videoUrls.json`, `${uniqueDirName}/captionUrls.json`);
            break;
        case 2:
            await parser.caption2TxtConverter.mainLoop(`${uniqueDirName}/captionUrls.json`, `${uniqueDirName}/captions.json`);
            break;
        case 3:
            await parser.yTChannelScraper.getAllVideos(config.urlArray[iteration], config.scrollDelta, `${uniqueDirName}/videoUrls.json`);
            await parser.captionScraper.gotoEachVid(`${uniqueDirName}/videoUrls.json`, `${uniqueDirName}/captionUrls.json`);
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