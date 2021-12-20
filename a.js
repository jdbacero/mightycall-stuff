const urls2 = arrWithRecording
    .map(url => 'https://panel.mightycall.com/' + url[10]);

getAllDurations(urls2)
    .then(console.log)
    .catch(console.error);

async function getAllDurations(urls) {
    const loader = generateMediaLoader();
    let total = 0;
    let dur;
    for (let i = 0; i < urls.length; i++) {
        dur = await loader.getDuration(urls[i]);
        total += dur
        arrWithRecording[i][8] = dur / (60 * 60 * 24)
        arrWithRecording[i][9] = dur 
        console.log(`${i} of ${urls.length}`);
        console.log(`Total duration is ${dur}. Current duration is ${dur}`);
    }
    return total;
}

// use a single MediaElement to load our media
// this is a bit verbose but can be reused for other purposes where you need a preloaded MediaElement
function generateMediaLoader() {
    const elem = new Audio();
    let active = false; // so we wait for previous requests
    return {
        getDuration,
        load
    };
    // returns the duration of the media at url or 0
    function getDuration(url) {
        return load(url)
            .then((res) => res && res.duration || 0)
            .catch((_) => 0);
    }
    // return the MediaElement when the metadata has loaded
    function load(url) {
        if (active) {
            return active.then((_) => load(url));
        }
        return (active = new Promise((res, rej) => {
            elem.onloadedmetadata = e => {
                active = false;
                res(elem);
            };
            elem.onerror = e => {
                active = false;
                rej();
            };
            elem.src = url;
        }));
    }
}