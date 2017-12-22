/*DATA*/
var shapeBackgrounds ={};
var shapePolygons ={};
var shapePOIs ={};
/*Entities*/
// Background
var shapeBackground;
// Polygon
var shapeWall = [],shapeWallNum = 0; // 
var shapeDesk = [],shapeDeskNum = 0; // 
// POI
var shapePoiAll = [],shapePoiAllNum = 0;
var shapeLabel = [],shapeLabelNum = 0;
var shapeBillboard = [],shapeBillboardNum = 0;
// Locate
var shapeLocate;

function setEntitiesBackground(shapeBackground){
	shapeBackground = viewer.entities.add({  
		name : shapeBackground[3],  
		polygon : {  
			hierarchy : Cesium.Cartesian3.fromDegreesArray(shapeBackground[2]),
			height: shapeBackground[1],// 拉伸高度！
			extrudedHeight: shapeBackground[0], //高度！
			//perPositionHeight : true,  //指定使用每个坐标自带的高度！
			material : Cesium.Color.LIGHTSTEELBLUE,  
			//outline : true,  
			//outlineColor : Cesium.Color.BLACK  
		}  
	});
	viewer.zoomTo(shapeBackground);
}
function setEntitiesPolygon(shapePolygon){
	var allFeature = Object.keys(shapePolygon)

	for (var i=0;i<allFeature.length;i++){
		var featureID = allFeature[i];
		for (var j=0;j<shapePolygon[featureID].length;j++){
			switch (shapeFeature[featureID]){
			case 'wall':
			   shapeWall[shapeWallNum++] = viewer.entities.add({  
			        name : shapePolygon[featureID][j][3],  
			        wall : {
						 positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
								 shapePolygon[featureID][j][2]),  
						 fill: true,
			             material : Cesium.Color.WHITE,  
						 minimumHeights : shapePolygon[featureID][j][1], //  下高
						 //maximumHeights : shapePolygon[featureID][j][1], //  上高
			         }  
			     });
			   break;
			case 'desk':
				shapeDesk[shapeDeskNum++] = viewer.entities.add({  
					name : shapePolygon[featureID][j][3],  
					polygon : {  
						hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(
								shapePolygon[featureID][j][2]),
						//height: shapePolygon[featureID][j][0],// 拉伸高度！
						extrudedHeight: shapePolygon[featureID][j][0], //基础高度！
						perPositionHeight : true,  //指定使用每个坐标自带的高度！
						material : Cesium.Color.CORNSILK, //Cesium.Color.CORNSILK.withAlpha(0.5)
					}  
				});
				break;
/*			case 'wall':
			*/	
			default:
				break;
			}
		}
	}	
}
function setEntitiesPOI(shapePOI){
	var allFeature = Object.keys(shapePOI)

	for (var i=0;i<allFeature.length;i++){
		var featureID = allFeature[i];
		for (var j=0;j<shapePOI[featureID].length;j++){
			switch (shapeFeature[featureID]){
			case 'POIall':
				shapePoiAll[shapePoiAllNum++] = viewer.entities.add( {  
				    name : shapePOI[featureID][j][1],  
				    position : Cesium.Cartesian3.fromDegrees(shapePOI[featureID][j][0][0],shapePOI[featureID][j][0][1],shapePOI[featureID][j][0][2]),   
				    label : { //文字标签  
				        text : shapePOI[featureID][j][1],  
				        font : '16pt sans-serif',  
				        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
				        fillColor : Cesium.Color.BLACK,
				        outlineColor : Cesium.Color.TRANSPARENT,
				        outlineWidth : 1,  
				        //horizontalOrigin : ,
				        //verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
				        pixelOffset : new Cesium.Cartesian2( 36, -2 ),   //偏移量  
				        
				    },  
				    billboard : { //图标  
				        image : './icon/' + shapeIcon[featureID]+ '.png',  
				        width : 26,  
				        height : 26  
				    },  
				} );  
			   break;
			case 'label':
				shapeLabel[shapeLabelNum++] = viewer.entities.add( {  
				    name : shapePOI[featureID][j][1],  
				    position : Cesium.Cartesian3.fromDegrees(shapePOI[featureID][j][0][0],shapePOI[featureID][j][0][1],shapePOI[featureID][j][0][2]),   
				    label : { //文字标签  
				        text : shapePOI[featureID][j][1],  
				        font : '12pt sans-serif',  
				        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
				        fillColor : Cesium.Color.BLACK,
				        outlineColor : Cesium.Color.TRANSPARENT,
				        outlineWidth : 1,  
				        //horizontalOrigin : ,
				        //verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
				        //pixelOffset : new Cesium.Cartesian2( 36, -2 ),   //偏移量  
				        
				    },   
				} ); 
				break;
			case 'billboard':
				shapeBillboard[shapeBillboardNum++] = viewer.entities.add( {  
				    name : shapePOI[featureID][j][1],  
				    position : Cesium.Cartesian3.fromDegrees(shapePOI[featureID][j][0][0],shapePOI[featureID][j][0][1],shapePOI[featureID][j][0][2]),   
				    billboard : { //图标  
				        image : './icon/' + shapeIcon[featureID]+ '.png',  
				        width : 26,  
				        height : 26  
				    },  
				} );  	
			default:
				break;
			}
		}
	}	
}

