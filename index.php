<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
</head>

<body>

    <div id="someContainer"></div>
    <script>
        var userPassword = '50a44f088b90' // Jorex
        // var userPassword = 'b0b2701786ad' // Cielo
        // const data = {
        //     // username: 'example',
        //     grant_type: 'client_credentials',
        //     client_id: '4fc75ac8-83a0-47b2-8e30-4976b47daebf',
        //     client_secret: '119'
        // };
        var apiKey = "4fc75ac8-83a0-47b2-8e30-4976b47daebf"
        var myform = new URLSearchParams();
        myform.append('grant_type', 'client_credentials');
        myform.append('client_id', '4fc75ac8-83a0-47b2-8e30-4976b47daebf');
        myform.append('client_secret', '50a44f088b90'); //Jorex
        // myform.append('client_secret', userPassword); //Cielo


        var credentials
        fetch('https://api.mightycall.com/v4/auth/token', {
                method: 'POST', // or 'PUT'
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'x-www-form-urlencoded',
                },
                body: myform,
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data)
                credentials = data
            })
            .catch((error) => {
                console.error('Error:', error);
            });


        function doAPICall(
            uri,
            method,
            headers = {
                'Content-Type': 'x-www-form-urlencoded'
            },
            body
        ) {
            headers['x-api-key'] = apiKey
            headers['Authorization'] = "Bearer " + credentials.access_token
            let request = {
                method: method,
                headers: headers
            }

            if (body) {
                let params
                if (headers['Content-Type'] == "application/json") {
                    params = JSON.stringify(body)
                } else {
                    params = new URLSearchParams();
                    for (let key in body) {
                        params.append(key, body[key])
                    }
                }
                // console.log(params)
                request.body = params
            }

            fetch((uri), request)
                .then(response => response.json())
                .then(data => {

                    console.log('Success:', data)
                    return data
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        function callNumber(number) {
            doAPICall(
                "https://api.mightycall.com/v4/calls/makecall",
                "POST", {
                    'Content-Type': 'application/json',
                }, {
                    "from": "+18009689853",
                    "to": number
                })
        }

        function webSdkCallNumber(number) {
            MightyCallWebPhone.Phone.Call(number)
        }

        function afterCall(callback) {
            MightyCallWebPhone.Phone.OnCallCompleted.subscribe(() => {
                callback()
            })
        }

        function getProfile() {
            doAPICall(
                "https://api.mightycall.com/v4/profile",
                "GET", {
                    'Content-Type': 'application/json',
                })
        }

        function getStatus() {
            doAPICall(
                "https://api.mightycall.com/v4/profile/status", //URI
                "GET" //Method
            )
        }

        function getStatus2() {
            fetch('https://api.mightycall.com/v4/profile/status', {
                    method: 'GET', // or 'PUT'
                    headers: {
                        'x-api-key': '4fc75ac8-83a0-47b2-8e30-4976b47daebf',
                        'Authorization': "bearer " + credentials.access_token,
                    },
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data)
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        function updateStatus(status) {
            doAPICall(`https://api.mightycall.com/v4/profile/status/${status}`,
                'PUT', {
                    'Content-Type': 'application/json'
                }
            )
        }
    </script>
    <script src="https://api.mightycall.com/v4/sdk/mightycall.webphone.sdk.js">
    </script>
    <!-- <script src="websdk.js"></script> -->
    <script type="text/javascript">
        var mcConfig = {
            login: "4fc75ac8-83a0-47b2-8e30-4976b47daebf",
            // password: "50a44f088b90", //Jorex
            password: "50a44f088b90"
        };
        MightyCallWebPhone.ApplyConfig(mcConfig);
        MightyCallWebPhone.Phone.Init("someContainer"); //container id to insert web app

        var status = MightyCallWebPhone.Phone.Status();
        console.log(status);
    </script>
    <!-- <script type="text/javascript">
        var mcConfig = {
            login: apiKey,
            password: "50a44f088b90"
        };
        MightyCallWebPhone.ApplyConfig(mcConfig);
        MightyCallWebPhone.Phone.Init();
    </script> -->
</body>

</html>