// 路径规划
// Main
function pathPlanningMain(){
	if (pathPlanningOFF){
		$('.routemain').css('display', 'block');
		$('#route-server').css('display', 'block');
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
	startRouteStyle = function(resolution){
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
		zIndex: 70
	}); 
	setLabelAction('start');
	getLabelFromLocate();	
}
// 终点layer初始化
function CreateRouteDestLayer(){
	destRouteStyle = function(resolution){
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
		zIndex: 70
	}); 			
}

// 设置起点终点
function setLabelAction(flag){
	if(flag == "start"){
		LabelAction = 'startLabel';
	}else if(flag == "end"){
		LabelAction = 'endLabel';
	}
}
// 从location取起终点
function getLabelFromLocate(){
	if(LabelAction == 'startLabel'){
		RouteStartLayer.getSource().clear();	
		labelOnMapClear();
		$('#label-start').val('我的位置');
		setMyLocation();
	}else if (LabelAction == 'endLabel'){
		removeSelectSingleClick();	
		if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
		labelOnMapClear();
		$('#label-end').val('我的位置');
		setMyLocation();
	}
}
// 从地图取点取起终点
function getLabelOnMap(){
	if(LabelAction == 'startLabel'){
		removeSelectSingleClick();	
		RouteStartLayer.getSource().clear();	
		labelOnMapClear();
		setlabelOnMap();
	}else if (LabelAction == 'endLabel'){
		removeSelectSingleClick();	
		if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
		labelOnMapClear();
		setlabelOnMap();
		}	
}
// 从搜索取起终点
$("#label-start").bind(eventName,function(){
	selectLabel();
});
$("#label-end").bind(eventName,function(){
	selectLabel();
});
function selectLabel(){
	removeSelectSingleClick();	
	labelOnMapClear();
	if(LabelAction == 'startLabel'){
		var searchKeyDummy = $("#label-start").val();
		RouteStartLayer.getSource().clear();	
	}else if (LabelAction == 'endLabel'){
		var searchKeyDummy = $("#label-end").val();
		if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	}
	var searchKey = searchKeyDummy.replace(/'/g, "");
	
	if(searchKey == '' ){
		if (LabelOnMapFlag){
			map.removeInteraction(labelOnMap);
			LabelOnMapFlag = false;		
		}
		if (LabelAction == 'startLabel'){
			if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);}
		}else{
			if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);}
		}
		if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
		$('.route-down').css("display","none");	
		$('#route-server').css("display","block");	
		$('#route_search_result').empty();
	}else{
		requestSelectLabel(searchKey);
	}
}
function requestSelectLabel(searchKey){
	var selectRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':select', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: "place_id=" + placeid + " and name like '%"+str2Unicode(searchKey)+"%'",
		sortby: 'floor_id,name'
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(selectRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var selects = new ol.format.GeoJSON().readFeatures(response);
			if(selects.length == 0){
				$('#route_search_result').empty();
				$('#route_search_result').css('display', 'none');
				//alert('未搜索到' +searchKey+ '相关信息!');
			}else{
				var laver;
				laver = "<table id='ret'>";
				for (var i = 0; i < selects.length; i++) {
					var geom = selects[i].getGeometry().getCoordinates();
					var lon = geom[0];
					var lat = geom[1];
					var name = selects[i].get('name');
					var site = selects[i].site == null ? "" : selects[i].site;
					laver += "<tr id='sel'><td class='line' id="+selects[i].id_ +" style='border-radius: 3px;'>"
					+"<img  style='float:left; margin:20px 5%;' src='images/u84.png'/>"
					+"<div  style='float:left; padding: 12px;'>"
						+"<span hidden class='lineno' style='font-size:1.2rem;line-height:2.4rem;'>"+ i+ "、"+ "</span>"+ name + "</br>"
						+"<span  style='float:left;font-size:10px;'>F"+selects[i].get('floor_id')+"</span> "
					+"</div>"
					+"<img id='u16_img' style='float: right;width: 90%;height: 1px;' class='img ' src='images/u55.png'/>"
					+"</td></tr>"
					;
				}
				laver += "</table>";
				$('#route_search_result').empty();
				$('#route_search_result').html(laver);
				$('.line:first').addClass('hover');
				$('.line:first').css('background' , 'rgb(22, 155, 213)' );
				$('.hover img').attr("src","images/u80.png");
				$('#route_search_result').css('display', '');

				$('.line').hover(function() {
					$('.line').removeClass('hover');
					$(this).addClass('hover');
					$('.line').css('background' , 'rgb(255, 255, 255)' );
					$('.line img').attr("src","images/u84.png");
					$(this).css('background' , 'rgb(22, 155, 213)' );
					$('.hover img').attr("src","images/u80.png");
				}, function() {
					$('.hover').css('background' , 'rgb(255, 255, 255)' );
					$('.hover img').attr("src","images/u84.png");
					$(this).removeClass('hover');
				});
				$('.line').click(function() {
					var selectFeature = selects[$(this).text().split("、")[0]];
					if(LabelAction == 'startLabel'){
						$("#label-start").val(selectFeature.get('name'));
					}else if (LabelAction == 'endLabel'){
						$("#label-end").val(selectFeature.get('name'));
					}
					$('#route_search_result').empty();
					$('#route_search_result').css('display', 'none');
					
					var selectGeom = selectFeature.getGeometry().getCoordinates();					
					var selectFloor = selectFeature.get('floor_id');
					setlabelOnClick(LabelAction,selectGeom,selectFloor);
				})
			}				
		}
	}); 		
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
	if ($('#label-start').val() != '' && $('#label-end').val() != '' ){
		console.log('起点和终点不为空！');
		if((RouteSourceFloor == RouteTargetFloor) && (sourceLabelX == targetLabelX) && (sourceLabelY == targetLabelY)){
			alert('起点和终点不能相同！');
		}else{
			console.log('开始路径规划！');
			if($('#label-start').val() == '我的位置'){$('.route-down').css("display","block");	}
			$('#route-server').css("display","none");	
			RouteLayer = new ol.layer.Vector({
				title: 'route map',
				visible: true,
				source: new ol.source.Vector(),
				zIndex: 20		
			});		
			
			routeFeature = [];
			if (RouteSourceFloor == RouteTargetFloor){
				RouteParam = 'floorid:' + RouteSourceFloor  + ';x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
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
					async: false,
					success: function(response){
						var routeCoordinates = response.features[0].geometry.coordinates;

						routeFeature[0] = new ol.Feature({
							geometry: new ol.geom.LineString(routeCoordinates),
						});
						
						routeFeature[0].setStyle(routeStyle[1]);
						RouteLayer.getSource().addFeatures(routeFeature);
						setRouteLength();
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
					async: false,
					success: function(response){
						if(response.features.length > 0){
							var routeCoordinatesa = response.features[0].geometry ?  response.features[0].geometry.coordinates : [];
							var routeCoordinatesb = response.features[0].properties.line2 ? response.features[0].properties.line2.coordinates :[];
	
							if(routeCoordinatesa){
								routeFeature[0] = new ol.Feature({
									geometry: new ol.geom.LineString(routeCoordinatesa),
								});	
							}
							if(routeCoordinatesb){
								routeFeature[1] = new ol.Feature({
									geometry: new ol.geom.LineString(routeCoordinatesb),
								});		
							}

							// 规划完了之后默认显示在起点处
							setFloorAndCenter(RouteSourceFloor,sourceLabelX,sourceLabelY);
							setRouteStyleWithFloor();
							// RouteLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
							RouteLayer.getSource().addFeatures(routeFeature);			
							setRouteLength()
						}else{
							alert('未找到合适的路线！');
						}

					}
				});				
			}
			loadselectSingleClick(); 
			overmap.getLayers().extend([RouteLayer]);
			labelOnMapClear();			
		}
	}
}
function setRouteLength(){
	var naviCoordinates, naviCoordinatesLength;
	var naviLength = 0;
	var naviFirstLength;//下一路口距离
	var naviFirstDirection = 0; //下一路口方向
	var naviFirstAngle = 0;//ab，ac夹角

	for (var i = 0; i<routeFeature.length; i++ ){
		naviCoordinates = routeFeature[i].getGeometry().getCoordinates();
		naviCoordinatesLength = naviCoordinates.length;
		
		for(var i = 0;i<naviCoordinatesLength -1;i++){
			naviLength += distanceFromAToB(naviCoordinates[i],naviCoordinates[i+1]);
			if(-10< naviFirstAngle &&  naviFirstAngle< 10){
				naviFirstLength = naviLength;
				if(naviCoordinates[i+2]){
					var a = [naviCoordinates[i+1][0] - naviCoordinates[i][0] , naviCoordinates[i+1][1] - naviCoordinates[i][1]];
					var b = [naviCoordinates[i+2][0] - naviCoordinates[i][0] , naviCoordinates[i+2][1] - naviCoordinates[i][1]];
					var sin = a[0] * b[1] - b[0] *a[1];  
					var cos = a[0] * b[0] + a[1]* b[1];
					naviFirstAngle = Math.atan2(sin, cos) * (180 / Math.PI);
					naviFirstDirection = sin;
				}
			}	
		}
	}	
	naviFirstLength = naviFirstLength.toFixed(2);
	naviLength = parseInt(naviLength);

	$("#route-length").html("距离终点：" + naviLength+ "米");	
	if(NaviFlag){
		if( -10< naviFirstAngle &&  naviFirstAngle< 10){
			var upOrDown = RouteSourceFloor - RouteTargetFloor >0 ? "下" : "上";
			if(RouteSourceFloor == RouteTargetFloor ){
				$('#navi-length').html(naviFirstLength + "米后到达终点");
			}else{
				$('#navi-length').html(naviFirstLength + "米后"+ upOrDown + "楼至 " + RouteTargetFloor + "层");
			}			
		}else{
			naviFirstDirection = naviFirstDirection > 0 ? "左" : "右";
			$('#navi-length').html(naviFirstLength + "米后 " + naviFirstDirection + "转");
		}
		$('#navi-time span').html( "剩余" + naviLength + "米");
	}
}

