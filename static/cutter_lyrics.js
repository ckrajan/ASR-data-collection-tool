var collection_name;
var upload_file;

var video_scr_select = document.getElementById('video_scr_id');
var datalist_value = document.getElementById('videoInput');
var upload = document.getElementById('upload');
var video_scr = document.getElementById('video_scr_id_server');

var ls = document.getElementById("list");
var export_csv = document.getElementById("export_csv");

var time_arr = [];
var time_arr_sec = [];
var press = 0;
var counter = 0;
var split_name = 0;

var rows = [];
var rows_final = [];
var frame_final = [];
var csv;
var spliced;
var clipname;
var clipname_arr = [];
var uploaded_file_name;
var encodedUri;
var final_csv;
var play_type = "upload";

var frame_arr = [];
var frame;

var start_time_sec = 0;
var start_time = "00:00.00";
var c = 0;
var start_time_arr = [];
var st = 1;

function containsNumbers(str) {
    return /\d/.test(str);
}

start_time_arr[0] = "00:00.00";

document.body.onkeyup = function (e) {
    if (e.key == "c" ||
        e.code == "KeyC" ||
        e.keyCode == 67
    ) {
        //your code

        if (play_type == "upload") {
            collection_name = collection_name_final;
            uploaded_file_name = file_name;
        }
        else {
            uploaded_file_name = upload_file.replace(/^.*[\\\/]/, '');
        }
        press++;
        export_csv.style.display = "block";

        if (video_scr.currentTime) {
            var sec_num = video_scr.currentTime;
        }
        else {
            var sec_num = video_scr_select.currentTime;
        }

        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor(sec_num / 60) % 60;
        var seconds = sec_num % 60;

        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds.toFixed(2);
        }

        if (hours == 0) {
            time_arr_sec.push(sec_num);
        } else {
            time_arr_sec.push(sec_num);
        }

        var length = seconds.toString().length - (seconds.toString().indexOf('.') + 1);

        if (hours == 0) {
            if (length > 2) {
                time_arr.push(minutes + ":" + seconds.toFixed(2));
            }
            else if (length == 1) {
                time_arr.push(minutes + ":" + seconds.toString().replace(".", ".0"));
            }
            else if (length == 0) {
                time_arr.push(minutes + ":" + seconds + ".00");
            }
            else {
                time_arr.push(minutes + ":" + seconds);
            }
        } else {
            if (length > 2) {
                time_arr.push(hours + ":" + minutes + ":" + seconds.toFixed(2));
            }
            else if (length == 1) {
                time_arr.push(hours + ":" + minutes + ":" + seconds.toString().replace(".", ".0"));
            }
            else if (length == 0) {
                time_arr.push(hours + ":" + minutes + ":" + seconds + ".00");
            }
            else {
                time_arr.push(hours + ":" + minutes + ":" + seconds);
            }
        }

        counter++;
        var end_time = time_arr[0];

        var end_time_sec = time_arr_sec[0];

        split_name++;
        ls.style.display = "block";

        // var rem_quo = csv_val_arr[c]; && containsNumbers(rem_quo) == false && rem_quo != '"'

        // else {
        //     rows[counter] = [csv_val_str_final[c].replace('"', '')];
        //     // ls.innerHTML += '<div id="box' + counter + '" style="color:rgb(31, 87, 37); font-size: 18px;"> ' + csv_val_arr[c].replace('"', '') + '</div>';
        // }

        c++;

        start_time_arr.push(end_time);

        // if (counter > 0) {
        //     rows[counter] = ["[" + start_time_arr[st] + "]" + csv_val_str_final[c].replace('"', '')];
        //     ls.innerHTML += '<div id="box' + counter + '" style="color:rgb(31, 87, 37); font-size: 18px;"> [' + start_time_arr[st] + "]" + csv_val_str_final[c].replace('"', '') + '</div>';
        //     st++;
        // }
        if (counter > 0) {
            rows[counter] = ["[" + start_time_arr[st] + "]" ];
            ls.innerHTML += '<div id="box' + counter + '" style="color:rgb(31, 87, 37); font-size: 18px;"> [' + start_time_arr[st] + "]"  + '</div>';
            st++;
        }

        start_time_sec = end_time_sec;
        start_time = end_time;


        while (time_arr_sec.length > 0) {
            time_arr_sec.pop();
        }

        while (time_arr.length > 0) {
            time_arr.pop();
        }
    }
}

function removeItem(element) {
    var parent = element.parentNode;
    var thenum = parent.id.replace(/^\D+/g, '');

    clipname = rows[thenum];
    clipname_arr.push(clipname);

    var element = document.getElementById(parent.id)
    element.parentNode.removeChild(element); // will remove the element from DOM
}

async function send_csv() {
    const { request } = await axios.post("/upload_csv_lyrics", {
        csv: final_csv,
        filename: uploaded_file_name,
        contentType:
            "text/json"
    });

    return request
}

