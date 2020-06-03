// common
var locate; // 中心点   定位点&返回中心点&路径规划
var deviceId; //手环id   从传入参数获取值  点位点&收藏
var userId = '1592782'; //用户ID   从传入参数获取值   收藏     
var ltype; // 定位点类型 暂未用到

var placeid = '1';
var floorid = '1';// 楼层编号    选择楼层
var locateFloor;
var LocationRequestParam; //定位param
var DBs = 'debo'; //数据源
var lineDBs = 'leador';
var locateIp = 'http://47.103.35.78:8086';
var comIp = 'https://map.intmote.com';
// var comIp = 'http://116.231.55.50:9088';//备用
var wfsUrl = comIp + '/geoserver/wfs';
var wmsUrl = comIp + '/geoserver/' + DBs + '/wms';
var locateUrl = locateIp + '/LocateService/getLocation.action';
var locateCertainUrl = locateIp + '/LocateService/getCertainLocation.action';
var locateAllUrl = locateIp + '/LocateService/getAllLocation.action';

// 2d 初始化
var geomPlaces;
var geomBackgrounds = {};
var geomPolygons = {};
var geomPOIs = {};

// 定位点纠偏 变量设置
var setCenterFlag = true,getLocateLocateFlag = true,LocatesForShow = {};
var beforeLocatesForShow = {};// 平滑  id：geom
var checkWallInFlag = {};// 定位点穿墙 id：[before.polygon.fid,now.polygon.fid]

// 判断设备
var checkAPPFlag = true;
function checkAPP() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			checkAPPFlag = false;
			break;
		}
	}
	
	$(".around").attr("disabled","disabled");// 周边、暂时没做
	$(".around").css("background","rgba(188,188,188,1)");
	if(checkAPPFlag){/* PC设备导航不可用 */
		$(".navigation").attr("disabled","disabled");
		$(".navigation").css("background","rgba(188,188,188,1)");	
		$("#route2navi").attr("disabled","disabled");
		$("#route2navi").css("background","rgba(188,188,188,1)");
	}else{/* APP加罗盘 */
		openOrientation();
	}
}
// 开启罗盘
var locateRotation;
var rotationFlag = false;
function openOrientation() {	
	var ua = navigator.userAgent.toLowerCase();
	if(/android/.test(ua)){/* android */
		window.addEventListener('deviceorientationabsolute', DeviceOrientationHandler, false);
		function DeviceOrientationHandler(event) {
			var alpha = event.alpha;
			locateRotation = Math.round(360 - alpha)/360 *2*3.1416;
			if(NaviFlag){/* 导航模式 */
				locationNaviStyle[0].getImage().setRotation(locateRotation);
				LocationLayer.setStyle(locationNaviStyle);
			}else{/* 普通模式 */
				locationStyle[0].getImage().setRotation(locateRotation-3.1416);
				LocationLayer.setStyle(locationStyle);
			}
			// 跟随模式 TODO
			if(rotationFlag){// APP 跟随定位方向模式
				view.setRotation(-locateRotation);
			}else{ // APP退出跟随定位方向模式
				view.setRotation(0);
			}
		}
	}else{/* ios */
		window.addEventListener('deviceorientation', DeviceOrientationHandler, false);
		function DeviceOrientationHandler(event) {
			var alpha = event.webkitCompassHeading;
			// var beta = orientData.beta;
			// var gamma = orientData.gamma;
			// alpha = alpha>270 ? alpha-270:alpha + 90;
			locateRotation = alpha/360 *2*3.1416;
			if(NaviFlag){/* 导航模式 */
				locationNaviStyle[0].getImage().setRotation(locateRotation);
				LocationLayer.setStyle(locationNaviStyle);
			}else{/* 普通模式 */
				locationStyle[0].getImage().setRotation(locateRotation -3.1416);
				LocationLayer.setStyle(locationStyle);
			}
			// 跟随模式 TODO
			if(rotationFlag){// APP 跟随定位方向模式
				view.setRotation(-locateRotation);
			}else{ // APP退出跟随定位方向模式
				view.setRotation(0);
			}
		}
	}
}

