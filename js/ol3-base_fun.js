
// 确认网址的参数 返回参数值
function checkUrlParam(checkName){
	var checkUrlParams = window.location.search.substr(1)
	
	var reg = new RegExp("(^|&)"+ checkName +"=([^&]*)(&|$)");

	var checkValues = checkUrlParams.match(reg);
	
	if(checkValues!=null){
		var checkValue = unescape(checkValues[2]);  
		if (checkValue != ''){
			checkFlag = true;
		}else{
			alert('未设置参数“' + checkName + '”的值');
		}
	}else {
		alert('未设置参数：' + checkName);
	} 
	return checkValue;	
}

// 获取定位信息
function getlocation(){
	LocationRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: 'wanhuayuan:location_personal', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: 'l_id=' + deviceId
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(LocationRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var features = new ol.format.GeoJSON().readFeatures(response);
			// console.log(floorid);
			var featureOBJ = response.features;
			// console.log(featureOBJ[0].properties.floor_id);
			// 当定位点所在楼层和室内图选择的楼层相同时，显示定位点
			if (featureOBJ[0].properties.floor_id == floorid){
				center_wfs.addFeatures(features);
			}
			// 得到定位点的坐标，用于返回定位点&路径规划
			locate = featureOBJ[0].geometry.coordinates; // 取得位置信息			
		}
	}); 		
}

// 获取定位信息
function startlocation(){  
	setTimeout(startlocation,5000);  
	center_wfs.clear();
	getlocation();
}

// 加载定位信息
function loadlocation(){	
	checkName = 'deviceId';
	deviceId = checkUrlParam(checkName);
	
	if (checkFlag) {
		// 获取定位信息
		startlocation();
		LocationLayer.setSource(center_wfs);
		LocationLayer.setStyle(locationStyle);
		backcenterFlag = true;
	}	
}

// 回到定位点
function backcenter(){
	// if (self.fetch){
		// alert('fetch is ok!');
	// }else {
		// alert('fetch can not use!');
	// }
	// 平移动画
	if (backcenterFlag){
		view.animate({
			duration: 1000,
			center: locate
		});		
	}
}

// 点选-高亮+属性
function loadselectSingleClick(){
	var selectInfo;   //点击poi 的详细信息
	var coordinate;	//点击poi 的坐标
	var selectId;   //点击poi 的形状id
	selectSingleClick = new ol.interaction.Select({
		layers: [selectSingleClickLayter],
		style: selectSingleClickStyle,
	});
	map.addInteraction(selectSingleClick);
	selectSingleClick.on('select', function(e) {
		// console.log(e.selected[0]);
		// selectInfo = e.selected[0].I.name;
		selectInfo = e.selected[0].values_.name;
		selectId = e.selected[0].values_.id;
		var geom = e.selected[0].values_.geometry;
		var geomtype = geom.getType();
		if (geomtype == 'Polygon'){
			coordinate = geom.getInteriorPoint().getCoordinates();
		}else if (geomtype == 'Point'){
			coordinate = geom.getCoordinates();
		}
		HighlightElementContent	.innerHTML = selectInfo;
		HighlightOverlay.setPosition(coordinate);		
	});		
	HighlightElementCloser.onclick = function (){
		HighlightOverlay.setPosition(undefined);
		HighlightElementCloser.blur();
		return false;
	}	
	// 收藏
	HighlightElementCollection.onclick = function (){
		checkCollection(selectId,coordinate);
	}
}

// 关闭 selectSingleClick 点选
function removeSelectSingleClick(){
	HighlightOverlay.setPosition(null);
	map.removeInteraction(selectSingleClick);	
}

// 判断是否已收藏
function checkCollection(selectId,coordinate){
	var CollectionRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: 'wanhuayuan:poi_collection', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: 'user_id=' + userId + ' and poi_id=' + selectId
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(CollectionRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var featuresNum = response.features.length;
			if (featuresNum == 0) {
				var featureType = 'poi_collection';
				var newFeature = new ol.Feature();
				newFeature.setId('poi_collection.'  + deviceId + '.' + selectId );
				newFeature.setGeometryName('geom');	
				newFeature.set('geom', null);
				newFeature.set('poi_id', selectId);
				newFeature.set('l_id', deviceId);
				newFeature.set('user_id', userId);
				newFeature.set('place_id', placeid);
				newFeature.set('floor_id', floorid);
				newFeature.setGeometry(new ol.geom.Point([coordinate[1],coordinate[0]]));
				addNewFeature([newFeature],featureType);
				collectionoff = true;
				alert('收藏成功！');
			}else {
				alert('已收藏过！');
			}
		}
	}); 	
}

