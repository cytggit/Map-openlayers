function loadTable(){
	placecheck.onchange = function(){
		placeType = placecheck.value;
		switch(placeType){
			case 'null':
				placeid = '0';
				$("#tabel-key").html("");
				break;
			case 'mote':
				placeid = '2';
				view.setCenter(motecenter);
				// 显示电子围栏
				electronicFence();
				break;
			case 'zhongbei':
				placeid = '3';
				view.setCenter(zhongbeicenter);
				// 显示电子围栏
				electronicFence();
				break;
			case 'minhang':
				placeid = '4';
				view.setCenter(minhangcenter);
				// 显示电子围栏
				electronicFence();
				break;
			case 'zhanlan':
				placeid = '5';
				view.setCenter(zhanlancenter);
				// 显示电子围栏
				electronicFence();
				break;
		}
		// 当编辑打开时，判断之前的编辑操作是否需要保存
		if(drawFlag){
			checkDrawData();
			drawtype = null;
		}
		// 根据background的floor动态生成楼层选择框
		getFloorList();
		// 刷新图层
		Refreshlayer();
	}
		
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
		},
		setActive: function(active) {
			this['apinfo'].setActive(active);
		}
	};
	DeleteFeature.init();	
}


// 绘制MAIN
function Updatedraw(drawinfo){
	if(placeType == 'null'){
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
			break;
		case 'deletedata': 
			DeleteFeature.setActive(false);
			break;
	}			
	// 保存上一次的编辑
	if(FeatureDummy.length != 0){
		// 弹出是否保存
		if(confirm("有未保存的编辑，是否需要保存？")){
			SaveData();
		}else{
			FeatureDummy = [];
			Refreshlayer();
			alert('已清除未保存的编辑！');
		}
	}	
}

// 新增
function addData(){
	DrawFeature.setActive(true);
	// 判断编辑的表
	newdrawNum=0;
	DrawFeature['apinfo'].on('drawend',
		function(evt) {
			var newCoordinates = [];
			var oldCoordinates;
			
			newFeature = new ol.Feature();
			newFeature.setId(placeType + newdrawNum);
			newFeature.setGeometryName('geom');	
			newFeature.set('geom', null);
			
				oldCoordinates = evt.feature.values_.geom.getCoordinates();
				var Coordinates = [oldCoordinates[1],oldCoordinates[0]];
				newFeature.setGeometry(new ol.geom.Point(Coordinates));

		}, this);			
}
function getcolumn(){
	if ( newFeature != null ){
					newFeature.set('place_id', placeid);
					newFeature.set('floor_id', floorid);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
		
	}else {
		alert('请先编辑形状');
	}
}

// 修改
function updata(){
	ModifyFeature.setActive(true);
	// 选中时获取要素信息，加载到输入框中
	ModifyFeature['apinfo'].on('select',
		function(evt){
			var selectInfo = evt.target.getFeatures().getArray()[0].values_;
		},this);
	
	newdrawNum =0;
	var modifyIdInfo = [];
	ModifyFeature['apinfomodify'].on('modifyend',
		function(evt) {
			var modifyId = evt.features.getArray()[0].id_;
			var modifyInfo = evt.features.getArray()[0].values_;
			
			var newCoordinates = [];
			var oldCoordinates;
			
			newFeature = new ol.Feature();
			newFeature.setId(modifyId);
			newFeature.setGeometryName('geom');	
			newFeature.set('geom', null);	

			
				oldCoordinates = modifyInfo.geometry.getCoordinates();
				var Coordinates = [oldCoordinates[1],oldCoordinates[0]];
				newFeature.setGeometry(new ol.geom.Point(Coordinates));
			
		}, this);			
}

// 删除
function deletedata(){
	DeleteFeature.setActive(true);
	DeleteFeature['apinfo'].on('select',
		function(evt) {
			if(evt.target.getFeatures().getArray().length != 0) {  
				var selectInfo = evt.target.getFeatures().getArray()[0].values_;
				//setcolumn(selectInfo);
				// 弹出是否删除
				if(confirm("确认删除？")){
					var selectId = evt.target.getFeatures().getArray()[0].id_;
					
					var Coordinates = selectInfo.geometry.getCoordinates()[0];
					var CoordinatesLength = Coordinates.length;
					
					var newCoordinates = [];
					var oldCoordinates;
					for (var i=0;i<CoordinatesLength;i++){
						oldCoordinates = Coordinates[i];
						newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
					}
	
					newFeature = new ol.Feature();
					newFeature.setId(selectId);
					newFeature.setGeometryName('geom');	
					newFeature.set('geom', null);		
					newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));							
					
					updateNewFeature([newFeature],'apinfo','remove');
					alert('删除要素成功！');	
					newFeature =  null;
					Refreshlayer();
					
				}else{
					alert('取消要素删除！');
				}		
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
					case ':apinfo':
						electronicLayer.getSource().addFeatures(features);
						break;
				}
			}
		}); 		
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

	// 刷新电子围栏
	if(!electronicLayerOff){
		electronicLayerOff = true;
		electronicFence();
	}		
}
