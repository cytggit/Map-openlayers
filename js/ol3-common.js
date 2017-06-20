// common
var locate; // 中心点   定位点&返回中心点&路径规划
var deviceId; //手环id   从传入参数获取值  点位点&收藏
var userId = '1592782'; //用户ID   从传入参数获取值   收藏     
var ltype; // 定位点类型 暂未用到

var placeid = '2';
var floorid = '01';// 楼层编号    选择楼层
var locateFloor;
var LocationRequestParam; //定位param
var DBs = 'mote'; //数据源
// var DBs = 'wanhuayuan'; //数据源
var comIp = 'http://114.215.83.3:8080';
// var comIp = 'http://192.168.1.126:8088';
var wfsUrl = comIp + '/geoserver/wfs';
var wmsUrl = comIp + '/geoserver/' + DBs + '/wms';
var locateUrl = comIp + '/LocateServer/getLocation.action';
var locateCertainUrl = comIp + '/LocateServer/getCertainLocation.action';
var locateAllUrl = comIp + '/LocateServer/getAllLocation.action';

// 设置中心点
var center = [121.4287933,31.1664993]; 
// 设置视图
var view = new ol.View({
	center: center,
	projection: 'EPSG:4326',
	zoom: 19
});

// 室内图数据获取 	
var geojsonObject = function(viewParams,Typename){
	var geojson;
	$.ajax({
		url: wfsUrl,
		data: {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typename: Typename,
			outputFormat: 'application/json',
			viewparams: viewParams
		},
		type: 'GET',
		dataType: 'json',	
		async: false,
		success: function(response){
			geojson = response;
		}
	});
	// 返回经过条件筛选后的数据
	return geojson; 
};
// 室内图样式设置
var geojsonstylefunction = function(feature){
	// console.log(feature);
	// var featureiiiid = feature.I.feature_id;
	var featureiiiid = feature.values_.feature_id;
	if (feature.getGeometry().getType() == 'Point'  && (featureiiiid == '30060300' || featureiiiid == '30060000')){
		// geojsonstyle[featureiiiid].getText().setText(feature.I.name);
		geojsonstyle[featureiiiid].getText().setText(feature.values_.name);
	}
	if (featureiiiid == '30060100' || featureiiiid == '30060200' ){
		if (map.getView().getZoom() > 19){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-19)*0.1);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
	}
	if (featureiiiid == '30050100' || featureiiiid == '30050800' || featureiiiid == '30050200' || featureiiiid == '30050300' ){
		if (map.getView().getZoom() > 18){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-18)*0.06);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
	}
	// 返回数据的style
	return geojsonstyle[featureiiiid];
};

// 电子围栏样式设置
var electronicFenceStyleFun = function(feature){
	// var featureiiiid = feature.values_.type_id;
	var featureiiiid = '1';
	// 返回数据的style
	return electronicFenceStyle[featureiiiid];
};


// 确认网址的Flag 当为true时可以定位，加载定位信息
var checkFlag = false;

// 当为TRUE时 定位点在电子围栏内，定位点的style为特殊式样
var locateStyleWarn = false;

// 返回中心点的Flag 当为true时有定位信息，可以返回中心点
var backcenterFlag = false;

// 电子围栏
var electronicLayerOff = true; // 显示电子围栏的FLAG 当为true时显示电子围栏图层
var drawElectronicFlag = false;
var addElectronicFlag = false; // 第一次add后，设为true 
var updateElectronicFlag = false; // 第一次upd后，设为true 
var rmElectronicFlag = false; // 第一次rm后，设为true 
var drawtype = null;   // add or upd or rm
var DrawElectronicFence; // 绘制的interaction  draw
var ModifyElectronicFence; // 修改的interaction  select and modify
var DeleteElectronicFence; // 删除的interaction  select
// var electronicFeatureDummy = new ol.source.Vector(); // 电子围栏的feature 临时存储
var electronicFeatureDummy =[]; // 电子围栏的feature 临时存储
var OldWarnType = null; // 电子围栏预警的flag 对比前一次的变化去预警

// 显示收藏的FLAG 当为true时显示收藏图层
var collectionoff = true;

// 检索Flag 记录检索类型 
// 当和上一次检索类型不同时清除上一次结果并返回这次的poi；
// 当和上一次检索类型相同时清除上一次的结果
var selectinfo = null;
var featureid; // 记录当前的检索类型对应的数据类型   

// 热力图开关Flag
var heatmapoff = true;
var guideHeatmapTimeoutId;

// 测距
var lengthoff = true; // 当为FALSE时不执行加载测距图层  防止测距图层多次被加入图层组
var lengthstop = true; // 当为FALSE时不执行测距功能  防止重复开启测距功能
var formatLength; // 计算线的长度
var wgs84Sphere = new ol.Sphere(6378137); // 计算线的长度所用常量
var sketch; // 绘制的形状
var drawend = true; // 绘制结束flag 判断执行停止或者清除时绘制的状态
var helpTooltipElement; //  帮助信息
var helpTooltip;  // 帮助的overlay
var measureTooltipElement; // 显示长度
var measureTooltips = [];//显示长度的overlay 
var measureNum=0; // 长度的overlay 计数
var drawlinestring,drawpoint; // 绘制的interaction

// 路径规划
var pathPlanningOFF = true; // 当为FALSE时不执行路径规划任何功能  防止路径规划功能被重复打开
var myLocate,myPoint; // 选择中心点、地图选点作为起终点
var RouteStartLayer,RouteDestLayer,RouteLayer; // 分别为起点图层、终点图层、路线图层
var RouteParam,sourceLabelX,sourceLabelY,targetLabelX,targetLabelY; // 取得路线的param及param下起终点的坐标值
var LabelAction = null;  // 记录当前取点是起点或者终点
var LabelX,LabelY; // 取起点或终点时临时存储坐标值
var labelOnMap; // 点选起终点的interaction
var LabelOnMapFlag = false; // 点选起终点的Flag 当为FALSE时启动点选

// 修改记录
function updateNewFeature(features,featureType,updType){
	var WFSTSerializer = new ol.format.WFS();
    var formatGML = new ol.format.GML({  
		featureNS: 'http://www.' + DBs + '.com',
		featurePrefix: DBs,
        featureType: featureType,
        srsName: 'EPSG:4326',
    }); 	
	var featObject;
	switch (updType) {  
		case 'insert': 
			featObject = WFSTSerializer.writeTransaction(features,null,null,formatGML);
			break;
		case 'update': 
			featObject = WFSTSerializer.writeTransaction(null,features,null,formatGML);
			break;
		case 'remove': 
			featObject = WFSTSerializer.writeTransaction(null,null,features,formatGML);
			break;
	}
	var serializer = new XMLSerializer();
	var featString = serializer.serializeToString(featObject);
	featObjectSend(featString);
	console.log(featString);
}

// 发送操作数据库请求
function featObjectSend(featString){
	var request = new XMLHttpRequest();
	request.open('POST', wfsUrl + '?service=wfs');
	request.setRequestHeader('Content-Type', 'text/xml');
	request.send(featString);		
}

