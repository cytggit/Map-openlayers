
// 确认网址的参数 返回参数值
function checkUrlParam(checkName){
	var checkUrlParams = window.location.search.substr(1)
	
	var reg = new RegExp("(^|&)"+ checkName +"=([^&]*)(&|$)");

	var checkValues = checkUrlParams.match(reg);
	
	if(checkValues!=null){
		var checkValue = unescape(checkValues[2]);  
		if (checkValue != ''){
			checkFlag = true;
			view.setZoom(21);
		}else{
			alert('未设置参数“' + checkName + '”的值');
			checkFlag = false;
		}
	}else {
		alert('未设置参数：' + checkName);
		checkFlag = false;
	} 
	return checkValue;	
}

// 获取定位信息
function getlocation(){	
	// 当deviceId为all的时候，显示所有当前楼层的位置
	var WFSUrl,DATAParam;
	if(deviceId == 'all'){
		WFSUrl = locateCertainUrl;
		DATAParam = {'floor_id':floorid,'place_id':placeid};
	}else{
		WFSUrl = locateUrl;
		DATAParam = {'deviceId':deviceId};
	}
	// 从位置服务器获取定位信息
	$.ajax({
		url: WFSUrl,
		data: DATAParam, 
		type: 'GET',
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'successCallBack',
		success: function(response){

			var features ;
			if(JSON.stringify(response)!="{}"){
				features = new ol.format.GeoJSON().readFeatures(response);
				doWithLocate(features);
			}else{
				var gpsfeature = new ol.Feature();
				
				var gpsCoordinates = [] ;
				// var gpsCoordinates = [121.402541820159,31.2284797284321] ;
				var gpsCoordinates = [121.42308,31.16801] ;

				// navigator.geolocation.getCurrentPosition(function(position) {
					// gpsCoordinates[0] = position.coords.longitude;
					// gpsCoordinates[1]  = position.coords.latitude;
					var newgpsCoordinates = coordtransform.wgs84togcj02(gpsCoordinates[0] ,gpsCoordinates[1] );

					gpsfeature.setGeometry(newgpsCoordinates ?new ol.geom.Point(newgpsCoordinates) : null);
					gpsfeature.set('floor_id','01');
					features = [gpsfeature];
					
					doWithLocate(features);
				// });
			}		
		}		
	});
}

function doWithLocate(features){
				
	center_wfs.clear();
	if(deviceId != 'all'){
		locate = features[0].getGeometry().getCoordinates(); // 取得位置信息		
		locateFloor = features[0].get('floor_id');
		// 切换到定位点所在的区域
		getPlace(locate);
	
		// 电子围栏预警
		electronicFenceWarn();	
		// 设置定位点style
		if (locateStyleWarn){
			LocationLayer.setStyle(locationWarnStyle);
		}else{
			LocationLayer.setStyle(locationStyle);
		}

		// 当定位点所在楼层和室内图选择的楼层相同时，显示定位点
		// if (locateFloor == floorid){
			
			// 判断是否正在路径规划，做路网吸附
			// if(!pathPlanningOFF &&  ){
			if(!pathPlanningOFF && RouteLayer != null && RouteLayer.getSource().getFeatures().length > 0){
				var newcenterFearure = pointToLinestring(features,RouteLayer.getSource().getFeatures());
				center_wfs.addFeatures(newcenterFearure);
			}else{
				center_wfs.addFeatures(features);
			}
		// }
	}else{
		//var features = new ol.format.GeoJSON().readFeatures(response);
		LocationLayer.setStyle(locationStyle);
		center_wfs.addFeatures(features);
	}
}


// 获取实时定位信息
function startlocation(){  
	setTimeout(startlocation,1000);  
	getlocation();
}