// 添加记录
function addNewFeature(features,featureType){
	var WFSTSerializer = new ol.format.WFS();
	var featObjectInsert = WFSTSerializer.writeTransaction(features,
	null, null, {
		featureNS: 'http://www.wanhuayuan.com',
		featurePrefix: 'wanhuayuan',
		featureType: featureType,
		srsName: 'EPSG:4326',
	});
	var serializer = new XMLSerializer();
	var featString = serializer.serializeToString(featObjectInsert);
	featObjectSend(featString);
}
// 发送操作数据库请求
function featObjectSend(featString){
	var request = new XMLHttpRequest();
	request.open('POST', 'http://192.168.1.126:8088/geoserver/wfs?service=wfs');
	request.setRequestHeader('Content-Type', 'text/xml');
	request.send(featString);		
}

// 显示收藏
function collectionPoi(){
	collectionLayer.getSource().clear();
	if (collectionoff) {
		var CollectionParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: 'wanhuayuan:poi_collection', // 定位点图层
			outputFormat: 'application/json',
			cql_filter: 'user_id=' + userId + ' and place_id=' + placeid + ' and floor_id=' + floorid
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(CollectionParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				collectionLayer.getSource().addFeatures(features);
			}
		}); 	
		collectionoff = false;
	}else {
		collectionoff = true;
	}
}

// 楼层选择
function floorSelect(e){
	// console.log(e);
	var floorLength = document.getElementsByClassName('floorS').length;
	for (var i =0; i< floorLength; i++){
		document.getElementsByClassName('floorS')[i].classList.remove('active');
		// console.log(document.getElementsByClassName('floorS')[i]);
	}
	e.classList.add('active');
	// 切换楼层
	// console.log(e.innerText.substr(1));
	if ( e.innerText.substr(1) != floorid){
		// 取点击的楼层 赋值给floor_id   第二个字符后两位
		floorid = e.innerText.substr(1,2);	
		// 刷新图层（背景，道路，poi 其他清空）
		loadBasemap();	
	
		// 刷新收藏
		if(!collectionoff){
			collectionoff = true;
			collectionPoi();
		}
		// 清除 检索
		removeselect();
		// 刷新 热力图
		if(!heatmapoff){
			removeHeatmap();
			guideHeatmap();
		}	
		// 清除 测距
		stopAndRemoveLength();
		// 清除 路径规划  & 刷新 点选
		if (!pathPlanningOFF){
			// clearPath();  // 只清除 路径规划
			backPathPlan();  // 清除 路径规划  & 刷新 点选
		}
		// 清除点选 再增加点选（刷新）
		// removeSelectSingleClick();
		// loadselectSingleClick();		
	}

}

// 刷新图层 背景，道路，poi
function loadBasemap(){
	// 默认楼层
	// console.log(backgroundLayer.getSource().getParams());
	viewParam = 'place_id:' + placeid + ';floor_id:' + floorid;
	// WMS
	backgroundLayer.getSource().updateParams({viewparams:viewParam});
	// polygonLayer.getSource().updateParams({viewparams:viewParam}); //3d
	
	// WFS
	polygonLayer.getSource().clear();
	polygonLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,polygonTypename)));
	pointLayer.getSource().clear();
	pointLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename)));
	selectSingleClickLayter.getSource().clear();
	selectSingleClickLayter.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename)));	
}

// 查找-WC
function selectToilet(){
	if (selectinfo == 'selectToilet') {
		removeselect();
	}else {
		removeselect();
		selectinfo = 'selectToilet';
		featureid = '30050100';	
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource();			
	}
}
// 查找-大门
function selectDoor(){
	if (selectinfo == 'selectDoor'){
		removeselect();		
	}else {
		removeselect();
		selectinfo = 'selectDoor';
		featureid = '30050800';
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource();	
	}
}
// 增加检索图层
function getselectLayerSource(){
	var selectRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: 'wanhuayuan:select', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: 'place_id=' + placeid + 'and floor_id=' + floorid + 'and feature_id=' + featureid
	};		
	$.ajax({  
		url: wfsUrl,
		data: $.param(selectRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var selects = new ol.format.GeoJSON().readFeatures(response);
			select_wfs.addFeatures(selects);
		}
	}); 
	selectLayer.setSource(select_wfs);		
}
// 删除检索图层
function removeselect(){
	if (selectinfo!=null) {
		selectLayer.getSource().clear();
		selectinfo = null;
	}
}	

