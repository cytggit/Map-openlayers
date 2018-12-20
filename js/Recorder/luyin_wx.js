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
					'openLocation',//使用微信内置地图查看地理位置接口  
					'getLocation' //获取地理位置接口  
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
	//span的width随机变化
	// setInterval(function (){
		// $(".sound-recording dd span").each(function (){
			// $(this).width(48*Math.random() + 'px');
		// });
	// },200)
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
			alert("开始录音惹~");
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
			play(res.localId);
			translateVoice(res.localId);
			var timeLength = ((END-START)/1000).toFixed(1);  //时间差
			alert(timeLength);
		},
		fail: function (res) {                                                                                        
			alert(JSON.stringify(res));
		}
	});
}); 
//播放语音
function play() {
	var localId = $("#hear input").val();
	// $(".hear").addClass("cur");
	wx.playVoice({
		localId: localId
	})
	//语音播放结束的回调
	wx.onVoicePlayEnd({
		success: function (res) {
			// $(".hear").removeClass("cur");
			//var localId = res.localId; // 返回音频的本地ID
		}
	});
}
function translateVoice(localId) {
	wx.translateVoice({
		localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
		isShowProgressTips: 1, // 默认为1，显示进度提示
		success: function (res) {
			$('textarea[name=msg]').val(res.translateResult); // 语音识别的结果
		}
	});
}
function uploadVoice() {
	var serverId = '';
	var localId = $("#hear input").val();
	if (localId != '') {
		wx.uploadVoice({
			localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
			isShowProgressTips: 1, // 默认为1，显示进度提示
				success: function (res) {
				serverId = res.serverId; // 返回音频的服务器端ID
			}
		});
	}
	return serverId;
}
	