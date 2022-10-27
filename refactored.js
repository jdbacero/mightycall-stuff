let excelData = [
    [
        "Date",
        "Time",
        "Client Number",
        "Connected to",
        "Via",
        "Result",
        "Duration",
        "Has Recording",
        "Recording Duration",
        "Wait Time",
        "Recording Link"
    ]
]

let tblrow = Array.from(document.querySelectorAll("#table_viewpoint tbody tr")) //Gets all rows from table as array
const resultIconClasses = {
    "result-icon-incoming": "Inbound accepted call",
    "result-icon-outgoing": "Outbound connected call",
    "result-icon-missed": "Inbound missed call",
    "result-icon-canceled": "Outbound unanswered call",
    "result-icon-dropped": "Inbound dropped call (shorter than 4 sec)",
    "result-icon-voicemail": "Voicemail"
}


const getResult = row => {
    const iconClasses = row.getElementsByTagName("td")[5].getElementsByTagName("i")[0].className.split(" ")
    let iconClass = ''
    iconClasses.forEach(item => {
        let myClass = iconClasses.find(value => value == item)
        iconClass = myClass
            ? myClass
            : iconClass
    })
    console.log(iconClass)
    const result = resultIconClasses[iconClass]
    return result
}

const hasRecording = row => {
    return row.getElementsByTagName("td")[9].getElementsByTagName("button")[0].className == "btn btn-default btn-sm btn-play-disabled btn-shadow" ? false : true
}

const getRecordingURL = row => {
    return row.getElementsByTagName("td")[9].getElementsByTagName("button")[0].getAttribute("data-playurl")
}

const getMightyCallDuration = row => {
    return row.getElementsByTagName('td')[8].innerText
}

const getDate = row => {
    return row.getElementsByTagName("td")[2].innerText
}

const getTime = row => {
    return row.getElementsByTagName("td")[3].innerText
}

const getNumber = row => {
    return row.getElementsByTagName("td")[4].querySelector("div[id-test=caller-id]").innerText
}

const getConnectedTo = row => {
    return row.getElementsByTagName("td")[6].innerText
}

const getVia = row => {
    return row.getElementsByTagName("td")[7].innerText
}

let audio_elem

const getDuration = (row) => {
    return new Promise((resolve, reject) => {
        const audio_url = getRecordingURL(row)

        audio_elem = document.createElement('audio')
        audio_elem.setAttribute('src', audio_url)
        audio_elem.onloadeddata = audio => {
            console.log('Converting wait time:', audio_elem.duration)
            resolve(
                convertNumberToReadableDuration(audio_elem.duration)
            )
        }
    })
}

const getWaitTime = (mcDuration, recordingDuration) => {
    const convertedDuration = convertFormattedDurationToNumber(recordingDuration)
    console.log(mcDuration)
    const convertedMcDuration = convertFormattedDurationToNumber(mcDuration)
    const wait_time = Math.abs(convertedDuration - convertedMcDuration)
    return convertNumberToReadableDuration(wait_time)
}

const convertNumberToReadableDuration = duration => {
    if (duration == '0' || duration == undefined || duration == 0) return '00:00'
    duration = Math.floor(duration)
    const minutes = Math.floor(duration / 60)
    let seconds = Math.floor(duration - (minutes * 60))
    seconds = ("" + seconds).length != 1
        ? seconds
        : "0" + seconds
    console.log("Minutes:", minutes)
    console.log("Seconds:", seconds)

    return `${minutes}:${seconds}`
}

const convertFormattedDurationToNumber = number => {
    // if (number == 0) return 0
    const arr = number.split(':')
    const [minute, second] = arr
    console.log(arr, minute, second)
    return parseFloat(Number(minute * 60) + Number(second))
}

const exportToCsv = arr => {
    var CsvString = "";
    arr.forEach(function (RowItem, RowIndex) {
        RowItem.forEach(function (ColItem, ColIndex) {
            CsvString += ColItem + ',';
        });
        CsvString += "\r\n";
    });
    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", "somedata.csv");
    document.body.appendChild(x);
    x.click();
}

for (const [index, row] of tblrow.entries()) {
    const data = []
    const isRecorded = hasRecording(row)
    const recordingDuration = isRecorded
        ? await getDuration(row)
        : '00:00'
    data[0] = getDate(row) // DATE
    data[1] = getTime(row) // TIME
    data[2] = getNumber(row) // CLIENT NUMBER
    data[3] = getConnectedTo(row) // CONNECTED TO NUMBER/AGENT
    data[4] = getVia(row) // VIA
    data[5] = getResult(row) // CALL RESULT
    data[6] = getMightyCallDuration(row) // MIGHTYCALL DURATION
    data[7] = isRecorded    // HAS RECORDING
        ? "Has recording"
        : "No recording"
    data[8] = recordingDuration // RECORDING DURATION
    data[9] = data[8] != '00:00'
        ? getWaitTime(data[6], data[8])
        : '00:00'
    data[10] = getRecordingURL(row)

    console.log(`${index + 1} of ${tblrow.length}`, data)
    excelData.push(data)
}