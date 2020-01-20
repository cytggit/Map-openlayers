// 判断是否已收藏
function checkCollection(){
	CollectionId = $("#gps_lid").val();
	var CollectionRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':poi_collection',
		outputFormat: 'application/json',
		cql_filter: "user_id=" + userId + " and poi_id='" + CollectionId + "'"
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(CollectionRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var featuresNum = response.features.length;
			if (featuresNum == 0) {
				$("#collection").attr("onClick","addCollectionPoi();");
				$(".collection img").attr("src","images/u62.png");
				$(".collection span").html("收藏");
			}else {
				var CollectionFid = response.features[0].id;
				$("#collection").attr("onClick","rmCollectionPoi('"+CollectionFid+"');");
				$(".collection img").attr("src","images/u62_1.png");
				$(".collection span").html("取消收藏");
			}
		}
	}); 	
}

function addCollectionPoi(){
	var lon = parseFloat($("#gps_x").val());
	var lat = parseFloat($("#gps_y").val());
	var coordinate = [lon,lat];
	var featureType = 'poi_collection';
	var newFeature = new ol.Feature();
	newFeature.setId('poi_collection.'  + deviceId);
	newFeature.setGeometryName('geom');	
	newFeature.set('geom', null);
	newFeature.set('poi_id', CollectionId);
	newFeature.set('l_id', deviceId);
	newFeature.set('user_id', userId);
	newFeature.set('place_id', placeid);
	newFeature.set('building_id', buildingid);
	newFeature.set('floor_id', floorid);
	newFeature.setGeometry(new ol.geom.Point([coordinate[1],coordinate[0]]));
	updateNewFeature([newFeature],featureType,'insert');
	// 更新搜索详情的收藏按钮
	checkCollection();
	// 更新收藏poi的layer
	collectionoff = true;
	collectionPoi();
	alert('收藏成功！');
}

function rmCollectionPoi(CollectionFid){
	console.log(CollectionFid);
	var lon = parseFloat($("#gps_x").val());
	var lat = parseFloat($("#gps_y").val());
	var coordinate = [lon,lat];
	var featureType = 'poi_collection';
	var newFeature = new ol.Feature();
	newFeature.setId(CollectionFid);
	newFeature.setGeometryName('geom');	
	newFeature.set('geom', null);		
	newFeature.setGeometry(new ol.geom.Polygon([coordinate]));								
	updateNewFeature([newFeature],featureType,'remove');
	// 更新搜索详情的收藏按钮
	checkCollection();
	// 更新收藏poi的layer
	collectionoff = true;
	collectionPoi();
}

// 显示收藏
function collectionPoi(){
	collectionSource.clear();
	if (collectionoff) {
		var CollectionParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + ':poi_collection',
			outputFormat: 'application/json',
			cql_filter: 'user_id=' + userId + ' and place_id=' + placeid + ' and floor_id=\'' + floorid + '\''
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(CollectionParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				collectionSource.addFeatures(features);
			}
		}); 	
		collectionoff = false;
		$(".showCollection img").attr("src","./icon/uncollection.png");
	}else {
		collectionoff = true;
		$(".showCollection img").attr("src","./icon/collection.png");
	}
}
