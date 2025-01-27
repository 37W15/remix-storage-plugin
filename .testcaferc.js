let os = require("os");

module.exports = {
    skipJsErrors: true,
    browsers: "chrome",
    screenshots: {
        "path": "/tmp/artifacts",
        "takeOnFails": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    }
/*     videoPath: "/tmp/artifacts",
    videoOptions: {  
        "singleFile": false,
        "failedOnly": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4"
    } */
}