// 增加热力图
function guideHeatmap(){
	if (heatmapoff) {
		// 增加楼层选择filter BUG
		var heatmapRequestParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: 'wanhuayuan:location_personal', // 定位点图层
			outputFormat: 'application/json',
			cql_filter: 'floor_id=' + floorid
		};		
		$.ajax({  
			url: wfsUrl,
			data: $.param(heatmapRequestParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				heatmapLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
			}
		}); 			
		overmap.getLayers().extend([heatmapLayer]);	
		heatmapoff = false;
	}else {
		removeHeatmap();
	}
}
function removeHeatmap(){
	heatmapLayer.getSource().clear();
	overmap.getLayers().remove(heatmapLayer);
	heatmapoff = true;	
}


// 测距
// 开始测距
function startLength(){
	removeSelectSingleClick();
	
	if (lengthoff ){
		lengthoff = false;
		overmap.getLayers().extend([drawlayer,drawpointlayer]);	
	}	

	if (lengthstop){
		lengthstop = false;
		// pointermove 事件的处理
		var dopointermove = function(evt) {
			if (evt.dragging) {return;}
			var helpMsg = '单击确定起点'; // 帮助信息的内容
			if (sketch) {// 绘制的形状
				helpMsg = '单击继续 双击结束';
			}
			helpTooltipElement.innerHTML = helpMsg;
			helpTooltip.setPosition(evt.coordinate);
		};
		map.on('pointermove',dopointermove);
		
		// 获取长度
		formatLength = function(line) {
			var coordinates = line.getCoordinates();
			var length = 0;
			var sourceProj = map.getView().getProjection();
			for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
				var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
				var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
				length += wgs84Sphere.haversineDistance(c1, c2);
			}
			var output;
			if (length > 100) {
				output = (Math.round(length / 1000 * 100) / 100) +
					' ' + 'km';
			} else {
				output = (Math.round(length * 100) / 100) +
					' ' + 'm';
			}
			return output;
		};
		
		// 绘制线的形状
		drawfeature();			
	}
}

// 停止测距
function stopLength(){
	// 绘制未完成直接停止时，未完成的绘制设为已完成
	if (!drawend){
		drawlinestring.finishDrawing();
	}	
	map.removeInteraction(drawlinestring);
	map.removeInteraction(drawpoint);		
	map.removeOverlay(helpTooltip);
	lengthstop = true;
	loadselectSingleClick();
}

// 清除测距
function removeLength(){
	if (drawpointlayer.getSource().getFeatures().length > 0){
		// 绘制未完成直接清除时，未完成的绘制设为已完成
		if (!drawend){
			drawlinestring.finishDrawing();
		}
		drawlayer.getSource().clear();
		drawpointlayer.getSource().clear();
		if (measureTooltips.length > 0){
			for ( var j=0 ; j < measureTooltips.length;j++){
				map.removeOverlay(measureTooltips[j]);
			}
		}

	}	
}

// 关闭并清除测距
function stopAndRemoveLength(){
	if (!lengthoff){
		if(!lengthstop){
			stopLength();
		}
		if (drawpoint != null){
			removeLength();
		}
	}	
}

// 绘制需要测距的形状
function drawfeature(){
  drawlinestring = new ol.interaction.Draw({
    source: drawlayer.getSource(),
    type: 'LineString',
    style: drawlinestringStyle
  }); 
  drawpoint = new ol.interaction.Draw({
    source: drawpointlayer.getSource(),
    type: 'Point',
  });
  map.addInteraction(drawlinestring);
  map.addInteraction(drawpoint);

  createHelpTooltip();

  var listener;
  drawlinestring.on('drawstart',
      function(evt) {
		drawend = false;
		measureTooltipElement = null;
        createMeasureTooltip();
        // set sketch
        sketch = evt.feature;
		tooltipCoord = evt.coordinate;
		listener = sketch.getGeometry().on('change', function(evt) {
			var geom = evt.target;
			var output = formatLength(geom);
			var tooltipCoord = geom.getLastCoordinate();
			measureTooltipElement.innerHTML = output;
			measureTooltips[measureNum].setPosition(tooltipCoord);
		});
      }, this);

  drawlinestring.on('drawend',
      function() {
		drawend = true;
        measureTooltipElement.className = 'tooltiptip tooltip-static';
        measureTooltips[measureNum].setOffset([0, -7]);
        // unset sketch
        sketch = null;
		ol.Observable.unByKey(listener);
		measureNum++;
      }, this);	
}

 //显示长度的overlay  
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltiptip tooltip-measure';
  measureTooltips[measureNum] = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltips[measureNum]);
}

 // 帮助的overlay
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltiptip';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}

