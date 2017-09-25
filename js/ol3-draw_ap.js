

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

function loadTable(){
		switch(placeid){
			case '0':
				$("#tabel-key").html("");
				break;
			case '2':
				view.setCenter(motecenter);
				// 显示电子围栏
				electronicFence();
				break;
			case '3':
				view.setCenter(zhongbeicenter);
				// 显示电子围栏
				electronicFence();
				break;
			case '4':
				view.setCenter(minhangcenter);
				// 显示电子围栏
				electronicFence();
				break;
			case '5':
				view.setCenter(zhanlancenter);
				// 显示电子围栏
				electronicFence();
				break;
		}
		// 当编辑打开时，判断之前的编辑操作是否需要保存
		// if(drawFlag){
			// checkDrawData();
			// drawtype = null;
		// }
		// 根据background的floor动态生成楼层选择框
		getFloorList();
		// 刷新图层
		Refreshlayer();
		
}

function initdraw(){
	DrawFeature = {
		init: function() {
			map.addInteraction(this.apinfo);
			this.apinfo.setActive(false);
		},
		apinfo: new ol.interaction.Draw({
			source: electronicLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('Point'),
			geometryName: 'geom'
		}),
		setActive: function(active) {
			this['apinfo'].setActive(active);
		}		
	};
	DrawFeature.init(); 
	
	ModifyFeature = {
		init: function() {
			this.apinfo = new ol.interaction.Select({
				layers: [electronicLayer]
			}); 
			
			this.apinfomodify = new ol.interaction.Modify({
				features: this.apinfo.getFeatures()
			});
			
			map.addInteraction(this.apinfo);	
			
			map.addInteraction(this.apinfomodify);
			
			this.apinfo.setActive(false);	
			
			this.apinfomodify.setActive(false);		
			
			this.setEvents();
		},
		setEvents: function() {
			var selectedFeatures = this.apinfo.getFeatures();
		
			this.apinfo.on('change:active', function() {
				selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
			});
		},
		setActive: function(active) {
			this['apinfo'].setActive(active);
			this['apinfomodify'].setActive(active);
		}
	};
	ModifyFeature.init();	
	
	DeleteFeature = {
		init: function() {
			
			this.apinfo = new ol.interaction.Select({
				layers: [electronicLayer]
			}); 
			
			map.addInteraction(this.apinfo);
			
			this.apinfo.setActive(false);	
			this.setEvents();			
		},
		setEvents: function() {
			var selectedFeatures = this.apinfo.getFeatures();
		
			this.apinfo.on('change:active', function() {
				selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
			});
		},
		setActive: function(active) {
			this['apinfo'].setActive(active);
		}
	};
	DeleteFeature.init();	
}


// 绘制MAIN
function Updatedraw(drawinfo){
	if(placeid == '0'){
		alert('请选择待编辑的区域');
	}else{
		drawFlag = true;
		var newDrawtype = drawinfo.id;
		//本次编辑和上次不同
		if (drawtype != newDrawtype ){
			// 关闭上一次的编辑并判断之前的编辑操作（draw or modify）是否需要保存
			checkDrawData();
	
			switch (newDrawtype) {  
				case 'addData': 
					console.log(drawinfo.innerText);
					addData();
					break;
				case 'updata': 
					console.log(drawinfo.innerText);
					updata();
					$(".avgLevel").attr("style"," display: block;"); 
					break;
				case 'deletedata': 
					console.log(drawinfo.innerText);
					deletedata();
					break;
			}		
			drawtype = newDrawtype;
		}		
	}
}	
// 判断之前的编辑操作（draw or modify）是否需要保存
function checkDrawData(){	
	// 关闭上一次的编辑
	switch (drawtype) {  
		case 'addData': 
			DrawFeature.setActive(false);
			break;
		case 'updata': 
			ModifyFeature.setActive(false);
			$(".avgLevel").attr("style"," display: none;"); 
			break;
		case 'deletedata': 
			DeleteFeature.setActive(false);
			break;
	}			
	// 保存上一次的编辑
	// if(FeatureDummy.length != 0){
		// // 弹出是否保存
		// if(confirm("有未保存的编辑，是否需要保存？")){
			// SaveData();
		// }else{
			// FeatureDummy = [];
			// Refreshlayer();
			// alert('已清除未保存的编辑！');
		// }
	// }	
}