// 加载定位信息
function loadlocation(){	
	deviceId = checkUrlParam('deviceId');
	
	if(deviceId == 'all'){
		placeid = checkUrlParam('place_id');
		if (checkFlag){
			getFloorList();
			startlocation();
			LocationLayer.setSource(center_wfs);			
			switch(placeid){
				case '2':
					view.setCenter(motecenter);
					break;
				case '3':
					view.setCenter(zhongbeicenter);
					break;
				case '4':
					view.setCenter(minhangcenter);
					break;
				case '5':
					view.setCenter(zhanlancenter);
					break;
				case '6':
					view.setCenter(lunchuancenter);
					break;
				case '7':
					view.setCenter(fengpucenter);
					break;
				case '8':
					view.setCenter(yukaicenter);
					break;
			}
		}
	}
	if (deviceId != 'all' && checkFlag) {
		// 获取定位信息
		startlocation();
		LocationLayer.setSource(center_wfs);
		backcenterFlag = true;
	}	
}
// 加载楼层条
function getFloorList(){
	var FloorTag = [];
	var FloorId = [];
	var GetFloorParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':polygon_background ', 
		outputFormat: 'application/json',
		cql_filter: 'place_id=' + placeid
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(GetFloorParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var features = new ol.format.GeoJSON().readFeatures(response);
			var floorLength = features.length

			if(floorLength > 0){
				for (var FloorNum =0;FloorNum < floorLength;FloorNum++){
					FloorId[FloorNum] = features[FloorNum].values_.floor_id;
				}
				var floorDummy;
				for (var Floori =0;Floori < floorLength;Floori++){
					for (var Floorj =Floori+1;Floorj < floorLength;Floorj++){
						if (FloorId[Floori] >= FloorId[Floorj]){
							floorDummy = FloorId[Floori];
							FloorId[Floori] = FloorId[Floorj];
							FloorId[Floorj] = floorDummy;
						}					
					}
				}
				for (var FloorNum =0;FloorNum < floorLength;FloorNum++){
					FloorTag[FloorNum] = '<li role="presentation" class="floorS ' + FloorId[FloorNum] + '" onClick="floorSelect(this);"><a>F' + FloorId[FloorNum] + '</a></li>';
				}		
				$("#floorlist").html(FloorTag);
				$(".floor-select").show();
				if(deviceId != 'all'){
					backcenter();
				}				
			}
		}
	}); 	
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
	// 当所在楼层不是定位点所在楼层时，切换到定位点的楼层
	if (locateFloor != floorid){
		// 定位点楼层的图标高亮
		var floorLength = document.getElementsByClassName('floorS').length;
		for (var i =0; i< floorLength; i++){
			document.getElementsByClassName('floorS')[i].classList.remove('active');
			// console.log(document.getElementsByClassName('floorS')[i]);
		}
		document.getElementsByClassName(locateFloor)[0].classList.add('active');
		
		// 切换楼层
		floorUpdate(locateFloor);
	}	
}

// 电子围栏预警
function electronicFenceWarn(){
	WarnParam = 'locatex:' + locate[0] + ';locatey:' + locate[1] + ';locatefloor:' + locateFloor;			
	WarnRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':electronicWarn', // 电子围栏预警图层
		outputFormat: 'application/json',
		viewparams: WarnParam
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(WarnRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var WarnFeatures = response.features;
			var WarnLength = WarnFeatures.length;
			// 获取预警等级和当前电子围栏的name
			if (WarnLength != 0){
				var WarnName,WarnType;
				WarnName = WarnFeatures[0].properties.name;
				WarnType = WarnFeatures[0].properties.type_id;
				if(WarnLength > 1){
					for (var i=1;i<WarnLength;i++){
						if (WarnType < WarnFeatures[i].properties.type_id){
							WarnType = WarnFeatures[i].properties.type_id;
							WarnName = WarnFeatures[i].properties.name;
						}
					}
				}
				// 预警时定位点的style为特殊式样
				locateStyleWarn = true;
				// 预警提醒
				if(WarnType != OldWarnType){
					switch (WarnType){
						case '1':
							alert('危险系数低[' + WarnName + ']!');
							break;
						case '2':
							alert('危险系数中等[' + WarnName + ']!');
							break;
						case '3':
							alert('危险系数高[' + WarnName + ']!');
							break;
						case '4':
							alert('禁止入内，请立即退出[' + WarnName + ']!');
							// 需要报警给后台
							break;
					}
					OldWarnType = WarnType;
				}				
			}else {
				locateStyleWarn = false;
				OldWarnType = null;
			}

		}
	}); 	
}