// 路径规划
// Main
function pathPlanningMain(){
	if (pathPlanningOFF){
		pathPlanningOFF = false;
		// 确认影响路径规划的模块
		checkPathReady();
		// 开始路径规划
		pathPlanning();		
	}
}

// 确认影响路径规划的模块
function checkPathReady(){
	// 关闭高亮
	removeSelectSingleClick();		
	// 关闭并清除测距
	stopAndRemoveLength();
}

// 初始化路线规划图层
function pathPlanning(){
	// 取起点- 默认：我的位置
	CreateRouteStartLayer();
	// 取终点- 默认：不设置
	CreateRouteDestLayer();
	// // 开始路径规划
	// StartPathPlanning();	
}

// 起点layer初始化
function CreateRouteStartLayer(){	
	var startRouteStyle = function(resolution){
		return [new ol.style.Style({
			image: new ol.style.Icon({
				img: mysvgroutestart,
				imgSize: [30, 30],   // 图标大小
				anchor: [0.5,1],     // 摆放位置
				scale: map.getView().getZoom() / 20  // 根据层级缩放SVG图标
			}),
			zIndex: 700
		})]
	};
	RouteStartLayer = new ol.layer.Vector({  
		title: 'start point',
		visibility: true,
		source: new ol.source.Vector(),
		style: startRouteStyle,
		zIndex: 90
	}); 
	getStartLabelFromLocate();	
}
// 从location取起点
function getStartLabelFromLocate(){
	RouteStartLayer.getSource().clear();	
	labelOnMapClear();
	LabelAction = 'startLabel';
	document.getElementById('label-start').value = '我的位置';
	setMyLocation();
}
// 从地图取点取起点
function getStartLabelOnMap(){	
	RouteStartLayer.getSource().clear();	
	labelOnMapClear();
	LabelAction = 'startLabel';
	document.getElementById('label-start').value = '地图选点';
	setlabelOnMap();
}

// 终点layer初始化
function CreateRouteDestLayer(){
	var destRouteStyle = function(resolution){
		return [new ol.style.Style({
			image: new ol.style.Icon({
				img: mysvgrouteend,
				imgSize: [30, 30],   // 图标大小
				anchor: [0.5,1],     // 摆放位置
				scale: map.getView().getZoom() / 20  // 根据层级缩放SVG图标
			}),
			zIndex: 700
		})]
	};
	RouteDestLayer = new ol.layer.Vector({  
		title: 'end point',
		visibility: true,
		source: new ol.source.Vector(),
		style: destRouteStyle,
		zIndex: 90
	}); 			
}
// 从location取终点
function getEndLabelFromLocate(){
	if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	labelOnMapClear();
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = '我的位置';
	setMyLocation();
}
// 从地图取点取终点
function getEndLabelOnMap(){	
	if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	labelOnMapClear();
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = '地图选点';
	setlabelOnMap();
}

// 删除地图选点 interaction
function labelOnMapClear(){
	if (LabelOnMapFlag){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}	
}