function csv_export() {

    frame_final = rows.filter(function (val) {
        return clipname_arr.indexOf(val) == -1;
    });

    rows_final = rows.filter(function (val) {
        return clipname_arr.indexOf(val) == -1;
    });

    rows_final.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });

    final_csv = csv.replace('undefined' + rows_final[0], rows_final[0]);

    var csvContent = "data:text/csv;charset=utf-8," + final_csv + "\n";

    encodedUri = encodeURI(csvContent);

    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_collection.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "data_collection.csv".

    send_csv();

    var theRemovedElement = rows_final.shift();
}

// This is the datalist
const datalist = document.getElementById('videoInput');

function populateList(arr) {
    arr.forEach(country => {
        var option = document.createElement("option");
        option.innerHTML = country;
        datalist.appendChild(option);
    });
}

var video_list;
var datalist_value_selected;


upload.addEventListener("click", function (e) {
    document.getElementById('upload_collection').style.display = "block";
});

datalist_value.addEventListener('change', function (e) {
    play_type = "select";
    ls.style.marginTop = '-450px';
    ls.style.marginLeft = '1100px';
    ls.style.marginRight = '50px';

    datalist_value_selected = datalist_value.value;

    play_video_server.style.display = "block";

    upload_file = "static/uploads_lyrics/".concat(datalist_value_selected)

    video_scr.src = upload_file + "/" + datalist_value_selected + ".mp3";
    document.body.appendChild(video_scr);
    video_scr.style.display = "block";
    video_scr.muted = false;
    video_scr.play();
    video_scr.controls = true;

    video_scr.autoplay = false;
    video_scr.height = 100;
    video_scr.width = 800;
    video_scr.position = "relative";
    video_scr.style.padding = "5px";
});

var csv_val_arr;
var csv_val_str;
var csv_val_str_final;

// $(document).ready(function () {
//     $("#notification_email_id").change(function (e) {
//         var ext = $("input#notification_email_id").val().split(".").pop().toLowerCase();

//         if ($.inArray(ext, ["csv"]) == -1) {
//             alert('Please upload CSV file');
//             return false;
//         }

//         if (e.target.files != undefined) {
//             var reader = new FileReader();
//             reader.onload = function (e) {
//                 var csv_val = e.target.result.split("\r\n");

//                 csv_val_arr = e.target.result.split("\n");
//                 csv_val_str = csv_val_arr.filter(item => (item != '\"'));
//                 csv_val_str_final = csv_val_str.filter(item => (containsNumbers(item) == false));

//                 counter++;
//                 ls.innerHTML += '<div id="box' + counter + '" style="color:rgb(31, 87, 37); font-size: 18px;"> [00:00.00]' + csv_val_str_final[0].replace('"', '') + '</div>';
//                 rows[counter] = ["[00:00.00]" + csv_val_str_final[0].replace('"', '')];

//                 var csv_value = "" + csv_val + "".split(",");
//                 var input_data = "";
//                 for (var i = 0; i < csv_value.length; i++) {
//                     var temp = csv_value[i];
//                     var input_data = input_data + "" + temp;
//                 }
//                 final_input_data = input_data.slice(0, -1);
//                 $("#notification_email").val(final_input_data);
//             };
//             reader.readAsText(e.target.files.item(0));
//         }
//         return false;
//     });
// });

$(document).ready(function () {
    $("#notification_email_id").change(function (e) {
        var ext = $("input#notification_email_id").val().split(".").pop().toLowerCase();

        if ($.inArray(ext, ["csv"]) == -1) {
            alert('Please upload CSV file');
            return false;
        }

        if (e.target.files != undefined) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var csv_val = e.target.result.split("\r\n");

                csv_val_arr = e.target.result.split("\n");
                csv_val_str = csv_val_arr.filter(item => (item != '\"'));
                csv_val_str_final = csv_val_str.filter(item => (containsNumbers(item) == false));

                counter++;
                ls.innerHTML += '<div id="box' + counter + '" style="color:rgb(31, 87, 37); font-size: 18px;"> [00:00.00]'  + '</div>';
                rows[counter] = ["[00:00.00]" ];

                var csv_value = "" + csv_val + "".split(",");
                var input_data = "";
                for (var i = 0; i < csv_value.length; i++) {
                    var temp = csv_value[i];
                    var input_data = input_data + "" + temp;
                }
                final_input_data = input_data.slice(0, -1);
                $("#notification_email").val(final_input_data);
            };
            reader.readAsText(e.target.files.item(0));
        }
        return false;
    });
});


get_uploaded_files()
    .then(console.log("video_list>>>", video_list))
    .catch(error => console.error('error', error));


async function get_uploaded_files() {
    const { request } = await axios.post("/uploaded_files_lyrics", {
        contentType:
            "text/json"
    });
    video_list = request.responseText;

    populateList(get_populated_list());

    return request
}

function get_populated_list() {
    var t = JSON.parse(video_list);
    return t
}
