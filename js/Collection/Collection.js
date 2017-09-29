// 判断是否已收藏
function checkCollection(selectId,coordinate){
	var CollectionRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':poi_collection', // 定位点图层
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
				updateNewFeature([newFeature],featureType,'insert');
				collectionoff = true;
				alert('收藏成功！');
			}else {
				alert('已收藏过！');
			}
		}
	}); 	
}

// 显示收藏
function collectionPoi(){
	collectionLayer.getSource().clear();
	if (collectionoff) {
		var CollectionParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + ':poi_collection', // 定位点图层
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