// 跨楼层路径规划设置默认显示在起点位置和所在楼层
function setFloorAndCenter(floor,geomx,geomy){
	view.animate({
		duration: 500,
		center: [geomx,geomy],
		zoom: 21
	});	
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
// 路径规划设style
function setRouteStyleWithFloor(){
	/* 非跨楼层*/ 
	if(RouteSourceFloor == RouteTargetFloor){
		if(RouteSourceFloor == floorid){/* 切换到路线所在楼层 */
			routeFeature[0].setStyle(routeStyle[1]);
			RouteStartLayer.setOpacity(1);
			RouteDestLayer.setOpacity(1);
		}else{/* 切换到路线之外楼层 */
			routeFeature[0].setStyle(routeStyle[0]);
			RouteStartLayer.setOpacity(0.4);
			RouteDestLayer.setOpacity(0.4);
		}
	}else{/* 跨楼层*/
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
	$('#label-start').val('');
	$('#label-end').val('');
}
// 清空layer的source
function clearPathLayers(){
	if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer=null;}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer=null;}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);RouteLayer=null;}
}

// 关闭路径规划
function backPathPlan(){
	$('.route-down').css("display","none");	
	$('#route-server').css("display","none");	
	$('.routemain').css('display', 'none');
	// 清除路径规划
	clearPath();
	// 打开点选功能
	loadselectSingleClick(); 
}

