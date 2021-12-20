let per_page = document.querySelector("a[data-perpage='100']")
per_page.setAttribute("data-perpage", 1451)
per_page.click()

let splitArr = (numChunk, myArr) => {
    var i,j, temporary, splittedArr = [], chunk = numChunk
    let array = myArr
    for (i = 0,j = array.length; i < j; i += chunk) {
        temporary = array.slice(i, i + chunk)
        splittedArr.push(temporary)
    }
    return splittedArr
}


setTimeout(() => {
    document.getElementById('check_all').click()
    
    let downloadChunks = async() => {
        console.log(`running ${ctr} times..`)
        // if (ctr < mynewarr.length) {
            // let dothis = await $.redirect("/Panel/CallsAjax/GetCallsArhive", { ids: JSON.stringify(mynewarr[ctr]) })
            // ctr++
        // }
    
        if (ctr < mynewarr.length) {
            $.redirect("/Panel/CallsAjax/GetCallsArhive", { ids: JSON.stringify(mynewarr[ctr]) }, "POST", "_blank")
            ctr++
            setTimeout(downloadChunks, 100000)
        } else {
            alert("Downloading complete :)")
        }
    }
    let xyz = document.querySelectorAll('input[name="download_id"][type="checkbox"]')
    let yz = Array.from(xyz)
    let z = yz.map(el => el.value)
    let mynewarr = splitArr(200, z)
    let ctr = 0
    
    downloadChunks()
}, 30000)



var textt = `Hi,

We have received the information containing for your product.

Please be informed that this is your case file number, PTS101821967169.

Currently, we are reviewing this case and will check the availability of the item that you need. 
We will get back to you as soon as possible. 

Please wait for further instructions.

Thank you.

Best regards,

Parts Department
Curtis International Ltd.`

var initialtemplate = `This is from Curtis International Parts department. DO NOT REPLY to this message to avoid delays.

To assist you with your parts concern, we need the following information to be sent to parts@curtiscs.com
Picture of Model# and serial# of the unit (found at the back of the unit) 
A clear and readable picture of the bill of sale with the store name and Address, Purchase date, Item description, Price and Total amount.`

let sendsmsss = (numbers) => {
    var text = $.trim(initialtemplate);
    // if (text.length === 0) {
    //     return false;
    // }
    $('#activity_reply_btn').attr('disabled', 'disabled');
    $('#activity_reply_btn i').show();
    $('#ActivityModal_ActivityReply').attr('readonly', 'readonly');
    analyticsGoogle.send('event', 'Activities', 'Send SMS from Activity');
    for (let number of numbers) {
        $.post('/Panel/Activities/PostSmsReply', {
            activityId: editingId,
            text: text,
            from: '+1 (800) 968-9853', // CSR
            // from: '+1 (249) 506-1366', // Tech
            to: number
        }, function(data) {
            if (data.Success === false) {
                showNotificationError(data.Title, data.Message);
            } else {
                showNotificationSuccess('Hooray!', 'Your text message has been successfully sent!');
            }
        });
    }
}

var mynumbers = ["+16138353218", "+19802366221", "+16154825570", "+14372167322", "+16154825570", "+19024004952", "+14163644999", "+19028302752", "+12267844349", "+19173243549", "+14407737061", "+18649102554", "+17405862517", "+13067160639", "+14848160179", "+18009106704", "+19802366111", "+13054124443", "+16138525112", "+17578162994", "+18133553395", "+14174617005", "+16362440896", "+12166764041", "+16138851542", "+15619330077", "+18476506444", "+17057606365", "+14022615157", "+16078575925", "+13048884683", "+16476484535", "+14048315512", "+15865734253", "+14384096480", "+12702933114", "+14436232853", "+14436232853", "+15024923455", "+15192167264", "+15024923455", "+14169854190", "+13525877469", "+17066511751", "+13019529701", "+19376573195", "+13146910762", "+12393343088", "+13479387023", "+13479387023", "+15089390213", "+14014866545", "+19025786021", "+17054446431", "+16164461161", "+17578162994", "+16577895038", "+19042547302", "+14022615157", "+15732484034", "+18103003727", "+18502063886", "+17066511751", "+16147479340", "+17578162994", "+12509142444", "+16138884652", "+16133494024", "+17066511751", "+16137353214", "+16012011637", "+16312317750"]

sendsmsss(mynumbers)

//  test numbers
var testnumbers = ["+1 (747) 204-5836", "+1 (747) 242-2118"]