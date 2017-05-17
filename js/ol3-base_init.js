	var viewParam = 'place_id:' + placeid + ';floor_id:' + floorid;
	// 2D
	// var backgroundFilter = 'place_id=2 and floor_id=22 and feature_id=999999';
	// var backgroundTypename = 'wanhuayuan:mote_background';
	// var backgroundLayer = new ol.layer.Vector({
		// title: 'background map',
		// visible: true,
		// source: new ol.source.Vector({
			// features:  new ol.format.GeoJSON().readFeatures(geojsonObject(backgroundFilter,backgroundTypename))
		// }),
		// style: geojsonstylefunction,
		// maxResolution: 0.00001
	// });
	// 3D
	var backgroundLayer = new ol.layer.Tile({
		title: 'background map',
		visible: true,
		source: new ol.source.TileWMS({
			url: wmsUrl,
			params: {LAYERS: DBs + ':mote_background',version:'1.1.0',viewparams:viewParam}
		}),
		zIndex: 0
	});	
	
	// 2D
	// var polygonFilter =  'place_id='+ placeid + 'and floor_id='+ floorid ;
	var polygonTypename = DBs + ':mote_polygon';
	var polygonLayer = new ol.layer.Vector({
		title: 'polygon map',
		visible: true,
		source: new ol.source.Vector({
			features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,polygonTypename))
		}),
		style: geojsonstylefunction,
		maxResolution: 0.00001,
		zIndex: 10
	});
	// 3D
	// var polygonLayer = new ol.layer.Tile({
		// title: 'detail map',
		// visible: true,
		// source: new ol.source.TileWMS({
			// url: 'http://192.168.1.126:8088/geoserver/wanhuayuan/wms',
			// params: {LAYERS:polygonTypename,version:'1.1.0',viewparams:viewParam}
		// }),
		// zIndex: 10
	// });
	
	// var pointFilter =  'place_id='+ placeid + 'and floor_id='+ floorid ;
	var pointTypename = DBs + ':mote_point';
	var pointLayer = new ol.layer.Vector({
		title: 'point map',
		visible: true,
		source: new ol.source.Vector({
			features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename))
		}),
		style: geojsonstylefunction,
		maxResolution: 0.000003,
		zIndex: 30
	});
	var selectSingleClickLayter = new ol.layer.Vector({
		title: 'point map',
		visible: true,
		source: new ol.source.Vector({
			features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename))
		}),
		style: selectSingleClickStyle,
		maxResolution: 0.000003,
		zIndex: 5
	});
	
	// 定位图层 			
	var center_wfs = new ol.source.Vector();
	var LocationLayer = new ol.layer.Vector({
		title: 'center point',
		visible: true,
		zIndex: 60
	});	
	
	// 检索图层 	
	var select_wfs = new ol.source.Vector();
	var selectLayer = new ol.layer.Vector({
		title: 'select map',
		visible: true,
		zIndex: 50
	});
	
	// 电子围栏图层 	
	var electronicLayer = new ol.layer.Vector({
		title: 'electronicFence map',
		visible: true,
		style: electronicFenceStyleFun,
		source: new ol.source.Vector(),
		zIndex: 80
	});		
	
	// 收藏图层 	
	var collectionLayer = new ol.layer.Vector({
		title: 'collection map',
		visible: true,
		style: collectionStyle,
		source: new ol.source.Vector(),
		zIndex: 40
	});	
	
	// 测距
	var drawlayer = new ol.layer.Vector({
		title: 'drawlayer',
		source: new ol.source.Vector(),
		style: drawstyle,
		zIndex: 70
	});
	var drawpointlayer = new ol.layer.Vector({
		title: 'drawpointlayer',
		source: new ol.source.Vector(),
		style: drawpointstyle,
		zIndex: 70
	});
	
	// 热力图
	var heatmapLayer = new ol.layer.Heatmap({
		title: 'heat map',
		visible: true,
		source: new ol.source.Vector(),
		blur: 15,
		radius: 5,
		zIndex: 100
	});	
	
	// 信息框 overlay	
	var HighlightElement = document.createElement('div');
	HighlightElement.className = 'ol-popup';
	
	var HighlightElementCloser = document.createElement('a');
	HighlightElementCloser.className = 'ol-popup-closer';
	HighlightElementCloser.href = '#';
	
	var HighlightElementContent = document.createElement('div');
	
	var HighlightElementCollection = document.createElement('input');
	HighlightElementCollection.setAttribute('type', 'button');
	HighlightElementCollection.className = 'ol-popup-collection';
	HighlightElementCollection.value = '收藏';
	
	HighlightElement.appendChild(HighlightElementCloser);	
	HighlightElement.appendChild(HighlightElementContent);	
	HighlightElement.appendChild(HighlightElementCollection);	
	
	var HighlightOverlay = new ol.Overlay({
		element: HighlightElement,
		offset: [0, -15],
		positioning: 'bottom-center'		
	}); 	
	
	// 普通模式下选择  interaction   
	var selectSingleClick; 
	
	
	
	
	