//设置视图
var view = new ol.View({
	center: [1.4286933,1.1664993],
	projection: 'EPSG:4326',
	zoom: 3
});
// 室内图数据获取 	
var geojsonObject = function(filter,Typename){
	var geojson = {};
	$.ajax({
		url: wfsUrl,
		data: {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typename: DBs + Typename,
			outputFormat: 'application/json',
			cql_filter: filter
		},
		type: 'GET',
		dataType: 'json',	
		async: false,
		success: function(response){
			var features = new ol.format.GeoJSON().readFeatures(response);
			var floorLength = features.length;
			if(floorLength > 0){
				for(var i=0;i<features.length;i++){
					var featuresFloor = features[i].get('floor_id');
					if(geojson[featuresFloor] == undefined){
						geojson[featuresFloor] = [];
					}
					geojson[featuresFloor].push(features[i]);
				}	
			}
		}
	});
	// 返回经过条件筛选后的数据
	return geojson; 
};
/* get 室内图 */
function getGeomData(){
	geomBackgrounds = geojsonObject('place_id='+placeid,':polygon_background');
	geomPolygons = geojsonObject('place_id='+placeid,':polygon');
	geomPOIs = geojsonObject('place_id='+placeid,':point');
}

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
			geojsonstyle[featureiiiid].getImage().setScale(0.25);
		}
		geojsonstyle[featureiiiid].getImage().setRotation(featureangle);
	}
	if (featureiiiid == '30050100' || featureiiiid == '30050800' || featureiiiid == '30050200' || featureiiiid == '30050300' ){
		if (map.getView().getZoom() > 18){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-18)*0.06);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.2);
		}
	}
	// 返回数据的style
	return geojsonstyle[featureiiiid];
};


// 确认网址的Flag 当为true时可以定位，加载定位信息

//获取所有place
var getGeomPlaces = function(Typename){
	var geojson = [];
	$.ajax({
		url: wfsUrl,
		data: {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typename: DBs + Typename,
			outputFormat: 'application/json',
		},
		type: 'GET',
		dataType: 'json',	
		async: false,
		success: function(response){
			geojson = new ol.format.GeoJSON().readFeatures(response);
		}
	});
	return geojson; 
};
geomPlaces = getGeomPlaces(':polygon_background');
//获取中心点
var mapCenter = function(placeId){
	var placeLength = geomPlaces.length;
	var places = 0,placeLonSum = 0,placeLatSum = 0;
	for (var placeNum =0;placeNum < placeLength;placeNum++){
		if (geomPlaces[placeNum].get('place_id') == placeId){
			placeLonSum += geomPlaces[placeNum].getGeometry().getInteriorPoint().getCoordinates()[0];
			placeLatSum += geomPlaces[placeNum].getGeometry().getInteriorPoint().getCoordinates()[01];
			places ++;
		}
	}
	return [placeLonSum/places,placeLatSum/places];
}

// 根据中心点判断最近的place
function getPlace(center){
	var centerPlace;
	var mindistance = 20000000;
	var placeLength = geomPlaces.length;
	for (var placeNum =0;placeNum < placeLength;placeNum++){
		var dummyDis = distanceFromAToB(geomPlaces[placeNum].getGeometry().getInteriorPoint().getCoordinates(),center) ;
		if(dummyDis < mindistance ){
			centerPlace = geomPlaces[placeNum].get('place_id');
			mindistance = dummyDis;
		}
	}
	if(mindistance < 20000000 && centerPlace != placeid){
		placeid = centerPlace;
		getGeomData();
		// 加载楼层条
		getFloorList();
	}else{
		// 地图随定位点移动（保持定位点在地图中心）
		backcenter();
	}		
}

var checkFlag = false;

// 当为TRUE时 定位点在电子围栏内，定位点的style为特殊式样
var locateStyleWarn = false;

// 返回中心点的Flag 当为true时有定位信息，可以返回中心点
var backcenterFlag = true;;

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
	request.open('POST', wfsUrl + '?service=wfs',false);
	request.setRequestHeader('Content-Type', 'text/xml');
	request.send(featString);		
}

