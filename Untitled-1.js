
        var webPhone = null;

        var getStatsUrl = '/Panel/Activities/Stats';
        var getActivitiesUrl = '/Panel/Activities/GetActivities';
        var addActionItemUrl = '/Panel/Activities/AddActionItem';
        var getActivityUrl = '/Panel/Activities/GetActivity';

        var pageSize = 10;
        var typeFilter = 'Any';
        var filter = 'All';
        var userFilter = [];
        var offset = 0;
        var page = 0;
        var orderBy = 'Created';
        var orderDesc = true;
        var newCount = 4149;
        var stopRefreshError = false;
        var orderBy = 'Created';
        var orderDesc = true;
        var editingId = null;
        var search = '';
        var isUserView = false;

        function labelText(value) {
            return value > 99 ? '99+' : value;
        }

        function pollStatsHandler(data) {
            if (newCount != data) {
                var $activityNewCounter = $('#activity_new_counter');
                $activityNewCounter.text(labelText(data));
                if (data > 0) {
                    $activityNewCounter.show();
                } else {
                    $activityNewCounter.hide();
                }
                newCount = data;
                getActivities(false,pollStats);

            } else {
                pollStats();
            }
        }

        function pollStats() {
            if (stopRefreshError) {
                return;
            }
            setTimeout(function() {
                $.post(getStatsUrl, pollStatsHandler);
            }, 5000);
        }

        function resetOrder() {
            orderBy = 'Created';
            orderDesc = true;
            $('#activity_order li.active').removeClass('active');
            var $item = $('[data-activityorder="Created"][data-activityorderdesc="true"]');
            $item.parent().addClass('active');
            $('#activity_order_text').html($item.html());
        }

        function resetTypeFilter() {
            $('#filter_type_form [type="checkbox"]').prop('checked', true).attr('data-checked', 'true');
            $('#filter_type_text').html('Filter Type: All');
            typeFilter = 'Any';
        }

        function resetUserFilter() {
            $('#filter_user_form [type="checkbox"]').prop('checked', true).attr('data-checked', 'true');
            $('#filter_user_text').html('Filter User: All');
            userFilter = [];
        }

        function resetActions() {
            $('#select_all').prop('checked', false);
            $('#activity_actions').hide();
        }

        function resetSearch() {
            $('#search').val('');
            search = '';
        }

        function getActivities(block, callback) {
            if (block) {
                blockUI();
            }

            console.log("PAGE = ",  page);

            $.post(getActivitiesUrl, $.param({
                filter: filter,
                typeFilter: typeFilter,
                offset: offset,
                page: page,
                pageSize: pageSize,
                userFilter: userFilter,
                orderBy: orderBy,
                orderDesc: orderDesc,
                search: search
            }, true), function(data) {
                $('#activities_content').empty();
                $('#activities_content').html(data);

                if(_maxPage < page)
                {
                    page = _maxPage;
                    getActivities(block, callback);
                    return;
                }

                if (!$('[data-activityid]').length) {
                    $('#select_all').attr('disabled', 'disabled');
                } else {
                    $('#select_all').removeAttr('disabled');
                }
                blockUI(false);
                offset = $('[data-activityid]').length;
                if (!!callback) {
                    callback();
                }

                initAsyncPopovers(".activity-popover")
                //$(".activity-popover").popover();
                //$(".activity-popover").on('show.bs.popover', function (e) {
                //    console.log(e);
                //});

            }).fail(function() {
                stopRefreshError = true;
            });
        }

        $(document).on('click', '[page]', function() {
            page = $(this).attr("page");

            getActivities(true);
        });

        $(document).on('click', '[data-perpage]', function() {
            pageSize = $(this).data("perpage");
            page = 0;
            analyticsGoogle.send("event", "Activities", "Change_show_per_page", pageSize);

            getActivities(true);
        });

        $(document).on('submit', "#goto_form", function(e) {
            e.preventDefault();

            if ($(this).valid()) {
                page = parseInt($("#goto_input").val()) - 1;
                getActivities(true);
            }

        });

        $(document).on('change', '#goto_input', function() {
            $(this).closest('form').submit();
        });

        $(function() {
            getActivities(true);

            $('#activities_all').click(function() {
                $('#activities_all_menu').show();
                $('#activities_my, #activities_archive, #activities_all_new').removeClass('tab__active');
                $('#activities_bulk_complete_btn').show();
                $('#activities_bulk_reopen_btn').hide();
                $('#activities_all, #activities_all_all').addClass('tab__active');
                $('#filter_user_dropdown').show();
                page = 0;
                resetTypeFilter();
                resetUserFilter();
                resetActions();
                resetOrder();
                resetSearch();
                filter = 'All';
                getActivities(true);
                return false;
            });
            $('#activities_all_all').click(function() {
                $('#activities_all_new').removeClass('tab__active');
                $(this).addClass('tab__active');
                $('#filter_user_dropdown').show();
                $('#activities_bulk_complete_btn').show();
                $('#activities_bulk_reopen_btn').hide();
                page = 0;
                resetTypeFilter();
                resetUserFilter();
                resetActions();
                resetOrder();
                resetSearch();
                filter = 'All';
                getActivities(true);
                return false;
            });
            $('#activities_all_new').click(function() {
                $('#activities_all_all').removeClass('tab__active');
                $('#filter_user_dropdown').show();
                $(this).addClass('tab__active');
                $('#activities_bulk_complete_btn').show();
                $('#activities_bulk_reopen_btn').hide();
                page = 0;
                resetTypeFilter();
                resetUserFilter();
                resetActions();
                resetOrder();
                resetSearch();
                filter = 'New';
                getActivities(true);
                return false;
            });
            $('#activities_my').click(function() {
                $('#activities_all_menu').hide();
                $(this).addClass('tab__active');
                $('#activities_all, #activities_archive').removeClass('tab__active');
                $('#activities_bulk_complete_btn').show();
                $('#activities_bulk_reopen_btn').hide();
                page = 0;
                resetTypeFilter();
                resetUserFilter();
                resetActions();
                resetOrder();
                resetSearch();
                filter = 'MyOpen';
                $('#filter_user_dropdown').hide();
                getActivities(true);
                return false;
            });

            $('#activities_archive').click(function() {
                $('#activities_all_menu').hide();
                $(this).addClass('tab__active');
                $('#activities_bulk_complete_btn').hide();
                $('#activities_bulk_reopen_btn').show();
                $('#activities_all, #activities_my').removeClass('tab__active');
                page = 0;
                resetTypeFilter();
                resetUserFilter();
                resetActions();
                resetOrder();
                resetSearch();
                filter = 'Archive';
                $('#filter_user_dropdown').show();
                getActivities(true);
                return false;
            });

            $('#filter_type_dropdown').click(function(e) {
                var $target = $(e.target);
                if ($target.is('#filter_type_apply')) {
                    typeFilter = $('#filter_type_form input').map(function() {
                        var $this = $(this);
                        var checked = $this.is(':checked');
                        $this.data('checked', checked);
                        return checked ? $this.val() : null;
                    }).get().join();
                    page = 0;
                    $('#filter_type_text').html($('#filter_type_all').is(':checked') ? 'Filter Type: All' : 'Filter Type: Filtered...');
                    resetSearch();
                    resetActions();
                    getActivities(true);
                } else if (!$target.is('#filter_type_cancel') && $target.closest('#filter_type_form').length) {
                    if ($target.is('[type="checkbox"]')) {
                        analyticsGoogle.send('event', 'Activities', 'Activity Filter Type Click', $target.val());
                    }
                    e.stopImmediatePropagation();
                }
            });
            $('#filter_type_dropdown').on('hide.bs.dropdown', function() {
                $('#filter_type_form input').each(function() {
                    var $this = $(this);
                    $this.prop('checked', $this.data('checked'));
                });
            });
            $('#filter_type_all').change(function() {
                $('#filter_type_form input[value]').prop('checked', $(this).is(':checked'));
                $('#filter_type_text').html('Filter Type: All');
            });
            $('#filter_type_form input[value]').change(function() {
                var $filterAll = $('#filter_type_all');
                var $filters = $('#filter_type_form input[value]');
                for (var i = 0; i < $filters.length; i++) {
                    if (!$($filters[i]).is(':checked')) {
                        $filterAll.prop('checked', false);
                        return;
                    }
                }
                $filterAll.prop('checked', true);
            });

            $('#filter_user_dropdown').click(function(e) {
                var $target = $(e.target);
                if ($target.is('#filter_user_apply')) {
                    if ($('#filter_user_all').is(':checked')) {
                        userFilter = [];
                        $('#filter_user_all').data('checked', true);
                        $('#filter_user_form input[value]').data('checked', true);
                    } else {
                        userFilter = $('#filter_user_form input[value]').map(function() {
                            var $this = $(this);
                            var checked = $this.is(':checked');
                            $this.data('checked', checked);
                            return checked ? $this.val() : null;
                        }).get();
                        $('#filter_user_all').data('checked', false);
                    }
                    page = 0;
                    $('#filter_user_text').html($('#filter_user_all').is(':checked') ? 'Filter User: All' : 'Filter User: Filtered...');
                    resetSearch();
                    resetActions();
                    getActivities(true);
                } else if (!$target.is('#filter_user_cancel') && $target.closest('#filter_user_form').length) {
                    e.stopImmediatePropagation();
                }
            });
            $('#filter_user_dropdown').on('hide.bs.dropdown', function() {
                $('#filter_user_form input').each(function() {
                    var $this = $(this);
                    $this.prop('checked', $this.data('checked'));
                });
            });
            $('#filter_user_all').change(function() {
                $('#filter_user_form input[value]').prop('checked', $(this).is(':checked'));
                $('#filter_user_text').html('Filter User: All');
            });
            $('#filter_user_form input[value]').change(function() {
                var $filterAll = $('#filter_user_all');
                var $filters = $('#filter_user_form input[value]');
                for (var i = 0; i < $filters.length; i++) {
                    if (!$($filters[i]).is(':checked')) {
                        $filterAll.prop('checked', false);
                        return;
                    }
                }
                $filterAll.prop('checked', true);
            });

            function isAnyLockedChecked() {
                return $('.activity-listitem[data-locked="true"] input[type="checkbox"]:checked').length > 0;
            }
            function showAssignToBtn(show) {
                var button = $('a[href="#assign_all_modal"]');
                if (show) {
                    button.show();
                }
                else {
                    button.hide();
                }
            }
            function hideAssignToForLockedActs() {
                if(isAnyLockedChecked()) {
                    showAssignToBtn(false);
                }
                else {
                    showAssignToBtn(true);
                }
            }

            $('#select_all').change(function() {
                var isChecked = $(this).is(':checked');
                $('#activities_content input[type="checkbox"]').prop('checked', isChecked);
                if (isChecked) {

                    hideAssignToForLockedActs();

                    $('#activity_actions_count').text($('#activities_content input[type="checkbox"]:checked').length);
                    $('#activity_actions').show();
                } else {
                    $('#activity_actions').hide();
                }
            });

            $(document).on('click', '.activity-listitem input[type="checkbox"]', function(e) {
                var all = $('.activity-listitem input[type="checkbox"]:not(:checked)').length === 0;
                var any = $('.activity-listitem input[type="checkbox"]:checked').filter("[data-sharingallowed='true']").length > 0;
                $('#select_all').prop('checked', all);
                if (any) {

                    hideAssignToForLockedActs();

                    $('#activity_actions_count').text($('#activities_content input[type="checkbox"]:checked').length);
                    $('#activity_actions').show();
                } else {
                    $('#activity_actions').hide();
                }
                e.stopPropagation();
            });

            $('#search_form').submit(function() {
                search = $('#search').val();
                page = 0;
                resetActions();
                $('#activity_tabs .active').removeClass('active');
                analyticsGoogle.send('event', 'Activities', 'Search');
                getActivities(true);
                return false;
            });

            $('[data-activityorder]').click(function() {
                var $this = $(this);
                orderBy = $this.data('activityorder');
                orderDesc = $this.data('activityorderdesc');
                $('#activity_order li.active').removeClass('active');
                $this.parent().addClass('active');
                $('#activity_order_text').html($this.html());
                page = 0;
                resetActions();
                getActivities(true);
            });

            pollStats();
        });


        $(document).on('click', '#activity_menu a', function() {
            switchActivityTab($(this).attr('href'));
            return false;
        });

        $(document).on('click', '[data-activityid]', function() {
            editingId = $(this).data('activityid');
            blockUI();
            showActivity();
        });
        $(document).on('click', '#ActivityModal_complete_btn', function() {
            var $this = $(this);
            $('#activity_assign_btn').attr('disabled', 'disabled');
            analyticsGoogle.send('event', 'Activities', 'Complete Activity', $this.data('completetype'));
            $.post('/Panel/Activities/Complete', {
                id: $this.data('completeid')
            }, function(data) {
                if (data === true) {
                    getActivities();
                    showNotificationSuccess('Hooray!', 'Activity was marked as completed');
                    $('#activity_modal').modal('hide');
                }
            });
        });
        $(document).on('click', '#ActivityModal_reopen_btn', function() {
            $.post('/Panel/Activities/Reopen', {
                id: editingId
            }, function(data) {
                refreshActivity();
                getActivities();
                showNotificationSuccess('Hooray!', 'Activity was marked as reopened');
            });
        });
        $(document).on('click', '[data-assignid]', function() {
            var $this = $(this);
            var localEditingId = editingId ? editingId : $this.data("activityId");

            if ($this.is('.disabled') || !localEditingId) {
                return false;
            }
            analyticsGoogle.send('event', 'Activities', 'Assign Activity', $this.data('assigntype'));
            var $assignBtn = $('#activity_assign_btn');
            if ($this.data('notoggle') == undefined) {
                $assignBtn.dropdown('toggle');
            } else {
                $this.attr('disabled', 'disabled');
            }
            $assignBtn.attr('disabled', 'disabled');
            var userName = $this.data('assignname');
            var login = $this.data('assignid');
            $.post('/Panel/Activities/Assign', {
                id: localEditingId,
                login: login
            }, function(data) {
                getActivities();
                refreshActivity();
                showNotificationSuccess('Hooray!', 'User changed to ' + userName);
            });
            return false;
        });

        function switchActivityTab(selector) {
            $('#activity_tabs').children().hide();
            var $container = $(selector);
            $container.show();
            $('#activity_menu a.active').removeClass('active');
            $('[href="' + selector + '"]').addClass('active');
            $('#activity_modal').data('bs.modal').handleUpdate();
            var $notesCont = $('.activity-scroll-container:visible');
            $notesCont.scrollTop($notesCont.height());
        }

        function showAddActivityModal(type) {
            $('#AddActionItemModal_Type').val(type);
            $('[data-addactivitymodal]').hide();
            $('[data-addactivitymodal="' + type + '"]').show();
            var callData = null;

            switch (type) {
                case 'CallMe':
                    $('#addai_modal_username, #addai_modal_phone, #addai_modal_email').show();
                    $('#AddActionItemModal_RequestName').rules('add', 'required');
                    $('#AddActionItemModal_RequestNumber').rules('add', 'required');
                    $('#AddActionItemModal_RequestNumber').val(callData);
                    $('#AddActionItemModal_RequestNumber').change();
                    $('#AddActionItemModal_RequestEmail').rules('remove', 'required');
                    $('#addai_modal_phone .fa.fa-asterisk').show();
                    $('#addai_modal_email .fa.fa-asterisk').hide();
                    break;
                case 'EmailMe':
                    $('#addai_modal_username, #addai_modal_phone, #addai_modal_email').show();
                    $('#AddActionItemModal_RequestName').rules('add', 'required');
                    $('#AddActionItemModal_RequestNumber').rules('remove', 'required');
                    $('#AddActionItemModal_RequestNumber').val(callData);
                    $('#AddActionItemModal_RequestNumber').change();
                    $('#AddActionItemModal_RequestEmail').rules('add', 'required');
                    $('#addai_modal_phone .fa.fa-asterisk').hide();
                    $('#addai_modal_email .fa.fa-asterisk').show();
                    break;
                case 'ActionItem':
                default:
                    $('#addai_modal_username, #addai_modal_phone, #addai_modal_email').hide();
                    $('#AddActionItemModal_RequestName').rules('remove', 'required');
                    $('#AddActionItemModal_RequestNumber').rules('remove', 'required');
                    $('#AddActionItemModal_RequestEmail').rules('remove', 'required');
                    break;
            }

            $('#addai_modal .has-error').removeClass('has-error');
            $('#addai_modal [data-valmsg-replace]').empty();
            $('#addai_modal').modal('show');
            analyticsGoogle.send('event', 'Activities', 'Show Add ToDo Modal');

        }

        $(function() {
            if (isInIframe()) {
                $('[data-setblank]').attr('target', '_blank');
            }

            if (window.location.hash === '#ActivityStream') {
                $('#timeline_modal').modal('show');
            }

            $('[data-addactivity]').click(function() {
                showAddActivityModal($(this).data('addactivity'));
                return false;
            });

            $('#addai_modal_form').submit(function() {
                var $this = $(this);
                if (!$this.valid()) {
                    return false;
                }
                $('#addai_modal').modal('hide');
                blockUI();
                $.post(addActionItemUrl, $this.serialize(), function(data) {
                    if (data.Success === true) {
                        $('#AddActionItemModal_RequestMessage').val('');
                        $('#AddActionItemModal_RequestName').val('');
                        $('#AddActionItemModal_RequestEmail').val('');
                        $('#AddActionItemModal_RequestNumber').val('').change();

                        $('#addai_modal_chars_left').text(0);
                        $('#AddActionItemModal_UserLogin').select2('val', '');
                        showNotificationSuccess('Hooray!', 'New action item has been created');
                        page = 0;
                        getActivities();
                    } else {
                        showNotificationError('Oooops!', 'Failed to create action item');
                    }
                });
                return false;
            });

            $('#AddActionItemModal_RequestMessage').keyup(function() {
                $('#addai_modal_chars_left').text($(this).val().length);
            });

            $('#activity_action a').click(function() {
                var href = $(this).attr('href');
                if (href.indexOf('callto:') === 0 || href.indexOf('mailto:') === 0) {
                    analyticsGoogle.send('event', 'Activities', 'Call/Reply to Activity', $('#ActivityModal_Type').val());
                }
            });

            $('#complete_all_btn').click(function() {
                var ids = $('.activity-listitem input[type="checkbox"]:checked').filter("[data-sharingallowed='true']").map(function() {
                    return $(this).val();
                }).get();
                $('#complete_all_modal').modal('hide');
                if (ids.length === 0) {
                    return;
                }
                blockUI();
                analyticsGoogle.send('event', 'Activities', 'Bulk Actions', 'Complete');
                $.ajax({
                    type: 'Post',
                    url: '/Panel/Activities/CompleteActivities',
                    dataType: 'json',
                    data: JSON.stringify({ ids: ids }),
                    contentType: 'application/json; charset=utf-8',
                }).done(function() {
                    getActivities();

                    $('#activity_actions').hide();
                    $('#select_all').attr("checked", null);

                    showNotificationSuccess('Hooray!', 'Selected activities were marked as completed.');
                });
            });

            $('#reopen_all_btn').click(function() {
                var ids = $('.activity-listitem input[type="checkbox"]:checked').map(function() {
                    return $(this).val();
                }).get();
                $('#reopen_all_modal').modal('hide');
                if (ids.length === 0) {
                    return;
                }
                blockUI();
                analyticsGoogle.send('event', 'Activities', 'Bulk Actions', 'Reopen');
                $.ajax({
                    type: 'Post',
                    url: '/Panel/Activities/ReopenActivities',
                    dataType: 'json',
                    data: JSON.stringify({ ids: ids }),
                    contentType: 'application/json; charset=utf-8',
                }).done(function() {
                    getActivities();

                    $('#activity_actions').hide();
                    $('#select_all').attr("checked", null);

                    showNotificationSuccess('Hooray!', 'Selected activities were marked as open.');
                });
            });

            $('#assign_all_btn').click(function() {
                var ids = $('.activity-listitem input[type="checkbox"]:checked').filter("[data-sharingallowed='true']").map(function() {
                    return $(this).val();
                }).get();
                $('#assign_all_modal').modal('hide');
                var login = $('#AssignAllUser').val();
                var userName = $('#AssignAllUser option:selected').text();
                if (ids.length === 0 || login.length === 0) {
                    return;
                }
                blockUI();
                analyticsGoogle.send('event', 'Activities', 'Bulk Actions', 'Assign');
                $.ajax({
                    type: 'Post',
                    url: '/Panel/Activities/AssignActivities',
                    dataType: 'json',
                    data: JSON.stringify({ ids: ids, login: login }),
                    contentType: 'application/json; charset=utf-8',
                }).done(function() {
                    getActivities();

                    $('#activity_actions').hide();
                    $('#select_all').attr("checked", null);

                    showNotificationSuccess('Hooray!', $.validator.format('Assigned user changed to {0} for selected activities', userName));
                });
            });
            $('#activity_modal').on('hidden.bs.modal', function() {
                editingId = null;
                $('#activity_modal_container').empty();
            });
        });

        window.onpopstate = function(event) {
            if (event.state === 'ActivityFilter') {
                blockUI();
                window.location = window.location;
            }
        };

        function changeHistory() {
            var url = '/Panel/Activities';
            url += url.indexOf('?') < 0 ? '?' : '&';
            url += 'pageSize=' + pageSize + '&page=' + page + '&filter=' + filter + '&orderBy=' + orderBy + '&orderDesc=' + orderDesc + '&typeFilter=' + typeFilter + '&search=' + search;
            try {
                history.pushState('ActivityFilter', null, url);
            } catch(e) {
            }
        }


        $(document).on('click', 'button[data-playurl]', function(e) {
            var url = $(this).data('playurl');
            if (url.length > 0) {
                playerPlay(url);
            }
            e.stopPropagation();
        });

        function showActivity() {
            $.post(getActivityUrl, { id: editingId }, function(data) {
                var activeTab = $('#activity_menu a.active').attr('href');
                $('#activity_modal_container').empty();
                $('#activity_modal_container').html(data);

                var $activityBtnGroup = $('#activity_action_btn_group');
                if (!!$activityBtnGroup) {
                    var $actionBtn = $('a:first', $activityBtnGroup).clone();
                    $actionBtn.removeAttr('class');
                    $actionBtn.prependTo($('li:first', $activityBtnGroup));
                }

                var twitterElement = document.getElementById('activity_tweet');
                if (twitterElement) {
                    twttr.widgets.createTweetEmbed(twitterElement.attributes['data-tweetid'].value, twitterElement, function(twData) {
                        if (!twData) {
                            $('#activity_tweet').hide();
                            $('#activity_tweet_fail').show();
                        }
                    });
                }
                if (!!activeTab) {
                    switchActivityTab(activeTab);
                }
                $('[data-cc]').click(function() {
                    window.open($(this).data('cc'), 'newwindow', 'status=no,toolbar=no,location=no,menubar=no,resizable=no,width=450,height=590');
                    return false;
                });
                $('#no_voicemail').popover();
                analyticsGoogle.send('event', 'Activities', 'View Activity', $('#ActivityModal_Type').val());
                var $smsMessage = $('#activity_sms_form #ActivityModal_ActivityReply');
                var $sendSmsBtn = $('#send_sms_show_modal');
                var $activityReplyBtn = $('#activity_reply_btn');
                var $charsUsed = $('#activity_sms_chars_used');
                var $partsUsed = $('#activity_sms_parts_used');
                var pattern = /[^a-zA-Z0-9!@$%*\(\)|:""<>?,.;'\/=\s\+\-]/;
                var timer;

                var countCharsEx = function (e)
                {
                    if (e == $smsMessage.val()) // if user dont keep typing
                    {
                        $.post("/Panel/SmsAjax/Count", { message: $smsMessage.val(), srcnumber: $("#SmsButton_FromNumber").val() }, function (data) {
                        if ($smsMessage.val() == data["Message"]) {
                            $charsUsed.text(data["Chars"]);
                            $partsUsed.text(data["Parts"]);
                        }
                    });
                }

                    var length = $smsMessage.val().length;
                    if (length > 0) {
                        $activityReplyBtn.removeAttr('disabled');
                    } else {
                        $activityReplyBtn.attr('disabled', 'disabled');
                    }
                }

                var countChars = function() {
                    var length = $smsMessage.val().length;
                    $charsUsed.text(length);
                    $partsUsed.text(!length ? 0 : (length <= 140 ? 1 : (length <= 280 ? 2 : 3)));
                    if (length > 0) {
                        $activityReplyBtn.removeAttr('disabled');
                    } else {
                        $activityReplyBtn.attr('disabled', 'disabled');
                    }
                };

                if ($smsMessage.length) {
                    if ($activityReplyBtn.is('[data-localnumber="false"]')) {
                        $activityReplyBtn.parent().popover({
                            content: 'Text messaging is available only for SMS-enabled phone numbers.',
                            placement: 'top',
                            trigger: 'hover',
                        });
                    } else if ($activityReplyBtn.is('[data-deletednumber="true"]')) {
                        $activityReplyBtn.parent().popover({
                            content: 'We cannot send text message from this phone number. This business phone number was removed from your account or text messaging is disabled. Please go to Manage Business Number section to check your settings.',
                            placement: 'top',
                            trigger: 'hover',
                        });
                        } else if ($sendSmsBtn.is('[disabled]')) {
                            var smsData = $sendSmsBtn.parent().data();
                            $activityReplyBtn.parent().popover({
                                content: smsData.content,
                                placement: 'top',
                                trigger: 'hover',
                                html: true
                            });
                        } else {

                            $smsMessage.keyup( function () {
                                clearTimeout(timer);
                                var message = $smsMessage.val();
                                timer = setTimeout(function () { countCharsEx(message); }, 300);
                            });


                            $smsMessage.bind({
                                paste:
                                    function() {
                                        timer = setTimeout(function() {
                                            $smsMessage.val($smsMessage.val().replace(/[^a-zA-Z0-9!@$%*\(\)|:""<>?,.;'\/=\s\+\-]/g, ''));
                                            countCharsEx();
                                        }, 100);
                                    }
                            });
                            $smsMessage.keypress(function(e) {
                                if (e.which !== 0 && e.which !== 8) {
                                    if (pattern.test(String.fromCharCode(e.which))) {
                                        return false;
                                    }
                                }
                                return true;
                            });
                        }
                }
                $('#activity_modal').modal('show');
                var $notesCont = $('.activity-scroll-container:visible');
                $notesCont.scrollTop($notesCont.height());
                blockUI(false);

                initAsyncPopovers("#activity_modal .activity-popover", 'bottom')
                //$("#activity_modal .activity-popover").popover({placement: 'bottom'});
            });
        }

        function refreshActivity() {
            if (!editingId) {
                return;
            }
            showActivity();
        }

        $(document).on('submit', '#activity_facebook_form', function() {
            var text = $.trim($('#ActivityModal_ActivityReply').val());
            if (text.length === 0) {
                return false;
            }
            $('#activity_reply_btn').attr('disabled', 'disabled');
            $('#activity_reply_btn i').show();
            $('#ActivityModal_ActivityReply').attr('readonly', 'readonly');
            $.post('/Panel/Activities/PostFacebookReply', {
                activityId: editingId,
                facebookPageId: $('#ActivityModal_FacebookPageId').val(),
                postId: $('#ActivityModal_ExternalMessageId').val(),
                text: $('#ActivityModal_ActivityReply').val(),
                type: $('#ActivityModal_Type').val()
            }, function(data) {
                if (data === false) {
                    showNotificationError('Oooops!', 'Your message was not delivered');
                } else {
                    refreshActivity();
                    showNotificationSuccess('Hooray!', 'Facebook comment / message was successfully added');
                }
            });
            return false;
        });
        $(document).on('submit', '#activity_sms_form', function() {
            var text = $.trim($('#ActivityModal_ActivityReply').val());
            if (text.length === 0) {
                return false;
            }
            $('#activity_reply_btn').attr('disabled', 'disabled');
            $('#activity_reply_btn i').show();
            $('#ActivityModal_ActivityReply').attr('readonly', 'readonly');
            analyticsGoogle.send('event', 'Activities', 'Send SMS from Activity');
            $.post('/Panel/Activities/PostSmsReply', {
                    activityId: editingId,
                    text: $('#ActivityModal_ActivityReply').val(),
                    from: $('#ActivityModal_BusinessNumber').val(),
                    to: $('#ActivityModal_RequestNumber').val()
                }, function(data) {
                    if (data.Success === false) {
                        showNotificationError(data.Title, data.Message);
                    } else {
                        refreshActivity();
                        showNotificationSuccess('Hooray!', 'Your text message has been successfully sent!');
                }
            });
                return false;
            });

        $(document).on('submit', '#activity_modal_form', function() {
            if ($(this).valid()) {
                var text = $.trim($('#ActivityModal_Note').val());
                if (text.length === 0) {
                    return false;
                }
                $('#ActivityModal_Note').attr('readonly', 'readonly');
                $('#activity_modal_form button').attr('disabled', 'disabled');
                analyticsGoogle.send('event', 'Activities', 'Comment to Activity', $(this).data('assigntype'));
                $.post('/Panel/Activities/AddActivityNote', {
                    id: editingId,
                    text: text
                }, function(data) {
                    refreshActivity();
                    showNotificationSuccess('Hooray!', 'Your comment was successfully added');
                    getActivities();
                });
            }
            return false;
        });

        function activitiesAnalyticsEvent(eventName, reachLimitsTag, screen, activityType) {
            window.mixpanel && window.mixpanel.track(eventName, { Screen: screen, Reach_Limit: reachLimitsTag, ActivityType: activityType })
        }
        function initAsyncPopovers(selector, placement) {
            $(selector).each(function () {
                var el = $(this);
                var elementData = el.data();
                el.popover(placement ? { placement: placement } : null);

                if (elementData['class']) {
                    obj = el.data('bs.popover');
                    obj.tip().addClass(elementData['class']);
                }

                if (elementData['eventName']) {
                    el.on('show.bs.popover', function () {
                        try {
                            window.mixpanel && window.mixpanel.track(elementData['eventName'], { Screen: elementData['eventScreen'], Reach_Limit: elementData['eventReachLimit'], ActivityType: elementData['eventActivityType'] })
                        } catch (exc) {
                            console.warn(exc);
                        }
                    });
                }
            });
        }
        function enableVoiceToText(activationUrl) {
            event.stopPropagation();
            $.post(activationUrl).done(function (res) {
                if (res && res.Success) {
                    getActivities(true, function () {
                        if (editingId) {
                            showActivity();
                        }
                        showNotificationSuccess(
                            res.Alert && res.Alert.Title || LanguageDictionary.Shared.NotificationSuccessTitle,
                            res.Alert && res.Alert.Text || LanguageDictionary.Shared.NotificationSuccessText);
                    });
                } else {
                    if (res && res.Success == false && res.Alert) {
                        showNotificationError(res.Alert.Title, res.Alert.Text);
                    } else {
                        showNotificationError(LanguageDictionary.Shared.NotificationErrorTitle, LanguageDictionary.Shared.NotificationErrorText);
                    }
                }
            }).fail(function (err) {
                showNotificationError(LanguageDictionary.Shared.NotificationErrorTitle, LanguageDictionary.Shared.NotificationErrorText);
            });

            window.mixpanel && window.mixpanel.track('VTT_Activate', {
                'Screen': 'Activities', Tab: 'All_Activities/My_Activities/Archive',
                'Receiving_Time': moment(new Date()).format()
            });
        }
    