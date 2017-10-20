// common
var locate; // 中心点   定位点&返回中心点&路径规划
var deviceId; //手环id   从传入参数获取值  点位点&收藏
var userId = '1592782'; //用户ID   从传入参数获取值   收藏     
var ltype; // 定位点类型 暂未用到

var placeid = '1';
var floorid = '1';// 楼层编号    选择楼层
var locateFloor;
var LocationRequestParam; //定位param
var DBs = 'mote'; //数据源
var locateIp = 'http://114.215.83.3:8090';
var comIp = 'http://114.215.83.3:8090';
// var comIp = 'http://116.231.55.50:9088';//备用
var wfsUrl = comIp + '/geoserver/wfs';
var wmsUrl = comIp + '/geoserver/' + DBs + '/wms';
var locateUrl = locateIp + '/LocateServer/getLocation.action';
var locateCertainUrl = locateIp + '/LocateServer/getCertainLocation.action';
var locateAllUrl = locateIp + '/LocateServer/getAllLocation.action';

// 设置中心点
var motecenter = [121.4286933,31.1664993]; 
var zhongbeicenter = [121.407241820159,31.2265797284321]; 
var minhangcenter = [121.457171250547,31.0275850273072]; 
var zhanlancenter = [121.452368605797,31.2253976215524]; 
var lunchuancenter = [121.505282235984,31.408037933827]; 
// 设置视图
var view = new ol.View({
	center: motecenter,
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
	var featureangle = feature.values_.angle = null ? 0: feature.values_.angle;
	
	if (feature.getGeometry().getType() == 'Point'  && (featureiiiid == '30060300' || featureiiiid == '30060000' || featureiiiid == '30040100')){
		// geojsonstyle[featureiiiid].getText().setText(feature.I.name);
		geojsonstyle[featureiiiid].getText().setText(feature.values_.name);
	}
	if (featureiiiid == '30060100' || featureiiiid == '30060200' ){
		if (map.getView().getZoom() > 19){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-19)*0.1);
			//console.log(0000000000000);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
		geojsonstyle[featureiiiid].getImage().setRotation(featureangle);
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


// 确认网址的Flag 当为true时可以定位，加载定位信息
var checkFlag = false;

// 当为TRUE时 定位点在电子围栏内，定位点的style为特殊式样
var locateStyleWarn = false;

// 返回中心点的Flag 当为true时有定位信息，可以返回中心点
var backcenterFlag = false;

var OldWarnType = null; // 电子围栏预警的flag 对比前一次的变化去预警




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


// 路径规划时对定位点做路网吸附
function pointToLinestring(pointFeature,lineFeature){
	// 做成point的geometry
	var point = pointFeature[0].getGeometry().getCoordinates();
	// 做成line的geometry的array
	var line = lineFeature[0].getGeometry().getCoordinates();
	
	var A,B;
	var distance = 2,newpoint;
	var newPointFeature = pointFeature;
	
	A = line[0];
	for (var num = 1; num < line.length; num++){
		B = line[num];
		if (A[0] == B[0] && A[1] == B[1] ){
			var distanceDummy = distanceFromAToB(point,A);
			if(distance > distanceDummy){
				distance = distanceDummy;
				newpoint= A;
			}
		}else if (((A[1] - point[1])*(B[0] - A[0])) == ((A[0] - point[0])*(B[1] - A[1]))){
			distance = 0;
			newpoint= point;
			break;
		}else {
			var r = (((point[0] - A[0])*(B[0] - A[0])) + ((point[1] - A[1])*(B[1] - A[1])))/(((B[0] - A[0])*(B[0] - A[0])) + ((B[1] - A[1])*(B[1] - A[1])));
			if (r <= 0){
				var distanceDummy = distanceFromAToB(point,A);
				if(distance > distanceDummy){
					distance = distanceDummy;
					newpoint= A;
				}
			}else if (r >= 1){
				var distanceDummy = distanceFromAToB(point,B);
				if(distance > distanceDummy){
					distance = distanceDummy;
					newpoint= B;
				}		
			}else {
				var C = [];
				C[0] = A[0] + (r*(B[0] - A[0]));
				C[1] = A[1] + (r*(B[1] - A[1]));
				var distanceDummy = distanceFromAToB(point,C);
				if(distance > distanceDummy){
					distance = distanceDummy;
					newpoint= C;
				}				
			}	
			
		}
		A = B;
	}
	
	if( 0 < distance &&  distance < 2){
		newPointFeature[0].setGeometry(new ol.geom.Point(newpoint));
	}

	return newPointFeature;
}

function distanceFromAToB(A,B){
	var sourceProj = map.getView().getProjection();
	var c1 = ol.proj.transform(A, sourceProj, 'EPSG:4326');
	var c2 = ol.proj.transform(B, sourceProj, 'EPSG:4326');
	var length = wgs84Sphere.haversineDistance(c1, c2);
	return length;
}


