// 新增
function addData(){
	DrawFeature.setActive(true);
	// 判断编辑的表
	newdrawNum=0;
	DrawFeature['apinfo'].on('drawend',
		function(evt) {

			var oldCoordinates = evt.feature.values_.geom.getCoordinates();

				window.android.addPoint(oldCoordinates[0],oldCoordinates[1], floorid);

		}, this);			
}

// 修改
function updata(){
	ModifyFeature.setActive(true);
	
	ModifyFeature['apinfo'].on('select',
		function(evt) {
			if(evt.target.getFeatures().getArray().length != 0) {  
				var selectInfo = evt.target.getFeatures().getArray()[0].values_;
				document.getElementById('avgLevel_value').value = selectInfo.avgLevel;
				
			}
		}, this);		

	ModifyFeature['apinfomodify'].on('modifyend',
		function(evt) {

			var modifyInfo = evt.features.getArray()[0].values_;

			var featureMac = modifyInfo.mac;

			var oldCoordinates = modifyInfo.geometry.getCoordinates();
			var avgLevel = document.getElementById('avgLevel_value').value;
			
			if(avgLevel != undefined && avgLevel != ''){
				$.ajax({  
					url: UpdAPUrl,
					data: {'mac':featureMac,'avgLevel':avgLevel,'lat':oldCoordinates[1],'lon':oldCoordinates[0]}, 
					type: 'GET',
					dataType: 'json',
					success: function(response){
						if(response.ret == '1'){
							alert('修改成功~');
							ModifyFeature.setActive(false);
							ModifyFeature.setActive(true);
							document.getElementById('avgLevel_value').value = '';
							RefreshAPlayer();
						}
			
					}
				})				
			}else{
				alert('请输入平均场强~');
			}

			
		}, this);			
}
// 清空输入框的值
function clear_column(e){
	var columnName = e.id;
	switch (columnName){
		case 'clear_avgLevel':
			document.getElementById('avgLevel_value').value = '';	
			break;
	}		
}


// 删除
function deletedata(){
	DeleteFeature.setActive(true);
	DeleteFeature['apinfo'].on('select',
		function(evt) {
			if(evt.target.getFeatures().getArray().length != 0) {  
				var selectInfo = evt.target.getFeatures().getArray()[0].values_;

				// 弹出是否删除
				if(confirm("确认删除？")){
					var featureMac = selectInfo.mac;
					
					var oldCoordinates = selectInfo.geometry.getCoordinates();
					$.ajax({  
						url: DltAPUrl,
						data: {'mac':featureMac}, 
						type: 'GET',
						dataType: 'json',
						success: function(response){
							if(response.ret == '1'){
								alert('删除成功~');
							}
							RefreshAPlayer();

						}
					})

				}else{
					alert('取消要素删除！');
				}	
				DeleteFeature.setActive(false);
				DeleteFeature.setActive(true);				
			}			
		}, this);			
}

// 保存编辑
function SaveData(){
	// request修改为获取下拉框的表名
	switch (drawtype) {  
		case 'addData': 
			updateNewFeature(FeatureDummy,'apinfo','insert');
			alert('新增数据成功！');	
			break;
		case 'updata': 
			updateNewFeature(FeatureDummy,'apinfo','update');
			alert('修改数据成功！');	
			break;
	}	
	FeatureDummy = [];
	Refreshlayer();
}
// 关闭编辑
function stopdraw(){
	// 判断是否已保存
	if(drawFlag){
		checkDrawData();	
		// 编辑的Flag初始化
		drawtype = null;
		drawFlag = false;
	}
}

