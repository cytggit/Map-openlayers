// 语音输入
var recorder;
var audio = document.querySelector('audio');
var recordingFlag = false;

function uploadAudio(url,fd) {
	$.ajax({
		type: "POST",
		url: url,
		processData: false,         // 告诉jQuery不要去处理发送的数据  
		data: fd,
		success: function(msg){
			var errno = msg.errno;
			switch (errno) {
				case 3301:// 音频质量过差
					$('#record-start-result').html('抱歉，没有听清');
					break;
				case 3304: // 用户的请求QPS超限 请降低识别api请求频率 （qps以appId计算，移动端如果共用则累计）
					$('#record-start-result').html('请求超限，请稍后再试');
					break;
				case 3305: // 用户的日pv（日请求量）超限 请“申请提高配额”，如果暂未通过，请降低日请求量
					$('#record-start-result').html('请求超限，请明天再试');
					break;
				case 3308: // 音频过长
					$('#record-start-result').html('录音过长，请重说');
					break;
				case 0:
					$('#record-start-result').html(msg.message);
					$('#work-search').val(msg.message);
					selectPoi();
					closerecorder();
					break;
			}
		}	
	});
}

function openrecorder(){
	$('.record-top').css("display","block");
	$('.voice2text').attr("onclick","closerecorder();");
	$('#search_result').empty();
	// setTimeout(startRecording,1000);
	startRecording();
	
}
function closerecorder(){
	recordingFlag = false;
	stopRecording();
	$('.record-top').css("display","none");
	$('.voice2text').attr("onclick","openrecorder();");
}

function startRecording() {
	$('#record-start').attr("onclick","stopRecording();");
	$('#record-start-result').html('请开始说话~');
	
	if(checkAPPFlag){/* PC设备录音方式：HZRecorder */
		HZRecorder.get(function (rec) {
			recorder = rec;
			recorder.start();
		});
	}else{/* APP录音方式：微信 jssdk */
		
	}
    recordingFlag = true;
}

function stopRecording() {
	$('#record-start').attr("onclick","startRecording();");
	$('#record-start-result').html('请稍等~');
	
	if(checkAPPFlag && recordingFlag){/* PC设备录音方式：HZRecorder */
		 recorder.stop();
		 //提交到服务器
		recorder.upload("https://pig.intmote.com/wpLocateServer/getVoiceText.do");
	}else{/* APP录音方式：微信 jssdk */
		// yuyin_wx.js
	}
	recordingFlag = false;
}



// 语音导航
function downloadAudio(text) {
	var audio = document.getElementById("audio");
	audio.src =  "http://tsn.baidu.com/text2audio?" + 
		'tex=' + text + '&'+
		'lan=zh&' + 
		'cuid=hfiwhfowfhnehvdsvskjfveorge&' + 
		'ctp=1&' + 
		'tok=24.6770bbd2a901425ddbfe24fbde88c9df.2592000.1547724373.282335-15080207&' + 
		't=' + new Date().getTime();
	audio.play();
}


