let per_page = document.querySelector("a[data-perpage='100']")
per_page.setAttribute("data-perpage", 20000)
per_page.click()

let splitArr = (numChunk, myArr) => {
    var i, j, temporary, splittedArr = [], chunk = numChunk
    let array = myArr
    for (i = 0, j = array.length; i < j; i += chunk) {
        temporary = array.slice(i, i + chunk)
        splittedArr.push(temporary)
    }
    return splittedArr
}

setTimeout(() => {
    document.getElementById('check_all').click()

    let downloadChunks = async () => {
        console.log(`running ${ctr} times..`)
        // if (ctr < mynewarr.length) {
        // let dothis = await $.redirect("/Panel/CallsAjax/GetCallsArhive", { ids: JSON.stringify(mynewarr[ctr]) })
        // ctr++
        // }

        if (ctr < mynewarr.length) {
            $.redirect("/Panel/CallsAjax/GetCallsArhive", { ids: JSON.stringify(mynewarr[ctr]) }, "POST", "_parent")
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
}, 2000)



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
        }, function (data) {
            if (data.Success === false) {
                showNotificationError(data.Title, data.Message);
            } else {
                showNotificationSuccess('Hooray!', 'Your text message has been successfully sent!');
            }
        });
    }
}

var mynumbers = ["+13344245545", "+17048222467", "+18122920160", "+13362858197", "+13142257781", "+15094875809", "+12564686865", "+12533075332", "+13159011687", "+19054841823", "+18563747035", "+19059780198", "+15095547838", "+17134092022", "+12046196619", "+14193402751", "+13375326766", "+14846381360", "+18023334555", "+14805772893", "+19802366286", "+18508290306", "+15192809872", "+16175994598", "+13364493014", "+16048136767", "+15198785862", "+14167062295", "+16087680088", "+16087680088", "+19183308002", "+16134470774", "+19102576527", "+13852971390", "+17068493671", "+17088608010", "+16087680088", "+12042264029", "+19188321110", "+19188321110", "+15625286868", "+19032715653", "+17322610091", "+14704302369", "+19802366479", "+19735095386", "+19023210423", "+18127881712", "+14182693033", "+14074970082", "+18023334555", "+12513778444", "+12398410394", "+12169725776", "+19145880535", "+17194703495", "+12892514446", "+18039151760", "+19365379713", "+14033597388", "+17088608010", "+16158373000", "+13069630000", "+17057461133", "+16205445270", "+14432526063", "+16142708928", "+17186752617", "+13042782060", "+12624087990", "+15415390395", "+12044709497", "+12044709497", "+12044709497", "+16472027974", "+15757401391", "+12058077087", "+19365379713", "+14802152870", "+14175296363", "+15733928010", "+14124913989", "+19252979772", "+12503811634", "+14034682082", "+18009552292", "+15182319092", "+19086121666", "+12622779113", "+19028246131", "+12816763110", "+18505565678", "+16475694525", "+16314366215", "+12014082915", "+14134789134", "+18507123976", "+15857496993", "+12093705866", "+16045311048", "+17088450155", "+16137210760", "+15304152198", "+14126057148", "+19145880535", "+14157246818", "+12562275228", "+16572225288", "+13522238490", "+17262231867", "+12262284530", "+14034682082", "+17788630060", "+13345223377", "+14194740119", "+12044709497", "+15819805375", "+19712077954", "+16134470774", "+16036300234", "+12267980613", "+15149030910", "+18455947350", "+14379714890", "+15868559513", "+15138897754", "+19177503444", "+12502159791", "+19802366479", "+14197331293", "+17818589913", "+15817489424", "+16627851765", "+16045311048", "+13303832224", "+19802366265", "+15415390395", "+16135834520", "+50688336236", "+12107059405", "+16133882914", "+13256772994", "+17404667411", "+17188430173", "+15199455558", "+19019378554", "+19052956419", "+14163474161", "+12068194261", "+12028910182", "+14696727774", "+12145588192", "+12537978592", "+17328828264", "+18504820544", "+13023353403", "+12264212372", "+13216147350", "+19802366327", "+13303252366", "+14505011004", "+15416900008", "+14845098606", "+14845098606", "+18459789188", "+14048394850", "+12016641783", "+13044837674", "+13479312678", "+19205153498", "+19567018488", "+18773452921", "+13524261892", "+14072473741", "+19054192058", "+19312648197", "+12533070831", "+18505565678", "+13252128546", "+16476571879", "+14406706764", "+14168487578", "+16132931215", "+13603255183", "+12893395457", "+17576606242", "+12893950804", "+14197046410", "+16048249929", "+16479827241", "+16479827241", "+13159227293", "+17863947670", "+15193198588", "+15615781266", "+14232780836", "+12763467773", "+15708544920", "+13653366365", "+14162407691", "+19148747050", "+13853354052", "+16048322285", "+19055186335", "+16048322285"]

sendsmsss(mynumbers)

//  test numbers
var testnumbers = ["+1 (747) 204-5836", "+1 (747) 242-2118"]