// 字符转换
var str2Unicode = function(str) {
    var es=[];
    for(var i=0;i < str.length;i++)
        es[i]=("00"+str.charCodeAt(i).toString(16)).slice(-4);
    return "\\u"+es.join("\\u");
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

//定位点顺滑平移-伪实现
function moveAnimation(beforePoints,nowfeaturesLocate){
	var featuresLocate = nowfeaturesLocate;
    var progress = 0;  
    var speed = 50;  	
	
    var intervalX={},intervalY={};
	for(var i = 0;i < featuresLocate.length; i++){
		var locate_ID = featuresLocate[i].get('l_id');
		if(checkWallInFlag[locate_ID][2].length < 3){
			var futurePoint = featuresLocate[i].getGeometry().getCoordinates();
			intervalX[locate_ID] = (futurePoint[0] - beforePoints[locate_ID][0])/speed;
			intervalY[locate_ID] = (futurePoint[1] - beforePoints[locate_ID][1])/speed;

		}
	}
    var timer = requestAnimationFrame(function moveFeature(){
    	progress += 1;  
    	var newpoint = [];
    	for(var i = 0;i < featuresLocate.length; i++){
    		var locate_ID = featuresLocate[i].get('l_id');

    		if(intervalX[locate_ID] || intervalX[locate_ID] == 0 ){
    			newpoint[0] = beforePoints[locate_ID][0] + intervalX[locate_ID] * progress;
    			newpoint[1] = beforePoints[locate_ID][1] + intervalY[locate_ID] * progress;
    		}else{
    			var newpointNum = checkWallInFlag[locate_ID][2].length;
    			var newpointNumDummy = parseInt(progress/(speed/newpointNum));
    			newpointNumDummy = newpointNumDummy < newpointNum ? newpointNumDummy : newpointNum-1;
    			newpoint = checkWallInFlag[locate_ID][2][newpointNumDummy];
    		}
			featuresLocate[i].setGeometry(new ol.geom.Point(newpoint));
    	}
    	
    	center_wfs.clear();
    	center_wfs.addFeatures(featuresLocate);
    	
        if(progress%speed != 0){
            timer = requestAnimationFrame(moveFeature);
        }else{		
            cancelAnimationFrame(timer);
        }    
    });	
}

// 墙
var polygonWallsFeature = function (){
	var arr = [];
	var listFeatures = Object.keys(geojsonstyle);
	var reg = new RegExp('100305');
	for (var i = 0;i< listFeatures.length;i++){
		if (listFeatures[i].match(reg) && listFeatures[i] != '10030505' ){
			arr.push(listFeatures[i]);
		}
	}
	arr.push('10020401');
	arr.push('10020511');
	return arr;
}
// 判断定位点位置
var polygonWalls = [];
var polygonWallsFeatures;
var WallInFlag = function checkWallIn(Geom){	
	// if(polygonWalls.length == 0){polygonWalls = polygonLayer.getSource().getFeatures();}
	if(polygonWalls.length == 0){polygonWalls = [];}
	polygonWallsFeatures = polygonWallsFeature();
	for (var i = 0; i< polygonWalls.length; i++){
		var polygonWallId = polygonWalls[i].get('feature_id');
		
		for(var j in polygonWallsFeatures){
			if(polygonWallId == polygonWallsFeatures[j]){
				var polygonWall = polygonWalls[i].getGeometry().getCoordinates()[0];
				if (rayCasting(Geom,polygonWall) == 'in'){
					return polygonWalls[i].getId();
				}
			}
		}
	}
	return null;
};

// 防止穿墙
function checkLocateIn(locate_ID,beforeGeom,nowGeom){
	checkWallInFlag[locate_ID][0] = checkWallInFlag[locate_ID][1];
	checkWallInFlag[locate_ID][1] = WallInFlag(nowGeom);
	if(checkWallInFlag[locate_ID][0] != checkWallInFlag[locate_ID][1]){
		// 取路径(折点包括前后定位点)
		checkWallInFlag[locate_ID][2] = getRoute(beforeGeom,nowGeom);
	}else {
		checkWallInFlag[locate_ID][2] = [];
	}
}
//取路径(折点包括前后定位点)
function getRoute(beforeGeom,nowGeom){
	var RouteParam =  'floorid:' + floorid + ';x1:' + beforeGeom[0] + ';y1:' + beforeGeom[1] + ';x2:' + nowGeom[0] + ';y2:' + nowGeom[1];			
	var RouteRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':route_new', // 路径规划图层
		outputFormat: 'application/json',
		viewparams: RouteParam
	};	
	var routeCoordinates = [];
	$.ajax({  
		url: wfsUrl,
		data: $.param(RouteRequestParam), 
		type: 'GET',
		dataType: 'json',
		async: false,
		success: function(response){
			var geoms = response.features[0].geometry.coordinates;
			if(geoms){
				// 判断所取线段的方向
				var dis = distanceFromAToB(beforeGeom,geoms[0]) - distanceFromAToB(beforeGeom,geoms[geoms.length-1]);
				if(dis < 0){
					routeCoordinates = geoms;			
				}else{
					var newgeoms=[];
					var j = 0;
					for (var i=geoms.length -1;i>=0;i--){
						newgeoms[j++] = geoms[i];
					}
					routeCoordinates = newgeoms;
				}
			}

		},
		error: function (){
			console.log('error   route');
		}
	});	
	routeCoordinates.unshift(beforeGeom);
	routeCoordinates.push(nowGeom);
	return routeCoordinates;
}

function rayCasting(p, poly) {
    var px = p[0];
    var py = p[1];
    var flag = false;

    for(var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sx = poly[i][0];
        var sy = poly[i][1];
        var tx = poly[j][0];
        var ty = poly[j][1];

        // 点与多边形顶点重合
        if((sx === px && sy === py) || (tx === px && ty === py)) {
            //console.log('点与多边形顶点重合');
            return 'on';
        }

        // 判断线段两端点是否在射线两侧
        if((sy < py && ty >= py) || (sy >= py && ty < py)) {
            // 线段上与射线 Y 坐标相同的点的 X 坐标
            var x = sx + (py - sy) * (tx - sx) / (ty - sy);

            // 点在多边形的边上
            if(x === px) {
                //console.log('点在多边形的边上');
                return 'on';
            }

            // 射线穿过多边形的边界
            if(x > px) {
                //console.log('射线穿过多边形的边界');
                flag = !flag;
            }
        }
    }
    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? 'in' : 'out';
}