function setEntitiesLocate(){
	shapeBackground = viewer.entities.add({  
		name : 'locate',  
		position : Cesium.Cartesian3.fromDegrees(locate),
	    point : { 
	        pixelSize : 5,  
	        color : Cesium.Color.BLUE,  
	        outlineColor : Cesium.Color.WHITE,  
	        outlineWidth : 2  
	    },   
	});
}

/*// polygon填充色
var shapeColor = {
	'999999': wall  0.2,
	'10020511'  wall : 2.6,
	'10030501'  wall : 2.5,
	'10030504'  wall : 2.5,
	'10030502'  wall : 2.5,
	'10030602'  wall : 2.5,
	'10030505'  desk : 1.0,
};*/

//polygon拉伸高度（米）
var shapeHeight = {
		// polygon
	'999999':/* wall */ 0.2,
	'10020511' /* wall */: 2.6,
	'10030501' /* wall */: 2.5,
	'10030504' /* wall */: 2.5,
	'10030502' /* wall */: 2.5,
	'10030602' /* wall */: 2.5,
	'10030505' /* desk */: 1.0,
		// point
	'30050100' /*billboard*/: 2,
	'30050200' /*billboard*/: 1.5,
	'30050300' /*billboard*/: 0.5,
	//'30050800' /*billboard*/: 1,
	'30060000' /*POIall*/: 2.5,
	'30060100' /*billboard*/: 0.5,
	'30060200' /*billboard*/: 0.5,
	'30060300' /*label*/: 2,
};
// feature ==>> shape feature
var shapeFeature = {
		// polygon
	'10020511' /*公司*/: 'wall',
	'10030501' /*单间*/: 'wall',
	'10030504' /*单间*/: 'wall',
	'10030502' /*单间*/: 'wall',
	'10030602' /*单间*/: 'wall',
	'10030505' /*实物*/: 'desk',
		// point
	'30050100' /*wc*/: 'billboard',
	'30050200' /*楼梯*/: 'billboard',
	'30050300' /*电梯*/: 'billboard',
	//'30050800' /*大门*/: 'billboard',
	'30060000' /*公司名*/: 'POIall',
	'30060100' /*椅子*/: 'billboard',
	'30060200' /*椅子*/: 'billboard',
	'30060300' /*办公区*/: 'label',
	
};
// ICON 
var shapeIcon = {
		'30050100' /*wc*/: 'wc',
		'30050200' /*楼梯*/: 'stair',
		'30050300' /*电梯*/: 'elevator',
		'30050800' /*大门*/: 'door',
		'30060000' /*公司名*/: 'LOGO2',
		'30060100' /*椅子*/: 'chair_right',
		'30060200' /*椅子*/: 'chair_left',
				
}