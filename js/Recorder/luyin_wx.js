var targetUrl=location.href.split("#")[0];
	
var aj=$.ajax({     
	type: "GET",     
	url: "https://map.intmote.com/WXServer/signature.action?url=" + targetUrl,
	dataType: "json",
	<!-- contentType: "application/json; charset=utf-8",  -->
	success: function (msg) {    
		//alert("appid: "+msg.appid+";  timestamp:" + msg.timestamp+" ; nonceStr:" + msg.nonceStr+";  signature:" + msg.signature); 
		if(msg){
			wx.config({
				debug:false,
				appId:msg.appid,
				timestamp:msg.timestamp,
				nonceStr:msg.nonceStr,
				signature:msg.signature,
				jsApiList: [
					'checkJsApi',
					'startRecord',
					'stopRecord',
					'onRecordEnd',
					'playVoice',
					'pauseVoice',
					'stopVoice',
					'uploadVoice',
					'downloadVoice',
					'translateVoice'
				]
			});
		}
	}
});
wx.ready(function () {}); 
var START = null;   //开始时间
var END = null; //最后时间
var timeout;    //定时器  
var state = 0;  //状态
function showRecording() {
	clearTimeout(timeout);
	state = 0;  
	timeout = setTimeout(function() {  
		state = 1;  
	}, 1000);
}
function stopRecording() {
	clearTimeout(timeout);  
	state = 0;  
}
$("#record-start-img").on("touchstart", function (event) {  
	event.preventDefault();
	START = new Date().getTime();
	wx.startRecord({
		success: function(){
			recordTimer = setTimeout(function(){
				var longTime = new Date().getTime();
				if(longTime - START > 100){
					showRecording();
				}
				wx.startRecord({
					success: function(){
						localStorage.rainAllowRecord = 'true';
					}
				});
			},300);
		},
		cancel: function () {
			stopRecording();
			alert('用户拒绝授权录音');
		}
	});
});
//取消触摸
$('#record-start-img').on('touchcancel', function(event){
	stopRecording();
	wx.stopRecord({
		success: function (res) {
			clearTimeout(recordTimer);
		},
		fail: function (res) {
		}
	});
})      
$("#record-start-img").on("touchend", function (event) { 
	stopRecording();
	event.preventDefault();
	END = new Date().getTime();
	wx.stopRecord({
		success: function (res) {
			if((END - START) < 300){
				END = 0;
				START = 0;
				//小于300ms，不录音
				clearTimeout(recordTimer);
				return;
			}
			translateVoice(res.localId);
		},
		fail: function (res) {                                                                                        
			alert(JSON.stringify(res));
		}
	});
}); 
//播放语音
// function play() {
	// var localId = $("#hear input").val();
	// // $(".hear").addClass("cur");
	// wx.playVoice({
		// localId: localId
	// })
	// //语音播放结束的回调
	// wx.onVoicePlayEnd({
		// success: function (res) {
			// // $(".hear").removeClass("cur");
			// var localId = res.localId; // 返回音频的本地ID
		// }
	// });
// }
function translateVoice(localId) {
	wx.translateVoice({
		localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
		isShowProgressTips: 1, // 默认为1，显示进度提示
		success: function (res) {
			alert(res.translateResult);
			$('#record-start-result').html(res.translateResult);
			$('#work-search').val(res.translateResult);
			selectPoi();
			closerecorder();
		}
	});
}
	