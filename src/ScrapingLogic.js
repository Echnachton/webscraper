const puppeteer = require("puppeteer-extra"),
path = require("path"),
fs = require("fs"),
axios = require("axios"),
cookie = {
    name:"CONSENT",
    value:"YES+cb.20210622-13-p0.en+FX+675",
    url:"https://www.youtube.com",
    domain:".youtube.com",
    path:"/",
    httpOnly:false,
    secure:true
},
AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin());

const browserhndlr = {
    activeBrowser: null,
    getBrowser: async function(headless) {
        let hasLaunched = false;
        if(hasLaunched == false){
            const browser = await puppeteer.launch({headless:headless});
            this.activeBrowser = browser;
            this.hasLaunched = true;
        }
        return this.activeBrowser;
    },
    instantiatePage: async function(browser) {
        const page = await browser.newPage();
        await page.setCookie(cookie);
        return page;
    }
}

const fileSystemHndlr = {
    read: dir=>{
        let data = fs.readFileSync(dir,"utf8");
        data = JSON.parse(data);
        return data;
    },
    write: (dir, fileSource, msg) =>{
        if(!fs.existsSync(path.dirname(dir))){fs.mkdirSync(path.dirname(dir))};
        fileSource = JSON.stringify(fileSource);
        fs.writeFileSync(dir, fileSource, err =>{
            if(err){throw err}
        });
        process.stdout.write(msg + "\n");
    }
}

//todo error handle by returning status codes. page.on(requestfailed, response)
const yTChannelScraper = {
    getAllVideos: async (initUrl, scrls, outDir)=>{
        const browser = await browserhndlr.getBrowser(false);
        const page = await browserhndlr.instantiatePage(browser);
        
        try{
            await page.goto(initUrl);
        }catch(err){
            console.log(err);
        }
        
        for(let i = 0; i<scrls; i++){
            await page.keyboard.down("ArrowDown");       
        }
        
        let arr = await page.$$eval("#video-title[href]", el => el.map(x=>x.href));
        arr = [...new Set(arr)];
        fileSystemHndlr.write(outDir, arr, `${arr.length} urls collected!`);
        page.close();
        return;
    }
}

const captionScraper = {
    gotoEachVid: async (inDir,outDir) => {

        const browser = await browserhndlr.getBrowser(true);
        const page = await browserhndlr.instantiatePage(browser);

        const urls = [];

        page.on("response", async res=>{
            if(res.status()>=400&&res.status()<=599){
                console.log(`StatusCode: ${res.status()}`);
                fileSystemHndlr.write(outDir, urls)
                page.close();
            }else if(res.url().startsWith("https://www.youtube.com/api/timedtext")){
                urls.push(res.url());
            }
        });

        const arr = await fileSystemHndlr.read(inDir);
        for(el of arr){
            try{
                await Promise.all([
                    page.goto(el),
                    page.waitForNavigation({
                        waitUntil:"domcontentloaded"
                    })
                ]);
            }catch{
                continue;
            }

            try{
                await page.click(".ytp-ad-skip-button-container");
            }catch{}

            try{
                if(page.$(".ytp-subtitles-button.ytp-button")!=null){
                    await page.hover("video");
                    await page.click(".ytp-subtitles-button.ytp-button");
                }else{
                    continue;
                }
            }catch(err){
                continue;
            };
        }

        fileSystemHndlr.write(outDir, urls, "Captions Url Files Written!");
        page.close();
        return;
    }
}

const caption2TxtConverter = {
    mainLoop: async (inDir, outDir)=>{
        const captionCorpus = []; //2D array [[individualWordsArray][individualWordsArray]...]
        const captionUrls = fileSystemHndlr.read(inDir);
        for(let url of captionUrls){
            const captionsJson = await caption2TxtConverter.sendRequest(url);
            const captionWordsArray = await caption2TxtConverter.parseResponse(captionsJson);
            captionCorpus.push(captionWordsArray);
        }
        fileSystemHndlr.write(outDir, captionCorpus, "Captions Written!");
    },
    sendRequest: async (url)=>{
        return await axios.get(url);
    },
    parseResponse: async (captionJson)=>{
        let captionWordsArray = [];
        for(const el of captionJson.data["events"]){
            if("segs" in el){
                for(const x of el["segs"]){
                    let v = x["utf8"].trim();
                    if(v != ''){
                        captionWordsArray.push(`${v}`);
                    }
                }
            }
        }
        return captionWordsArray;
    }
}

exports.yTChannelScraper = yTChannelScraper;
exports.captionScraper = captionScraper;
exports.caption2TxtConverter = caption2TxtConverter;