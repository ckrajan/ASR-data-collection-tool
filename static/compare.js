var video_list;
var files;
var count = 0;
var vid_start_count;
var folder_selected;

const video = document.createElement('audio');
const poster1 = document.createElement('video');
// video.poster =
//   'https://pbs.twimg.com/profile_images/1076488288658120705/p5D676cI_400x400.jpg';

video.autoplay = true;
video.controls = true;
video.muted = false;
video.height = 200;
video.width = 800;
video.position = "relative";
video.style.margin = "50px 330px";
video.style.padding = "5px";

poster1.height = 500;
poster1.width = 800;
poster1.position = "relative";
poster1.style.margin = "50px 80px";
poster1.style.padding = "5px";

const box = document.getElementById('play_video');
box.appendChild(video);

function next_vid() {
    count++;
    document.getElementById("video_count").innerHTML = parseInt((count + 1) - vid_start_count) + " Out of" + " " + parseInt(video_list - vid_start_count) + " videos";

    if (count < video_list) {
        if (files[count].type != "text/csv") {

            video.src = "static/uploads/chopped_audio/" + datalist_value_selected + "/" + files[count];
            document.getElementById("transcribe_txt").innerHTML = files[count].replace('.wav', '');
            video.load();
            video.play();
        }
    }
    else {
        video.muted = true;
        video.controls = false;
        video.remove();
        box.appendChild(poster1);
        poster1.poster =
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK2-O4BKw5Kv3GTdRC90dm8uEfmr4Ky9zRaw&usqp=CAU';
        document.getElementById("transcribe_txt").style.display = "none";
        document.getElementById("yes-button").style.display = "none";
        document.getElementById("no-button").style.display = "none";
        document.getElementById("video_count").style.display = "none";
    }
}

var yes_dict = [];
var no_dict = [];
var node = document.getElementById('transcribe_txt');

function yesButton() {
    yes_dict.push({
        key: files[count],
        value: textContent = node.textContent
    });

    next_vid();
}

function noButton() {
    no_dict.push({
        key: files[count],
        value: textContent = node.textContent
    });

    next_vid();
}

async function processButton() {

    console.log("yes_dict", yes_dict);
    console.log("no_dict", no_dict);
    const { data } = await axios.post("/yes_no_files", {
        yes_dict: yes_dict,
        no_dict: no_dict,
        filename_only: datalist_value_selected,
        contentType:
            "text/json"
    });
};

const datalist = document.getElementById('videoInput');
var upload_file;

function populateList(arr) {
    arr.forEach(country => {
        var option = document.createElement("option");
        option.innerHTML = country;
        datalist.appendChild(option);
    });
}

var datalist_value = document.getElementById('videoInput');

var video_list;
var datalist_value_selected;
var t;

setTimeout(() => {
    t = JSON.parse(video_list);
    var keys = Object.keys(t);
    // console.log("keys", keys);
    // console.log("values", values);
    populateList(keys);
}, 5000);


datalist_value.addEventListener('change', function (e) {

    play_type = "select";
    datalist_value_selected = datalist_value.value;
    upload_file = "static/uploads/chopped_audio/".concat(datalist_value_selected);

    files = Object.values(t[datalist_value_selected]);;
    video_list = files.length;

    for (count = 0; count <= video_list; count++) {
        if (files[count].type != "text/csv") {
            vid_start_count = count;
            video.src = "static/uploads/chopped_audio/" + datalist_value_selected + "/" + files[count];
            document.getElementById("transcribe_txt").innerHTML = files[count].replace('.wav', '');
            break;
        }
    }
    document.getElementById("video_count").innerHTML = parseInt((count + 1) - vid_start_count) + " Out of" + " " + parseInt(video_list - vid_start_count) + " videos";
});


get_uploaded_files()
    .then(result => video_list = result.responseText)
    .catch(error => console.error('error', error));


async function get_uploaded_files() {
    const { request } = await axios.post("/uploaded_chopped_files", {
        contentType:
            "text/json"
    });
    return request
}
