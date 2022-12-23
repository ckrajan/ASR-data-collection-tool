import os
import urllib.request
from flask import Flask, flash, request, redirect, url_for, render_template, make_response
from werkzeug.utils import secure_filename
import csv
import os
import shutil
from pydub import AudioSegment

import fnmatch
from collections import defaultdict
import json
import jsonpickle

if not os.path.exists('static/uploads'):
	os.makedirs('static/uploads/', exist_ok=True)

if not os.path.exists('static/uploads/original_audio'):
	os.makedirs('static/uploads/original_audio', exist_ok=True)

if not os.path.exists('static/uploads/chopped_audio'):
	os.makedirs('static/uploads/chopped_audio', exist_ok=True)

if not os.path.exists('static/uploads/filtered_audio'):
	os.makedirs('static/uploads/filtered_audio', exist_ok=True)

UPLOAD_FOLDER = 'static/uploads/original_audio/'

app = Flask(__name__, static_url_path='/static')
app.secret_key = "secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route("/")
def cutter():
    return render_template('cutter.html')

@app.route('/compare')
def compare_tool():
    return render_template('compare.html')


@app.route('/', methods=['POST'])
def upload_video():
	collection = request.form.get('collection')
	if 'file' not in request.files:
		flash('No file part')
		return redirect(request.url)
	file = request.files['file']
	if file.filename == '':
		flash('No image selected for uploading')
		return redirect(request.url)
	else:
		filename = secure_filename(file.filename)
		file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		flash('Audio successfully uploaded')
		return render_template('cutter.html', filename=filename, collection=collection)

@app.route('/upload_csv', methods=['POST'])
def upload():
	json_body = request.get_json()
	csv_str = json_body['csv']
	filename = json_body['filename']
	filename_only = os.path.splitext(filename)[0]

	reader = csv.reader(csv_str.splitlines(), skipinitialspace=True)
	chop_path = 'static/uploads/chopped_audio/'
	with open(chop_path + filename_only + '.csv', 'w') as out_file:
		writer = csv.writer(out_file)
		writer.writerows(reader)
		
	return chop_path

#### Split by time
@app.route('/chop_video', methods=['POST'])
def chop_video():
	json_body = request.get_json()
	rows_final = json_body['rows_final']
	filename = json_body['filename']
	filename_only = os.path.splitext(filename)[0]
	chop_path = 'static/uploads/chopped_audio/%s' % filename_only + '/'

	if not os.path.exists('static/uploads/chopped_audio/%s' % filename_only):
		os.mkdir(chop_path)

	for i in rows_final:
		song = AudioSegment.from_mp3(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		start_time = int(i[3]) * 1000
		end_time = int(i[4]) * 1000
		if(start_time != end_time):
			song_temp = song[start_time : end_time]
			song_temp.export(os.path.join(chop_path, filename_only + '_' + i[2] + ".wav"))
	
	return filename
 

@app.route('/display/<filename>')
def display_video(filename):
	return redirect(url_for('static', filename='uploads/' + filename), code=301)

@app.route('/uploaded_files', methods=['GET', 'POST'])
def uploaded_files():
	video_list = 'static/uploads/original_audio/'
	allfiles = os.listdir(video_list)
	files = [ fname for fname in allfiles ]
	return jsonpickle.encode(files)



class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


@app.route('/uploaded_chopped_files', methods=['GET', 'POST'])
def uploaded_chopped_files():
	video_list = 'static/uploads/chopped_audio/'
	allfiles = os.listdir(video_list)
	folders = [ fname for fname in allfiles if not fname.endswith(".csv")]


	d=defaultdict(set)
	for path,dirs,files in os.walk('static/uploads/chopped_audio/'):
		for f in fnmatch.filter(files,'*.wav'):
			d[os.path.basename(path)].add(f)

	data_str = json.dumps(dict(d), cls=SetEncoder)
	# print(data_str)

	return data_str


@app.route("/yes_no_files", methods=['POST'])
def yes_no_files():
	json_body = request.get_json()
	yes_dict = json_body['yes_dict']
	no_dict = json_body['no_dict']
	filename_only = json_body['filename_only']

	if not os.path.exists("static/uploads/filtered_audio/" + filename_only+'_yes_files'):
		os.makedirs("static/uploads/filtered_audio/" + filename_only+'_yes_files', exist_ok=True)
	
	if not os.path.exists("static/uploads/filtered_audio/" + filename_only+'_no_files'):
		os.makedirs("static/uploads/filtered_audio/" + filename_only+'_no_files', exist_ok=True)

	for yes in yes_dict:
		yes_key = yes['key']
		yes_value = yes['value']
		shutil.copy("static/uploads/chopped_audio/"+filename_only+"/"+yes_key, "static/uploads/filtered_audio/"+ filename_only+'_yes_files/'+yes_value+".wav")

	for no in no_dict:
		no_key = no['key']
		no_value = no['value']
		shutil.copy("static/uploads/chopped_audio/"+filename_only+"/"+no_key, "static/uploads/filtered_audio/"+ filename_only+'_no_files/'+no_value+".wav")
    
	return filename_only

if __name__ == '__main__':
    app.run(port=8081, host='0.0.0.0', debug=True)