function setMyLocation(){	
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	if (LabelAction == 'startLabel'){
		if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer.getSource().clear();}
	}else if(LabelAction == 'endLabel'){
		if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer.getSource().clear();}
	}
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
		var selectedFeatures = labelOnMap.getFeatures();	
		labelOnMap.on('change:active', function() {
			selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
		});
		map.addInteraction(labelOnMap);
		if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
		labelOnMap.on('select', function(e) {
			if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
			if (LabelAction == 'startLabel'){
				if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer.getSource().clear();}
			}else if(LabelAction == 'endLabel'){
				if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer.getSource().clear();}
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
				$('#label-start').val(e.selected[0].values_.name);
				sourceLabelX = LabelX;
				sourceLabelY = LabelY;
				myPoint.set('sfloor',e.selected[0].values_.floor_id);
				RouteStartLayer.getSource().addFeature(myPoint);		
				overmap.getLayers().extend([RouteStartLayer]);	
				RouteSourceFloor = e.selected[0].values_.floor_id;
			}else if (LabelAction == 'endLabel'){
				$('#label-end').val(e.selected[0].values_.name);
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
		if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer.getSource().clear();}
	}else if(LabelAction == 'endLabel'){
		if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer.getSource().clear();}
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
	$('#label-start').val('');	
	$('.route-down').css("display","none");	
	$('#route-server').css("display","block");	
	$('#route_search_result').empty();
}

