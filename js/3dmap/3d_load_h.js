/*DATA*/
var shapeBackgrounds ={};
var shapePolygons ={};
var shapePOIs ={};
var shapeLocates = {};
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
var shapeLocate = [];var gltfModel=[];

function setEntitiesBackground(shapeData){
	if(shapeData != undefined){
		shapeBackground = viewer.entities.add({  
			name : shapeData[3],  
			polygon : {  
				hierarchy : Cesium.Cartesian3.fromDegreesArray(shapeData[2]),
				height: shapeData[1],// 拉伸高度！
				extrudedHeight: shapeData[0], //高度！
				//perPositionHeight : true,  //指定使用每个坐标自带的高度！
				material : Cesium.Color.LIGHTSTEELBLUE,  
				//outline : true,  
				//outlineColor : Cesium.Color.BLACK  
			}  
		});
		viewer.zoomTo(shapeBackground);
	}
}
function setEntitiesPolygon(shapeData){
	if(shapeData != undefined){
		var allFeature = Object.keys(shapeData)
		shapeWall = [];shapeWallNum = 0;
		shapeDesk = [];shapeDeskNum = 0;
		for (var i=0;i<allFeature.length;i++){
			var featureID = allFeature[i];
			for (var j=0;j<shapeData[featureID].length;j++){
				switch (shapeFeature[featureID]){
				case 'wall':
				   shapeWall[shapeWallNum++] = viewer.entities.add({ 
				        name : shapeData[featureID][j][3],  
				        wall : {
							 positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
									 shapeData[featureID][j][2]),  
							 fill: true,
				             material : Cesium.Color.WHITE,  
							 minimumHeights : shapeData[featureID][j][1], //  下高
							 //maximumHeights : shapePolygon[featureID][j][1], //  上高
				         }  
				     });
				   break;
				case 'desk':
					shapeDesk[shapeDeskNum++] = viewer.entities.add({  
						name : shapeData[featureID][j][3],  
						polygon : {  
							hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(
									shapeData[featureID][j][2]),
							//height: shapePolygon[featureID][j][0],// 拉伸高度！
							extrudedHeight: shapeData[featureID][j][0], //基础高度！
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
	
}
function setEntitiesPOI(shapeData){
	if(shapeData != undefined){
		var allFeature = Object.keys(shapeData)
		shapePoiAll = [];shapePoiAllNum = 0;
		shapeLabel = [];shapeLabelNum = 0;
		shapeBillboard = [];shapeBillboardNum = 0;
		for (var i=0;i<allFeature.length;i++){
			var featureID = allFeature[i];
			for (var j=0;j<shapeData[featureID].length;j++){
				switch (shapeFeature[featureID]){
				case 'POIall':
					shapePoiAll[shapePoiAllNum++] = viewer.entities.add( {  
					    name : shapeData[featureID][j][1],  
					    position : Cesium.Cartesian3.fromDegrees(shapeData[featureID][j][0][0],shapeData[featureID][j][0][1],shapeData[featureID][j][0][2]),   
					    label : { //文字标签  
					        text : shapeData[featureID][j][1],  
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
					    name : shapeData[featureID][j][1],  
					    position : Cesium.Cartesian3.fromDegrees(shapeData[featureID][j][0][0],shapeData[featureID][j][0][1],shapeData[featureID][j][0][2]),   
					    label : { //文字标签  
					        text : shapeData[featureID][j][1],  
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
					    name : shapeData[featureID][j][1],  
					    position : Cesium.Cartesian3.fromDegrees(shapeData[featureID][j][0][0],shapeData[featureID][j][0][1],shapeData[featureID][j][0][2]),   
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
	
}

/*var locateFlag = false;var model;
//小车旋转角度
var radian = Cesium.Math.toRadians(3.0);
// 小车的速度
var speed = 60;
//速度矢量
var speedVector = new Cesium.Cartesian3();
var scene = view.scene;
// 起始位置
var position = Cesium.Cartesian3.fromDegrees(121.42873954447407, 31.16648458225109,0);
//用于设置小车方向
var hpRoll = new Cesium.HeadingPitchRoll();
var fixedFrameTransforms =  Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west');*/

//TODO locate model 删除再加载，改为只改变坐标，顺滑移动
function setEntitiesLocate(shapeData){
	/*viewer.entities.removeById('locate');*/
	if(gltfModel.length > 0){
		for (var j=0;j<gltfModel.length;j++){
			scene.primitives.remove(gltfModel[j]);
		}
		gltfModel=[];
	}

	if(shapeData != undefined /*&& !locateFlag*/){
		/*console.log(locateFlag);*/
		/*locateFlag = true;*/
		for (var j=0;j<shapeData.length;j++){
		    //创建坐标  
			shapeLocate[j] = Cesium.Cartesian3.fromDegrees( shapeData[j][0],shapeData[j][1],shapeData[j][2] );  
		    //创建一个东（X，红色）北（Y，绿色）上（Z，蓝色）的本地坐标系统  
		    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame( shapeLocate[j] );  
		    // 改变3D模型的模型矩阵，可以用于移动物体  
		    // 物体的世界坐标 = 物体的模型坐标 * 世界矩阵  
		    gltfModel[j] = Cesium.Model.fromGltf( {//异步的加载模型  
				name : 'locate',  
		        url : 'http://map.intmote.com/map/js/Cesium/Apps/SampleData/models/CesiumMan/Cesium_Man.gltf',  
		        modelMatrix : modelMatrix, //模型矩阵  
		        scale : 1.0 //缩放  
		    } );
		    model = scene.primitives.add( gltfModel[j] );
		    Cesium.when( model.readyPromise ).then( function( model )  
		    		{  
		    		    model.activeAnimations.addAll( {//播放模型中全部动画，如果需要播放单个动画，可以调用add，传入动画id  
		    		        loop : Cesium.ModelAnimationLoop.REPEAT, //直到被移出activeAnimations，一直播放  
		    		         speedup : 1,  //加速播放  
		    		         //reverse : true  //逆序播放  
		    		    } );  
		    		} );  
	/*		shapeLocate[shapeLocateNum++] = viewer.entities.add({  
				id : 'locate',
				name : 'locate',  
				position : Cesium.Cartesian3.fromDegrees(shapeData[j][0],shapeData[j][1],shapeData[j][2]),
			    point : { 
			        pixelSize : 5,  
			        color : Cesium.Color.BLUE,  
			        outlineColor : Cesium.Color.WHITE,  
			        outlineWidth : 2  
			    },   
			    billboard : { //图标  
			        image : './icon/3d_locate.png',  
			        verticalOrigin : Cesium.VerticalOrigin.TOP,
			        //eyeOffset : Cesium.Cartesian3.UNIT_Z,
			        //alignedAxis: Cesium.Cartesian3.UNIT_X,
			        width : 30,  
			        height : 30  
			    },  
			});*/
		}
	}/*else if (shapeData != undefined && locateFlag){
		console.log(locateFlag);
		
	}*/
	
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
	'10020401'/* wall */: 2.5,
	'10020511' /* wall */: 2.6,
	'10030501' /* wall */: 2.5,
	'10030502' /* wall */: 2.5,
	'10030503' /* wall */: 2.5,
	'10030504' /* wall */: 2.5,
	'10030505' /* desk */: 1.0,
	'10030506' /* wall */: 2.5,
	'10030507' /* wall */: 2.5,
	'10030508' /* wall */: 2.5,
	'10030509' /* wall */: 2.5,
	'10030510' /* wall */: 2.5,
	'10030511' /* wall */: 2.5,
	'10030512' /* wall */: 2.5,
	'10030513' /* wall */: 2.5,
	'10030514' /* wall */: 2.5,
	'10030515' /* wall */: 2.5,
	'10030516' /* wall */: 2.5,
	'10030517' /* wall */: 2.5,
	'10030518' /* wall */: 2.5,
	'10030519' /* wall */: 2.5,
	'10030520' /* wall */: 2.5,
	'10030599' /* wall */: 2.5,
	
	'10030602' /* wall */: 2.5,
	'10030603' /* desk */: 0.3,
	'10030604' /* wall */: 2.5,
	'10030606' /* desk */: 2.0,
	'10030607' /* desk */: 2.0,
	'10030608' /* desk */: 2.0,
	'10030609' /* desk */: 2.0,
	'10030610' /* desk */: 0.4,
		// point
	'30050100' /*billboard*/: 2,
	'30050200' /*billboard*/: 1.5,
	'30050300' /*billboard*/: 2,
	//'30050800' /*billboard*/: 1,
	'30060000' /*POIall*/: 2.5,
	'30060100' /*billboard*/: 0.5,
	'30060200' /*billboard*/: 0.5,
	'30060300' /*label*/: 2,
	
		// locate
	'locate' /*locate*/: 0,
};
// feature ==>> shape feature
var shapeFeature = {
		// polygon
	'10020401'/* 教室 */: 'wall',
	'10020511' /*公司*/: 'wall',
	'10030501' /*单间*/: 'wall',
	'10030502' /*单间*/: 'wall',
	'10030503' /*单间*/: 'wall',
	'10030504' /*单间*/: 'wall',
	'10030505' /*实物*/: 'desk',
	'10030506' /*单间*/: 'wall',
	'10030507' /*单间*/: 'wall',
	'10030508' /*单间*/: 'wall',
	'10030509' /*单间*/: 'wall',
	'10030510' /*单间*/: 'wall',
	'10030511' /*单间*/: 'wall',
	'10030512' /*单间*/: 'wall',
	'10030513' /*单间*/: 'wall',
	'10030514' /*单间*/: 'wall',
	'10030515' /*单间*/: 'wall',
	'10030516' /*单间*/: 'wall',
	'10030517' /*单间*/: 'wall',
	'10030518' /*单间*/: 'wall',
	'10030519' /*单间*/: 'wall',
	'10030520' /*单间*/: 'wall',	
	'10030599' /*单间*/: 'wall',	
	
	'10030602' /*单间*/: 'wall',
	'10030603' /*实物*/: 'desk',
	'10030604' /* 电梯 */: 'wall',
	'10030606' /*实物*/: 'desk',
	'10030607' /*实物*/: 'desk',
	'10030608' /*实物*/: 'desk',
	'10030609' /*实物*/: 'desk',
	'10030610' /*实物*/: 'desk',
	
		// point
	'30040100' /*教室*/: 'label',
	'30050100' /*wc*/: 'billboard',
	'30050200' /*楼梯*/: 'billboard',
	'30050300' /*电梯*/: 'billboard',
	//'30050800' /*大门*/: 'billboard',
	'30052200' /*床*/: 'billboard',
	'30060000' /*公司名*/: 'POIall',
	'30060100' /*椅子*/: 'billboard',
	'30060200' /*椅子*/: 'billboard',
	'30060300' /*隔间*/: 'label',
	
};
// ICON 
var shapeIcon = {
		'30050100' /*wc*/: 'wc',
		'30050200' /*楼梯*/: 'stair',
		'30050300' /*电梯*/: 'elevator',
		'30050800' /*大门*/: 'door',
		'30052200' /*床*/: 'bed',
		'30060000' /*公司名*/: 'LOGO2',
		'30060100' /*椅子*/: 'chair_right',
		'30060200' /*椅子*/: 'chair_left',
				
}