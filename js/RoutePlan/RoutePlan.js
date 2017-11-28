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
	// 关闭并清除测距
	stopAndRemoveLength();
	// 关闭电子围栏编辑
	electronicFenceDrawOFF();
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
	// 关闭高亮
	removeSelectSingleClick();	
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
	// 关闭高亮
	removeSelectSingleClick();	
	if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	labelOnMapClear();
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = '我的位置';
	setMyLocation();
}
// 从地图取点取终点
function getEndLabelOnMap(){	
	// 关闭高亮
	removeSelectSingleClick();	
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
		if((RouteSourceFloor == RouteTargetFloor) && (sourceLabelX == targetLabelX) && (sourceLabelY == targetLabelY)){
			alert('起点和终点不能相同！');
		}else{
			console.log('开始路径规划！');
			RouteLayer = new ol.layer.Vector({
				title: 'route map',
				visible: true,
				source: new ol.source.Vector(),
				zIndex: 20		
			});		
			
			if (RouteSourceFloor == RouteTargetFloor){
				RouteParam = 'x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
				var RouteRequestParam = {
					service: 'WFS',
					version: '1.1.0',
					request: 'GetFeature',
					typeName: DBs + ':route_new', // 路径规划图层
					outputFormat: 'application/json',
					viewparams: RouteParam
				};	
				$.ajax({  
					url: wfsUrl,
					data: $.param(RouteRequestParam), 
					type: 'GET',
					dataType: 'json',
					success: function(response){
						var routeCoordinates = response.features[0].geometry.coordinates;

						routeFeature[0] = new ol.Feature({
							geometry: new ol.geom.LineString(routeCoordinates),
						});
						
						routeFeature[0].setStyle(routeStyle[1]);
						RouteLayer.getSource().addFeatures(routeFeature);
					}
				});				
			}else{
				RouteParam = 'startfloor:' + RouteSourceFloor + ';endfloor:' + RouteTargetFloor + ';x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
				var RouteRequestParam = {
					service: 'WFS',
					version: '1.1.0',
					request: 'GetFeature',
					typeName: DBs + ':route_withfloor', // 路径规划图层
					outputFormat: 'application/json',
					viewparams: RouteParam
				};	
				$.ajax({  
					url: wfsUrl,
					data: $.param(RouteRequestParam), 
					type: 'GET',
					dataType: 'json',
					success: function(response){
						if(response.features.length > 0){
							var routeCoordinatesa = response.features[0].geometry.coordinates;
							var routeCoordinatesb = response.features[0].properties.line2.coordinates;
	
							routeFeature[0] = new ol.Feature({
								geometry: new ol.geom.LineString(routeCoordinatesa),
							});		
							routeFeature[1] = new ol.Feature({
								geometry: new ol.geom.LineString(routeCoordinatesb),
							});		
						
							// 规划完了之后默认显示在起点处
							setFloorAndCenter(RouteSourceFloor,sourceLabelX,sourceLabelY);
							setRouteStyleWithFloor();
							// RouteLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
							RouteLayer.getSource().addFeatures(routeFeature);							
						}else{
							alert('未找到合适的路线！');
						}

					}
				});				
			}

			overmap.getLayers().extend([RouteLayer]);	
			labelOnMapClear();	
			loadselectSingleClick();
		}
	}
}
// 跨楼层路径规划设置默认显示在起点位置和所在楼层
function setFloorAndCenter(floor,geomx,geomy){
	view.setCenter([geomx,geomy]);
	// 当所在楼层不是起点所在楼层时，切换到起点的楼层
	if (floor != floorid){
		//起点楼层的图标高亮
		var floorLength = document.getElementsByClassName('floorS').length;
		for (var i =0; i< floorLength; i++){
			document.getElementsByClassName('floorS')[i].classList.remove('active');
		}
		document.getElementsByClassName(floor)[0].classList.add('active');
		// 切换楼层
		floorUpdate(floor);
	}	
}

// 跨楼层路径规划设style
function setRouteStyleWithFloor(){
	if(RouteSourceFloor == floorid){
		if(routeFeature.length > 0){
			routeFeature[0].setStyle(routeStyle[1]);
			routeFeature[1].setStyle(routeStyle[0]);
		}
		RouteStartLayer.setOpacity(1);
		RouteDestLayer.setOpacity(0.4);		
	}else if (RouteTargetFloor == floorid){
		if(routeFeature.length > 0){
			routeFeature[0].setStyle(routeStyle[0]);
			routeFeature[1].setStyle(routeStyle[1]);		
		}
		RouteStartLayer.setOpacity(0.4);
		RouteDestLayer.setOpacity(1);		
	}else{
		if(routeFeature.length > 0){
			routeFeature[0].setStyle(routeStyle[0]);
			routeFeature[1].setStyle(routeStyle[0]);		
		}
		RouteStartLayer.setOpacity(0.4);
		RouteDestLayer.setOpacity(0.4);		
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
		myLocate.set('sfloor',locateFloor);
		RouteStartLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteStartLayer]);	
		RouteSourceFloor = locateFloor;
	}else if (LabelAction == 'endLabel'){
		targetLabelX = LabelX;
		targetLabelY = LabelY;
		myLocate.set('efloor',locateFloor);
		RouteDestLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteDestLayer]);	
		RouteTargetFloor = locateFloor;
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
				myPoint.set('sfloor',e.selected[0].values_.floor_id);
				RouteStartLayer.getSource().addFeature(myPoint);		
				overmap.getLayers().extend([RouteStartLayer]);	
				RouteSourceFloor = e.selected[0].values_.floor_id;
			}else if (LabelAction == 'endLabel'){
				targetLabelX = LabelX;
				targetLabelY = LabelY;
				myPoint.set('efloor',e.selected[0].values_.floor_id);
				RouteDestLayer.getSource().addFeature(myPoint);	
				overmap.getLayers().extend([RouteDestLayer]);	
				RouteTargetFloor = e.selected[0].values_.floor_id;
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

function setlabelOnClick(LabelAction,coordinate,ClickFloor){
	if (LabelAction == 'startLabel'){
		if (RouteStartLayer != null ){RouteStartLayer.getSource().clear();}
	}else if(LabelAction == 'endLabel'){
		if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	}
	myPoint = new ol.Feature({
		geometry: new ol.geom.Point(coordinate)
	});
	LabelX = coordinate[0];
	LabelY = coordinate[1];
	if (LabelAction == 'startLabel'){
		sourceLabelX = LabelX;
		sourceLabelY = LabelY;
		myPoint.set('sfloor',ClickFloor);
		RouteStartLayer.getSource().addFeature(myPoint);		
		overmap.getLayers().extend([RouteStartLayer]);	
		RouteSourceFloor = ClickFloor;
	}else if (LabelAction == 'endLabel'){
		targetLabelX = LabelX;
		targetLabelY = LabelY;
		myPoint.set('efloor',ClickFloor);
		RouteDestLayer.getSource().addFeature(myPoint);	
		overmap.getLayers().extend([RouteDestLayer]);	
		RouteTargetFloor = ClickFloor;
	}
	StartPathPlanning();	
	LabelX = null;
	LabelY = null;				
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