function clearEndLabel(){
	if (LabelOnMapFlag && LabelAction == 'endLabel'){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	$('#label-end').val('');	
	$('.route-down').css("display","none");	
	$('#route-server').css("display","block");	
	$('#route_search_result').empty();
}

// 导航-main
function addNavigation(){
	// 关闭搜索详情
	$(".div2").hide();
	$('.control-delete').css("display","none");
	var lon = parseFloat($("#gps_x").val());
	var lat = parseFloat($("#gps_y").val());
	var name = $("#gps_name").val();
	var floorId = $("#gps_fid").val();
	var coordinate = [lon,lat];
	
	// 打开路径规划
	removeselect();
	removeSelectSingleClick();
	// 打开路径规划功能
	pathPlanningMain();
	// 设置终点为选中的点，自动规划完路线
	LabelAction = 'endLabel';
	$('#label-end').val(name);
	setlabelOnClick(LabelAction,coordinate,floorId);
	
	// 开启导航
	navigation();

}
// 开启导航
function navigation(){
	NaviFlag = true;
	// 开启罗盘-设置起点样式
	window.addEventListener("deviceorientation", handleOrientation, true);
	
	// common 展示信息作成
	setRouteLength();
	
	// 开启导航样式-终点&路线样式 -todo
	// RouteStartLayer.setStyle(getStartNaviStyle());
	// RouteDestLayer.setStyle(destNaviStyle);

	// 设置zoom,center
	view.animate({
		duration: 1000,
		center: locate,
		zoom: 23
	});	

	// 关闭规划详情页面
	$('.routemain').css('display', 'none');
	$('.route-down').css("display","none");	
	$('#route-server').css("display","none");	
	// 关闭主页菜单
	$('.feature-select').css("display","none");	
	$('.control-locate').css("display","none");	
	// 开启导航详情页面
	$('.navi-top').css('display', 'block');
	$('.navi-down').css('display', 'block');
}
// 开启罗盘
function handleOrientation(orientData) {	
	var alpha = orientData.alpha;
	// var beta = orientData.beta;
	// var gamma = orientData.gamma;
	alpha = alpha>270 ? alpha-270:alpha + 90;
	var locateRotation = (360 - alpha)/360 *2*3.1416 -0.8;
	locationNaviStyle[0].getImage().setRotation(locateRotation);
	LocationLayer.setStyle(locationNaviStyle);
}
// 退出导航 
function removeNavigation(){
	// 关闭罗盘
	window.removeEventListener("deviceorientation", handleOrientation, true);
	// 恢复规划样式-TODO
	LocationLayer.setStyle(locationStyle);
	// RouteStartLayer.setStyle(startRouteStyle);
	// RouteDestLayer.setStyle(destRouteStyle);
	
	// 设置zoom,center
	view.animate({
		duration: 1000,
		center: locate,
		zoom: 21
	});
	
	// 恢复主页菜单
	$('.feature-select').css("display","block");	
	$('.control-locate').css("display","block");	
	// 恢复规划详情页面
	$('.routemain').css('display', 'block');
	$('.route-down').css("display","block");	
	// 关闭导航页面
	$('.navi-top').css('display', 'none');
	$('.navi-down').css('display', 'none');
	$('#navi-length').html( "");
	$('#navi-time span').html( "");

	NaviFlag = false;
}
