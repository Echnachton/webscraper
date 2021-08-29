This file contains an example of how to write a config file.

{
    "mode": Number,
    "urlArray":[
        "https://www.youtube.com/[Channel_Name]/videos",
        "https://www.youtube.com/user/[Channel_Name]/videos",
        "https://www.youtube.com/channel/[Channel_Name]/videos",
        "https://www.youtube.com/c/[Channel_Name]/videos",
    ],
    "dir": "Relative Directory",
    "scrollDelta": Number,
    "headless": Bool
}

I. Set mode to a number between 0-3. Depending on the number the CLI will execute different functions.
____________________________________________________________________________________________________________________________________________
0 | Goes to each channel specified in "urlArray" and scrapes individual video urls.
1 | Goes to each video url collected with mode 0 and gets the url for captions. //WARNING: caption urls have a lifespan of less than a day!!
2 | Goes to each caption url and writes captions to a file in the directory specified in "dir".
3 | Runs 0-2 automatically. //WARNING: May throw errors due to concurrency issues.
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
II. Set the channel urls. Make sure they end with "/videos".

III. Set the i/o directory in "dir".

IV. Set the number of scrolls the program will do for mode 0. Increasing the number generally results in more video urls. When in doubt try 500.

V. Set the mode of chromium in "headless". Setting it to true will run it in headless mode.