// 开始路径规划
function StartPathPlanning(){
	if (document.getElementById('label-start').value != '' && document.getElementById('label-end').value != '' ){
		console.log('起点和终点不为空！');
		if((sourceLabelX == targetLabelX) && (sourceLabelY == targetLabelY)){
			alert('起点和终点不能相同！');
		}else{
			console.log('开始路径规划！');
			RouteLayer = new ol.layer.Vector({
				title: 'route map',
				visible: true,
				source: new ol.source.Vector(),
				style: new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [0,255,255,1],
						// lineCap: , //butt, round, or square Default is round.
						// lineJoin: , //bevel, round, or miter Default is round.
						lineDash: [1,2,3,4,5,6], // 虚线
						lineDashOffset: 1,
						// miterLimit: ,  // 最大斜接长度
						width: 2
					}),
					zIndex: 250
				}),
				zIndex: 20
			});	
			RouteParam = 'x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
			RouteRequestParam = {
				service: 'WFS',
				version: '1.1.0',
				request: 'GetFeature',
				typeName: 'wanhuayuan:route_new', // 定位点图层
				outputFormat: 'application/json',
				viewparams: RouteParam
			};	
			$.ajax({  
				url: wfsUrl,
				data: $.param(RouteRequestParam), 
				type: 'GET',
				dataType: 'json',
				success: function(response){
					// console.log(response);
					RouteLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
				}
			}); 				
			// RouteLayer = new ol.layer.Tile({
				// title: 'route map',
				// visible: true,
				// source: new ol.source.TileWMS({
					// url: 'http://192.168.1.126:8088/geoserver/wanhuayuan/wms',
					// params: {LAYERS:'wanhuayuan:route_new',version:'1.1.0',viewparams:RouteParam}
				// })
			// });	
			overmap.getLayers().extend([RouteLayer]);		
		}
	}
}

// 清空路径规划
function clearPath(){
	// 初始化输入框
	clearPathDoc();
	// 初始化路径规划layers
	clearPathLayers();
	// 删除地图选点 interaction
	labelOnMapClear();		
	// 初始化取点Flag
	LabelAction = null;
	// 初始化路径规划功能Flag
	pathPlanningOFF = true;
}
// 清空路径规划结果
function clearPathDoc(){
	document.getElementById('label-start').value = '';
	document.getElementById('label-end').value = '';
}
// 清空layer的source
function clearPathLayers(){
	if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer=null;}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer=null;}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);RouteLayer=null;}
}

// 关闭路径规划
function backPathPlan(){
	// 清除路径规划
	clearPath();
	// 打开点选功能
	loadselectSingleClick(); 
}

function setMyLocation(){	
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	LabelX = locate[0];
	LabelY = locate[1];
	myLocate = new ol.Feature({
		geometry: new ol.geom.Point(locate)
	});
	if (LabelAction == 'startLabel'){
		sourceLabelX = LabelX;
		sourceLabelY = LabelY;
		RouteStartLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteStartLayer]);					
	}else if (LabelAction == 'endLabel'){
		targetLabelX = LabelX;
		targetLabelY = LabelY;
		RouteDestLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteDestLayer]);	
	}
	StartPathPlanning();	
	LabelX = null;
	LabelY = null;
}

function setlabelOnMap(){	
	if (!LabelOnMapFlag){
		labelOnMap = new ol.interaction.Select({
			layers: [selectSingleClickLayter],
			style: selectSingleClickStyle,
		});
		map.addInteraction(labelOnMap);
		if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
		labelOnMap.on('select', function(e) {
			if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
			if (LabelAction == 'startLabel'){
				if (RouteStartLayer != null ){RouteStartLayer.getSource().clear();}
			}else if(LabelAction == 'endLabel'){
				if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
			}
			var coordinate;
			var geom = e.selected[0].values_.geometry;
			// var geomtype = geom.getType();
			// if (geomtype == 'Polygon'){
				// coordinate = geom.getInteriorPoint().getCoordinates();
			// }else if (geomtype == 'Point'){
				coordinate = geom.getCoordinates();
			// }	
			myPoint = new ol.Feature({
				geometry: new ol.geom.Point(coordinate)
			});
			LabelX = coordinate[0];
			LabelY = coordinate[1];
			if (LabelAction == 'startLabel'){
				sourceLabelX = LabelX;
				sourceLabelY = LabelY;
				RouteStartLayer.getSource().addFeature(myPoint);		
				overmap.getLayers().extend([RouteStartLayer]);	
			}else if (LabelAction == 'endLabel'){
				targetLabelX = LabelX;
				targetLabelY = LabelY;
				RouteDestLayer.getSource().addFeature(myPoint);	
				overmap.getLayers().extend([RouteDestLayer]);	
			}
			StartPathPlanning();	
			LabelX = null;
			LabelY = null;				
		});
		LabelOnMapFlag = true;
	}else{
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;
	}
}

function clearStartLabel(){
	if (LabelOnMapFlag && LabelAction == 'startLabel'){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}	
	if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	document.getElementById('label-start').value = '';	
}

function clearEndLabel(){
	if (LabelOnMapFlag && LabelAction == 'endLabel'){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	document.getElementById('label-end').value = '';	
}