// 点选-高亮+属性
function loadselectSingleClick(){
	var selectInfo;   //点击poi 的详细信息
	var selectName;   //点击poi 的详细信息
	var coordinate;	//点击poi 的坐标
	var selectId;   //点击poi 的形状id
	selectSingleClick = new ol.interaction.Select({
		layers: [selectSingleClickLayter,RouteStartLayer,RouteDestLayer],
		style: selectSingleClickStyle,
	});
	var selectedFeatures = selectSingleClick.getFeatures();	
	selectSingleClick.on('change:active', function() {
		selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
	});
	map.addInteraction(selectSingleClick);
	selectSingleClick.on('select', function(e) {
		selectInfo = e.selected[0].values_;

		if (selectInfo.sfloor != undefined){
			// alert('选中起点');
			setFloorAndCenter(selectInfo.sfloor,sourceLabelX,sourceLabelY);
			selectSingleClick.setActive(false);
			selectSingleClick.setActive(true);
		}else if(selectInfo.efloor != undefined){
			// alert('选中终点');
			setFloorAndCenter(selectInfo.efloor,targetLabelX,targetLabelY);
			selectSingleClick.setActive(false);
			selectSingleClick.setActive(true);
		}else{
			// alert('选中poi');
			selectName = selectInfo.name;
			selectId = selectInfo.fid;
			var geom = selectInfo.geometry;
			var geomtype = geom.getType();
			if (geomtype == 'Polygon'){
				coordinate = geom.getInteriorPoint().getCoordinates();
			}else if (geomtype == 'Point'){
				coordinate = geom.getCoordinates();
			}
			HighlightElementContent.innerHTML = selectName;
			HighlightOverlay.setPosition(coordinate);		
			// 清除路径规划
			clearPath();				
		}

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
	// 搜周边
	HighlightElementSearch.onclick = function (){
		// 周边检索
	}
	// 从这走
	HighlightElementFrom.onclick = function (){
		// 打开路径规划功能
		pathPlanningMain();
		// 设置起点为选中的点
		clearStartLabel();
		LabelAction = 'startLabel';
		document.getElementById('label-start').value = selectName;
		setlabelOnClick(LabelAction,coordinate,selectInfo.floor_id);
		// 地图点选终点
		getEndLabelOnMap();
	}
	// 去这里
	HighlightElementTo.onclick = function (){
		removeSelectSingleClick();
		// 打开路径规划功能
		pathPlanningMain();
		// 设置终点为选中的点，自动规划完路线
		LabelAction = 'endLabel';
		document.getElementById('label-end').value = selectName;
		setlabelOnClick(LabelAction,coordinate,selectInfo.floor_id);
	}
}
	
// 关闭 selectSingleClick 点选
function removeSelectSingleClick(){
	HighlightOverlay.setPosition(null);
	map.removeInteraction(selectSingleClick);	
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
	var floorSelectId = e.innerText.substr(1,2);
	// console.log(floorSelectId);
	if ( floorSelectId != floorid){
		floorUpdate(floorSelectId);
	}

}
// 切换楼层
function floorUpdate(newfloorId){
	// 取点击的楼层 赋值给floor_id   第二个字符后两位
	floorid = newfloorId;	
	$(".floorshow a").text('F' + newfloorId);
	// 刷新图层（背景，道路，poi 其他清空）
	loadBasemap();	

	// 刷新电子围栏
	if(!electronicLayerOff){
		electronicLayerOff = true;
		electronicFence();
		// 增删改都关闭
		
	}	
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
		// backPathPlan();  // 清除 路径规划  & 刷新 点选
		if(RouteLayer != null && RouteLayer != undefined){
			if(RouteSourceFloor == RouteTargetFloor/* 非跨楼层*/ ){
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
				setRouteStyleWithFloor();
				//RouteLayer.setStyle();
			}
		}
		
	}
	// 清除点选 再增加点选（刷新）
	// removeSelectSingleClick();
	// loadselectSingleClick();		
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

