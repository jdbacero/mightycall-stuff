

        var getUrl = "/Panel/CallsAjax/GetCalls?pageSize=-pageSize-&pageNum=-pageNum-&isIncoming=-isIncoming-&isOutgoing=-isOutgoing-&isInternal=-isInternal-&isConnected=-isConnected-&isMissed=-isMissed-&isCanceled=-isCanceled-&isDropped=-isDropped-&isVoicemail=-isVoicemail-&lastItemDateTime=-lastItemDateTime-&startDate=-startDate-&endDate=-endDate-&filter=-filter-";
        var getCountUrl = "/Panel/CallsAjax/GetCallsCountAsync?pageSize=-pageSize-&pageNum=-pageNum-&isIncoming=-isIncoming-&isOutgoing=-isOutgoing-&isInternal=-isInternal-&isConnected=-isConnected-&isMissed=-isMissed-&isCanceled=-isCanceled-&isDropped=-isDropped-&isVoicemail=-isVoicemail-&lastItemDateTime=-lastItemDateTime-&startDate=-startDate-&endDate=-endDate-&filter=-filter-";
        var exportUrl = "/Panel/CallsAjax/Export?isIncoming=-isIncoming-&isOutgoing=-isOutgoing-&isConnected=-isConnected-&isInternal=-isInternal-&isMissed=-isMissed-&isCanceled=-isCanceled-&isDropped=-isDropped-&isVoicemail=-isVoicemail-&isCallback=False&startDate=-startDate-&endDate=-endDate-&filter=-filter-&isExcel=-isExcel-";

        var pageSize = 20;
        var lastItemDateTime = null;
        var pageNum = 0;
        var hasMorePages = true;
        var isIncoming = $("#filter_all").hasClass("tab__active") || $("#filter_incoming").hasClass("tab__active");
        var isOutgoing = $("#filter_all").hasClass("tab__active") || $("#filter_outgoing").hasClass("tab__active");

        // It's decided for outgoing calls: canceled call will be actually missed (CR-7597)
        //var isConnected = $("#filter_result_connected").is(":checked");
        //var isMissed = $("#filter_result_missed").is(":checked");
        //var isCanceled = $("#filter_result_canceled").is(":checked");
        //var isDropped = $("#filter_result_dropped").is(":checked");
        //var isVoicemail = $("#filter_result_voicemail").is(":checked");

        var isConnected = true;
        var isMissed = true;
        var isCanceled = true;
        var isDropped = false;
        var isVoicemail = true;
        var id_array = [];

        var filter = "";

        function SetSelectedMessagesCount() {
            var countOfSelectedMessages = $("#table_viewpoint tbody#calls_cont [type='checkbox']:not([disabled]):checked").length;
            //$("#count_value").text(countOfSelectedMessages);

            if (countOfSelectedMessages > 0) {

                $("#count_block").css("visibility", "visible");
                //$("#count_value").html(id_array.length);
                $("#count_value").text(countOfSelectedMessages);
                $("#download_btn").removeAttr('disabled');

                $("#download_container").show();
                $("#buy_container").hide();

                if (countOfSelectedMessages > 10) {
                    $('[data-toggle="download"]').popover().data('bs.popover').tip().addClass("popover-400px");
                } else {
                    $('[data-toggle="download"]').popover('destroy');
                }
            }
            else {
                $("#count_block").css("visibility", "hidden");
                $("#download_btn").attr('disabled', true);
                $("#download_container").hide();
                $("#buy_container").show();

                $('[data-toggle="download"]').popover('destroy');
            }
        }

        $(document).on('click', '#check_all', function () {
            var isChecked = $(this).is(":checked");
            $("#calls_cont [type='checkbox']").
                prop("checked", isChecked);
            if (isChecked) {
                $("#delete_all_modal_btn").removeAttr("disabled");
            } else {
                $("#delete_all_modal_btn").attr("disabled", "disabled");
            }
            SetSelectedMessagesCount();

        });

        $(document).on("click", "#calls_cont [type='checkbox']", function () {
            var all = $("#calls_cont [type='checkbox']:not(:checked)").
                length === 0;
            var any = $("#calls_cont [type='checkbox']:checked").
                length > 0;
            $("#check_all").prop("checked", all);
            if (any) {
                $("#delete_all_modal_btn").removeAttr("disabled");
            } else {
                $("#delete_all_modal_btn").attr("disabled", "disabled");
            }
            SetSelectedMessagesCount();
        });

        $(document).on('click', "input[name=download_id]", refreshDownloadArray);

        $(document).on('click', '#download_btn', getCallsArhive);


        function refreshDownloadArray() {
            id_array = $("input[name=download_id]:not([disabled]):checked").map(
                function () { return $(this).val(); }).get();
        }

        function getCallsArhive() {
            analyticsGoogle.send('event', "Call History", 'Bulk_download');
            refreshDownloadArray();

            $.redirect("/Panel/CallsAjax/GetCallsArhive", { ids: JSON.stringify(id_array) });
        }

        function updateGrid(data) {
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


        }
        function updatePaginator(data) {

            $("#paginator").html(data);
            $("#paginator [data-toggle='popovercust']").attr("data-toggle", "").popover();


            var rootElement = angular.element(document);

            rootElement.ready(function () {
                rootElement.injector().invoke(['$compile', function ($compile) {


                    var $content = $('#paginator');
                    var scope = $content.scope();

                    $compile($content.contents())(scope);
                    scope.$digest();
                }]);
            });
            $("#paginatorSpinner").hide();
            $("#totalRows").show();
        }

        function getData() {

            console.log('getData()');

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
            $.ajax(
                {
                    type: "GET",
                    url: url,
                    success: function (data, status, response) {
                        var callListData = JSON.parse(response.getResponseHeader("X-CallListData"));
                        updateGrid(data);
                    }
                });
            $("#totalRows").hide();
            $("#paginatorSpinner").show();
            $.ajax(
                {
                    type: "GET",
                    url: countUrl,
                    success: function (data, status, response) {
                        //var callListData = JSON.parse(response.getResponseHeader("X-CallListData"));
                        updatePaginator(data);
                    }
                });
        }

        function UpdateFilterResultAll() {
            var isDroppedVisible = isIncoming;
            var isCanceledVisible = isOutgoing;
            var isAllEnabled = false;
            pageNum = 0;
            if (isDroppedVisible && isCanceledVisible) {
                if ($("#filter_result_connected").is(":checked") && $("#filter_result_missed").is(":checked") && $("#filter_result_dropped").is(":checked")
                    && $("#filter_result_voicemail").is(":checked") && $("#filter_result_canceled").is(":checked")) {
                    isAllEnabled = true;
                }
            } else if (isDroppedVisible) {
                if ($("#filter_result_connected").is(":checked") && $("#filter_result_missed").is(":checked") && $("#filter_result_dropped").is(":checked")
                    && $("#filter_result_voicemail").is(":checked")) {
                    isAllEnabled = true;
                }
            } else { // isCanceledVisible
                if ($("#filter_result_connected").is(":checked") && $("#filter_result_canceled").is(":checked")) {
                    isAllEnabled = true;
                }
            }

            $("#filter_result_all").prop("checked", isAllEnabled);
        }

        function sendFilter(filterName) {
            analyticsGoogle.send("event", "Call History", "Filter", filterName);
        }

        $(document).on("click", "[data-playurl]", function () {
            analyticsGoogle.send("event", "Call History", "Play");
            playerPlay($(this).data("playurl"));
        });


        $(function () {
            //$(document).on('change', "#filter_period", function () {
            //    setDateFilter();
            //    sendFilter("period_" + $("#filter_period").select2("val"));
            //});

            $("#filter_period").change(function () {
                setDateFilter();
                sendFilter("period_" + $("#filter_period").select2("val"));
            });


            $(document).on("click", "[page]", function () {
                pageNum = $(this).attr("page");

                getData();
            });

            $(document).on('click', "#filter_all", function () {
                if (!$(this).hasClass("tab__active")) {
                    lastItemDateTime = null;
                    $("#filter_direction_type .tab").removeClass("tab__active");
                    $(this).addClass("tab__active");
                    isIncoming = true;
                    isOutgoing = true;
                    $("#filter_result_missed_item").show();
                    $("#filter_result_dropped_item").show();
                    $("#filter_result_voicemail_item").show();
                    $("#filter_result_canceled_item").show();
                    sendFilter("filter_all");
                    pageNum = 0;

                    getData();
                }
                UpdateFilterResultAll();
            });

            $(document).on('click', "#filter_incoming", function () {
                if (!$(this).hasClass("tab__active")) {
                    lastItemDateTime = null;
                    $("#filter_direction_type .tab").removeClass("tab__active");
                    $(this).addClass("tab__active");
                    isIncoming = true;
                    isOutgoing = false;
                    pageNum = 0;
                    sendFilter("filter_incoming");
                    $("#filter_result_missed_item").show();
                    $("#filter_result_dropped_item").show();
                    $("#filter_result_voicemail_item").show();
                    $("#filter_result_canceled_item").hide();
                    // Turn on typical flags if nothing is set
                    if (!$("#filter_result_connected").is(":checked") && !$("#filter_result_missed").is(":checked") && !$("#filter_result_dropped").is(":checked")
                        && !$("#filter_result_voicemail").is(":checked")) {
                        $("#filter_result_connected").prop("checked", true);
                        $("#filter_result_missed").prop("checked", true);
                        $("#filter_result_voicemail").prop("checked", true);
                    }
                    getData();
                }
                UpdateFilterResultAll();
            });
            $(document).on('click', "#filter_outgoing", function (e, data) {

                console.log("filter_outgoing", data);

                if (!$(this).hasClass("tab__active")) {
                    lastItemDateTime = null;
                    $("#filter_direction_type .tab").removeClass("tab__active");
                    $(this).addClass("tab__active");
                    isIncoming = false;
                    isOutgoing = true;
                    pageNum = 0;
                    sendFilter("filter_outgoing");
                    $("#filter_result_missed_item").hide();
                    $("#filter_result_dropped_item").hide();
                    $("#filter_result_voicemail_item").hide();
                    $("#filter_result_canceled_item").show();
                    // Turn on typical flags if nothing is set
                    if (!$("#filter_result_canceled").is(":checked") && !$("#filter_result_connected").is(":checked")) {
                        $("#filter_result_connected").prop("checked", true);
                        $("#filter_result_canceled").prop("checked", true);
                    }
                    getData();
                }
                UpdateFilterResultAll();
            });

            $(document).on('click', "[data-perpage]", function () {
                pageSize = $(this).data('perpage');
                pageNum = 0;
                analyticsGoogle.send("event", "Call History", "Change_show_per_page", pageSize);

                getData();
            });
            $(document).on('change', "#filter_result_all", function () {
                sendFilter("filter_result_all");

                var isDroppedVisible = isIncoming;
                var isCanceledVisible = isOutgoing;
                pageNum = 0;


                if ($("#filter_result_all").is(":checked")) {
                    $("#filter_result_connected").prop("checked", true);
                    $("#filter_result_voicemail").prop("checked", true);
                    if (isDroppedVisible) {
                        $("#filter_result_missed").prop("checked", true);
                        $("#filter_result_dropped").prop("checked", true);
                        $("#filter_result_voicemail").prop("checked", true);
                    }
                    if (isCanceledVisible) {
                        $("#filter_result_canceled").prop("checked", true);
                    }
                } else {
                    $("#filter_result_connected").prop("checked", false);
                    $("#filter_result_voicemail").prop("checked", false);
                    if (isDroppedVisible) {
                        $("#filter_result_missed").prop("checked", false);
                        $("#filter_result_dropped").prop("checked", false);
                        $("#filter_result_voicemail").prop("checked", false);
                    }
                    if (isCanceledVisible) {
                        $("#filter_result_canceled").prop("checked", false);
                    }
                }
            });

            $(document).on('change', "#filter_internal", function () {
                sendFilter("filter_internal");
                lastItemDateTime = null;
                pageNum = 0;
                getData();
            });

            $(document).on('change', "#filter_result_connected", function () {
                sendFilter("filter_result_connected");
                UpdateFilterResultAll();
            });
            $(document).on('change', "#filter_result_missed", function () {
                sendFilter("filter_result_missed");
                UpdateFilterResultAll();
            });
            $(document).on('change', "#filter_result_dropped", function () {
                sendFilter("filter_result_dropped");
                UpdateFilterResultAll();
            });
            $(document).on('change', "#filter_result_voicemail", function () {
                sendFilter("filter_result_voicemail");
                UpdateFilterResultAll();
            });
            $(document).on('change', "#filter_result_canceled", function () {
                sendFilter("filter_result_canceled");
                UpdateFilterResultAll();
            });

            $("#search_form").submit(function () {
                lastItemDateTime = null;
                analyticsGoogle.send("event", "Call History", "Search");
                filter = $("#search_filter").val();
                pageNum = 0;
                getData();
                return false;
            });

            $(document).on('submit', "#goto_form", function (e) {
                e.preventDefault();

                if ($(this).valid()) {
                    pageNum = parseInt($("#goto_input").val()) - 1;

                    getData();
                }

            });

            $(document).on('change', '#goto_input', function () {
                $(this).closest('form').submit();
            });

            function SetSearchResetVisibility() {
                setTimeout(function () {
                    if ($("#search_filter").val().length > 0) {
                        $("#search_form_reset").removeClass("hide");
                    }
                    else {
                        $("#search_form_reset").addClass("hide");
                    }
                }, 100);
            }

            $("#search_filter").keyup(function () {
                SetSearchResetVisibility();
            }).keypress(function () {
                SetSearchResetVisibility();
            });

            $("#search_form_reset").click(function () {
                lastItemDateTime = null;
                filter = "";
                $("#search_filter").val("");
                $(this).addClass("hide");
                getData();
            });

            $("[data-export]").click(function () {

                var isInternal = $("#filter_internal").is(":checked");

                analyticsGoogle.send("event", "Call History", "Export");
                var sizeBckp = $("#total_count").val();
                var isExcel = $(this).data('export') == 'xls';
                var url = exportUrl
                            .replace("-isIncoming-", isIncoming)
                            .replace("-isOutgoing-", isOutgoing)
                            .replace("-isInternal-", isInternal)
                            .replace("-isConnected-", isConnected)
                            .replace("-isMissed-", isMissed)
                            .replace("-isCanceled-", isCanceled)
                            .replace("-isDropped-", isDropped)
                            .replace("-isVoicemail-", isVoicemail)
                            .replace("-startDate-", startDateRequest)
                            .replace("-endDate-", endDateRequest)
                            .replace("-filter-", encodeURIComponent(filter))
                            .replace("-isExcel-", isExcel);

                $("#export_form").attr("action", url);
                $("#export_form").submit();
            });

            $(document).on("click", "#filter_result_dropdown .dropdown-menu", function (evt) {
                if (evt.target.id != "filter_result_dropdown_apply" && evt.target.id != "filter_result_dropdown_cancel")
                    $("#filter_result_dropdown").data("allow-close", false);
            });

            $(document).on("hide.bs.dropdown", "#filter_result_dropdown", function () {
                var allowClose = $("#filter_result_dropdown").data("allow-close");
                if (allowClose == undefined)
                    allowClose = true;
                $("#filter_result_dropdown").data("allow-close", true);
                if (allowClose) {
                    $("#filter_result_connected").prop("checked", isConnected);
                    $("#filter_result_missed").prop("checked", isMissed);
                    $("#filter_result_dropped").prop("checked", isDropped);
                    $("#filter_result_voicemail").prop("checked", isVoicemail);
                    $("#filter_result_canceled").prop("checked", isCanceled);
                    UpdateFilterResultAll();
                }
                return allowClose;
            });

            $(document).on("click", "#filter_result_dropdown_apply", function () {
                lastItemDateTime = null;
                isConnected = $("#filter_result_connected").is(":checked");
                isMissed = $("#filter_result_missed").is(":checked");
                isDropped = $("#filter_result_dropped").is(":checked");
                isVoicemail = $("#filter_result_voicemail").is(":checked");
                isCanceled = $("#filter_result_canceled").is(":checked");

                var isDroppedVisible = ($("#filter_result_dropped").is(":visible"));
                var isCanceledVisible = ($("#filter_result_canceled").is(":visible"));
                var isVoicemailVisible = ($("#filter_result_voicemail").is(":visible"));

                if (isDroppedVisible && isCanceledVisible) {
                    if (!isConnected && !isMissed && !isDropped && !isVoicemail && !isCanceled) {
                        isConnected = isMissed = isDropped = isVoicemail = isCanceled = true;
                    }
                } else {
                    if (isDroppedVisible) {
                        if (!isConnected && !isMissed && !isDropped && !isVoicemail) {
                            isConnected = isMissed = isDropped = isVoicemail = true;
                        }
                    } else { // isCanceledVisible
                        if (!isConnected && !isCanceled && !isVoicemail) {
                            isConnected = isCanceled = isVoicemail = true;
                        }
                    }
                }

                getData();
            });

            $("#filter_result_dropdown_cancel").click(function () {
            });


            $("#loadMoreButton").click(function () {
                getData();
            });

            isIncoming = isIncoming === "true" || isIncoming === true;
            isOutgoing = isOutgoing === "true" || isOutgoing === true;

            console.log(isIncoming);
            console.log(isOutgoing);

            switch (true) {
                case isIncoming && isOutgoing:
                    $("#filter_all").trigger('click', { refresh: false });
                    break;
                case isIncoming && !isOutgoing:
                    $("#filter_incoming").trigger('click', { refresh: false });
                    break;
                case isOutgoing:
                    $("#filter_outgoing").trigger('click', { refresh: false });
                    break;
            }

            $("#filter_period").val('FilterLast30Days').trigger('change');

            window.mixpanel && window.mixpanel.track('Page_View', { 'Screen': 'History', Tab: 'Calls' });

        });
    