// 显示电子围栏
function electronicFence(){
	electronicLayer.getSource().clear();
	if (electronicLayerOff) {
		getdrawLayer(':apinfo');
		electronicLayerOff = false;
	}else {
		electronicLayerOff = true;
	}	
}
function getdrawLayer(dbtype){
	if(dbtype == ':apinfo'){
		$.ajax({  
			url: APUrl,
			data: {'placeId':placeid,'floorId':parseInt(floorid)}, 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				if(response.length > 0){
					var APFeatures = [];
					for(var num = 0; num < response.length ; num++){
						APFeatures[num] = new ol.Feature({
							geometry: new ol.geom.Point([response[num].lon,response[num].lat])
						});
						APFeatures[num].set('mode',response[num].mode);
						APFeatures[num].set('avgLevel',response[num].avgLevel);
						APFeatures[num].set('mac',response[num].mac);
						
					}
					electronicLayer.getSource().addFeatures(APFeatures);	
				}
	
			}
		})
	}else{
		var drawParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + dbtype, // 电子围栏图层
			outputFormat: 'application/json',
			cql_filter: 'place_id=' + placeid + ' and floor_id=\'' + floorid + '\''
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(drawParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				switch(dbtype){
					case ':polygon_background':
						backgroundLayer.getSource().addFeatures(features);
						break;
					case ':polygon':
						polygonLayer.getSource().addFeatures(features);
						break;
					case ':polyline':
						roadLayer.getSource().addFeatures(features);
						break;
					case ':point':
						pointLayer.getSource().addFeatures(features);
						break;
				}
			}
		}); 	
	}
	
}

// 刷新图层 背景，道路，poi
function Refreshlayer(){
	// viewParam = 'place_id:' + placeid + ';floor_id:' + floorid;
	// WFS
	backgroundLayer.getSource().clear();
	getdrawLayer(':polygon_background');
	polygonLayer.getSource().clear();
	getdrawLayer(':polygon');
	roadLayer.getSource().clear();
	getdrawLayer(':polyline');
	pointLayer.getSource().clear();
	getdrawLayer(':point');
	RefreshAPlayer();
}

function RefreshAPlayer(){
	electronicLayer.getSource().clear();
	getdrawLayer(':apinfo');
}

// 加载楼层条
function getFloorList(){
	var FloorTag = [];
	var FloorId = [];
	var GetFloorParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':polygon_background ', // 
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
			changeFloorAction();
		}
	}); 	
}

// 更改楼层条高亮
function changeFloorAction(){
	var floorLength = document.getElementsByClassName('floorS').length;
	for (var i =0; i< floorLength; i++){
		document.getElementsByClassName('floorS')[i].classList.remove('active');
	}
	if(document.getElementsByClassName(floorid)[0] != null ){
		document.getElementsByClassName(floorid)[0].classList.add('active');
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
	var floorSelectId = e.innerText.substr(1,2);
	if ( floorSelectId != floorid){
		floorUpdate(floorSelectId);
	}

}
// 切换楼层
function floorUpdate(newfloorId){
	// 取点击的楼层 赋值给floor_id   第二个字符后两位
	floorid = newfloorId;	
	// 刷新图层（背景，道路，poi 其他清空）
	Refreshlayer();	

}

// 控制定位开关
function locateCtrl(locateflag){
	if(locateflag == '1'){
		startlocation();			
	}else{
		clearTimeout(locateTimeout);
	}
}


// 获取定位信息
function getlocation(){	
	// 从位置服务器获取定位信息
	$.ajax({
		url: locateCertainUrl,
		data: {'floor_id':floorid,'place_id':placeid}, 
		type: 'GET',
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'successCallBack',
		success: function(response){
			var features = new ol.format.GeoJSON().readFeatures(response);
			
			// console.log(featureOBJ[0].properties.floor_id);
			center_wfs.clear();
			center_wfs.addFeatures(features);
			
		}		
	});
}

// 获取实时定位信息
function startlocation(){  
	locateTimeout = setTimeout(startlocation,1000);  
	getlocation();
}