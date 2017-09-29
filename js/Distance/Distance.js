// 测距
// 开始测距
function startLength(){
	// 关闭高亮
	removeSelectSingleClick();
	// 关闭路径规划
	if (!pathPlanningOFF){
		clearPath();
	}	
	// 关闭电子围栏编辑
	electronicFenceDrawOFF();
	
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
