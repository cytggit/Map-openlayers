// common
var locate; // 中心点   定位点&返回中心点&路径规划
var deviceId; //手环id   从传入参数获取值  点位点&收藏
var userId = '1592782'; //用户ID   从传入参数获取值   收藏     
var ltype; // 定位点类型 暂未用到

var placeid = '2';
var floorid = '2';// 楼层编号    选择楼层
var LocationRequestParam; //定位param
var wfsUrl = 'http://192.168.1.126:8088/geoserver/wfs';

// 设置中心点
var center = [121.4287933,31.1664993]; 
// 设置视图
var view = new ol.View({
	center: center,
	projection: 'EPSG:4326',
	zoom: 21
});

// 室内图数据获取 	
var geojsonObject = function(viewParams,Typename){
	var geojson;
	$.ajax({
		url: 'http://192.168.1.126:8088/geoserver/wfs',
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
	if (featureiiiid == '30050100' || featureiiiid == '30050800' ){
		if (map.getView().getZoom() > 18){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-18)*0.06);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
	}
	// 返回数据的style
	return geojsonstyle[featureiiiid];
};


// 确认网址的Flag 当为true时可以定位，加载定位信息
var checkFlag = false;

// 返回中心点的Flag 当为true时有定位信息，可以返回中心点
var backcenterFlag = false;

// 显示收藏的FLAG 当为true时显示收藏图层
var collectionoff = true;

// 检索Flag 记录检索类型 
// 当和上一次检索类型不同时清除上一次结果并返回这次的poi；
// 当和上一次检索类型相同时清除上一次的结果
var selectinfo = null;
var featureid; // 记录当前的检索类型对应的数据类型   

// 热力图开关Flag
var heatmapoff = true;

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



