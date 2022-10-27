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
let arrWithRecording = []

function getData2() {

    blockUI();

    var isInternal = $("#filter_internal").is(":checked");

    var url = getUrl.replace("-pageSize-", pageSize).replace("-isIncoming-", isIncoming)
        .replace("-isOutgoing-", isOutgoing)
        .replace("-isConnected-", isConnected).replace("-isMissed-", isMissed)
        .replace("-isCanceled-", isCanceled).replace("-isDropped-", isDropped)
        .replace("-startDate-", startDateRequest)
        .replace("-endDate-", endDateRequest)
        .replace("-filter-", encodeURIComponent(filter))
        .replace("-isVoicemail-", isVoicemail)
        .replace("-lastItemDateTime-", lastItemDateTime)
        .replace("-isInternal-", isInternal)
        .replace("-pageNum-", pageNum);

    var countUrl = getCountUrl.replace("-pageSize-", pageSize).replace("-isIncoming-", isIncoming)
        .replace("-isOutgoing-", isOutgoing)
        .replace("-isConnected-", isConnected).replace("-isMissed-", isMissed)
        .replace("-isCanceled-", isCanceled).replace("-isDropped-", isDropped)
        .replace("-startDate-", startDateRequest)
        .replace("-endDate-", endDateRequest)
        .replace("-filter-", encodeURIComponent(filter))
        .replace("-isVoicemail-", isVoicemail)
        .replace("-lastItemDateTime-", lastItemDateTime)
        .replace("-isInternal-", isInternal)
        .replace("-pageNum-", pageNum);
    $.ajax({
        type: "GET",
        url: url,
        success: function (data, status, response) {
            var callListData = JSON.parse(response.getResponseHeader("X-CallListData"));
            updateGrid2(data);
        }
    });
    $("#totalRows").hide();
    $("#paginatorSpinner").show()
}
document.getElementById("filter_result_all").checked = true

// pageSize = 20000
pageSize = 50

exportToCsv = arr => {
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

let getDataArr = () => {

    let tblrow = Array.from(document.querySelectorAll("#table_viewpoint tbody tr"))
    tblrow.forEach(function (data, index) {
        // let addData = []
        let disabled = data.getElementsByTagName("td")[9].getElementsByTagName("button")[0].className == "btn btn-default btn-sm btn-play-disabled btn-shadow" ? "No Recording" : "Has Recording"
        let audio_link = disabled == "Has Recording" ? data.getElementsByTagName("td")[9].getElementsByTagName("button")[0].getAttribute("data-playurl") : false
        // let audio_elem = audio_link != false ? document.createElement('audio') : false
        // let is_finished = false
        let addData = []

        // let audio_duration = audio_link != false ? audio_elem.duration : 0
        let audio_duration = 0
        let result
        switch (data.getElementsByTagName("td")[5].getElementsByTagName("i")[0].className) {
            case "result-icon result-icon-incoming":
                result = "Inbound accepted call"
                break
            case "result-icon result-icon-outgoing":
                result = "Outbound connected call"
                break
            case "result-icon result-icon-missed":
                result = "Inbound missed call"
                break
            case "result-icon result-icon-canceled":
                result = "Outbound unanswered call"
                break
            case "result-icon result-icon-dropped":
                result = "Inbound dropped call (shorter than 4 sec)"
                break
            case "result-icon result-icon-voicemail":
                result = "Voicemail"
                break
        }

        let mc_duration_formatted = data.getElementsByTagName("td")[8].innerText
        let mc_duration_arr = mc_duration_formatted.split(":")
        let mc_duration_sec = parseFloat(mc_duration_arr[1])
        let mc_duration_min = parseFloat(mc_duration_arr[0])
        let mc_duration_int = parseFloat((mc_duration_min * 60) + mc_duration_sec) / (60 * 60 * 24)

        if (audio_link != false) {
            let dataToBeAdded = [
                data.getElementsByTagName("td")[2].innerText, //date
                data.getElementsByTagName("td")[3].innerText, //time
                data.getElementsByTagName("td")[4].querySelector("div[id-test=caller-id]").innerText, //number
                data.getElementsByTagName("td")[6].innerText, //connected to
                data.getElementsByTagName("td")[7].innerText, //via
                result, //result
                mc_duration_formatted, //duration
                disabled, //connected to
                0, //duration
                0, //waiting time
                "https://panel.mightycall.com" + audio_link //audio link
            ]

            arrWithRecording.push(dataToBeAdded)
        } else {



            addData.push(data.getElementsByTagName("td")[2].innerText) //date
            addData.push(data.getElementsByTagName("td")[3].innerText) //time
            addData.push(data.getElementsByTagName("td")[4].querySelector("div[id-test=caller-id]").innerText) //number
            addData.push(data.getElementsByTagName("td")[6].innerText) //Connected to
            addData.push(data.getElementsByTagName("td")[7].innerText) //Via
            addData.push(result) //result
            addData.push(mc_duration_int) //duration
            addData.push(disabled) //has recording
            addData.push(audio_duration) //has recording
            addData.push(0) //has recording
            excelData.push(addData)
        }

        console.log(index)
    })
}

function updateGrid2(data) {
    if (lastItemDateTime == null) {
        $("#calls_cont_list").empty();
    }
    $("#calls_cont_list").html(data);
    $("#calls_cont_list [data-toggle='popovercust']").attr("data-toggle", "").popover();


    var rootElement = angular.element(document);

    rootElement.ready(function () {
        rootElement.injector().invoke(['$compile', function ($compile) {


            var $content = $('#calls_cont_list');
            var scope = $content.scope();

            $compile($content.contents())(scope);
            scope.$digest();
        }]);
    });

    if ($("input[name=download_id]:not([disabled])").length == 0) {
        $("#check_all").attr('disabled', true);
    }



    //if ($(".download_check").filter(":not([disabled])"))
    //$("#check_all").attr('')

    blockUI(false);

    getDataArr();
}

function withRecordingLink() {
    let audio_elem = []
    let z = 0
    for (let data of arrWithRecording) {
        let audio_link = data[10]
        audio_elem.push(document.createElement('audio'))
        audio_elem[z].setAttribute('src', audio_link)
        z++
    }

    let x = 0
    console.log("x back to " + x)
    for (let elem of audio_elem) {
        elem.onloadedmetadata = (e) => {
            let duration = elem.duration
            // let duration = elem.duration
            console.log(e)
            console.log(e.duration)
            let mc_duration_formatted = arrWithRecording[x][6]
            let mc_duration_arr = mc_duration_formatted.split(":")
            let mc_duration_sec = parseFloat(mc_duration_arr[1])
            let mc_duration_min = parseFloat(mc_duration_arr[0])
            let mc_duration_int = parseFloat((mc_duration_min * 60) + mc_duration_sec)

            let waiting_time = (mc_duration_int - duration)

            arrWithRecording[x][8] = duration //duration
            arrWithRecording[x][9] = waiting_time //waiting time

            console.log("Duration is:", elem.duration)
            console.log(`Adding recording duration...
            ${x + 1} of ${arrWithRecording.length}`)
            console.log(arrWithRecording[x])
            x++
            elem.remove()
            elem.src = null
        }

    }
}

getData2()