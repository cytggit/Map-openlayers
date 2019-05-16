/*DATA*/
var ModelCenters = {};
var shapeBackgrounds ={};
var shapePolygons ={};
var shapePenups ={};
var shapePOIs ={};
var shapeLocates = {};
/*Entities*/
// Background
var shapeBackground;
// Polygon
var shapeWall = [],shapeWallNum = 0; // 
var shapeDoor = [],shapeDoorNum = 0; 
var shapeDesk = [],shapeDeskNum = 0; // 
// POI
var shapePoiAll = [],shapePoiAllNum = 0;
var shapeLabel = [],shapeLabelNum = 0;
var shapeBillboard = [],shapeBillboardNum = 0;
// model
var shapeLocate = [];var gltfModel=[];

function setEntitiesModel(ModelCenter){
	if(ModelCenter != undefined){
		for(var i=0;i<ModelCenter.length;i++){
			shapeLocate[i] = Cesium.Cartesian3.fromDegrees(ModelCenter[i][0],ModelCenter[i][1],ModelCenter[i][2]);  
			//创建一个东（X，红色）北（Y，绿色）上（Z，蓝色）的本地坐标系统  
			var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame( shapeLocate[i] );  
			// 改变3D模型的模型矩阵，可以用于移动物体  
			// 物体的世界坐标 = 物体的模型坐标 * 世界矩阵  
			gltfModel[i] = Cesium.Model.fromGltf( {//异步的加载模型  
				name : 'model',  
				url :  './js/Cesium/gltf/'+ ModelCenter[i][3] +'.gltf',  
				modelMatrix : modelMatrix, //模型矩阵  
				scale : 0.001 //缩放  
			} );
			model = scene.primitives.add( gltfModel[i] );
		}
	}
}

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
		//viewer.zoomTo(shapeBackground);
	}
}
function setEntitiesPolygon(shapeData,shapeDoorData){
	if(shapeData != undefined){
		var allFeature = Object.keys(shapeData)
		shapeWall = [];shapeWallNum = 0;
		shapeDesk = [];shapeDeskNum = 0;
		shapeDoor = [];shapeDoorNum = 0;
		// 门-penup
		for(var j=0;j<shapeDoorData.length;j++){
			shapeDoor[shapeDoorNum++] = viewer.entities.add({ 
			        name : shapeDoorData[1],  
			        polylineVolume : {  
			          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
			          			shapeDoorData[j][0]),  
			          	shape :[new Cesium.Cartesian2(-0.11,0),  // 横截面形状，相对值，中心点距离边界的值
			          			new Cesium.Cartesian2(0.11, 0),  
			          			new Cesium.Cartesian2(0.11, 1.8),  
			          			new Cesium.Cartesian2(-0.11,1.8)],  
			          	cornerType : Cesium.CornerType.ROUNDED,  // 控制端点形状
			          	material : Cesium.Color.BROWN.withAlpha(1),  
		        }		        
		   });
		}

		for (var i=0;i<allFeature.length;i++){
			var featureID = allFeature[i];
			for (var j=0;j<shapeData[featureID].length;j++){
				switch (shapeFeature[featureID]){
				case 'wall':
				   shapeWall[shapeWallNum++] = viewer.entities.add({ 
				        name : shapeData[featureID][j][3],  
				        corridor : {
				          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(
				          			shapeData[featureID][j][2]),
				          	height : shapeData[featureID][j][1],//浮空高度,不带高度时不用设置
				          	extrudedHeight : shapeData[featureID][j][1] + 0.001 ,//拉伸高度,不带高度时不用设置
				          	width : 0.2,
				          	cornerType: Cesium.CornerType.ROUNDED,// 控制端点形状
				          	material : Cesium.Color.BLACK,
				        },
				        polylineVolume : {  
				          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
				          			shapeData[featureID][j][2]),  
				          	shape :[new Cesium.Cartesian2(-0.1,0),  // 横截面形状，相对值，中心点距离边界的值
				          			new Cesium.Cartesian2(0.1, 0),  
				          			new Cesium.Cartesian2(0.1, shapeHeight[featureID]),  
				          			new Cesium.Cartesian2(-0.1,shapeHeight[featureID])],  
				          	cornerType : Cesium.CornerType.ROUNDED,  // 控制端点形状
				          	material : Cesium.Color.WHITE.withAlpha(1),  
				        }
				     });
				   break;
				case 'isolation': 
				   shapeWall[shapeWallNum++] = viewer.entities.add({ 
				        name : shapeData[featureID][j][3],  
				        polylineVolume : {  
				          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
				          			shapeData[featureID][j][2]),  
				          	shape :[new Cesium.Cartesian2(-0.1,0),  // 横截面形状，相对值，中心点距离边界的值
				          			new Cesium.Cartesian2(0.1, 0),  
				          			new Cesium.Cartesian2(0.1, shapeHeight[featureID]),  
				          			new Cesium.Cartesian2(-0.1,shapeHeight[featureID])],  
				          	cornerType : Cesium.CornerType.ROUNDED,  // 控制端点形状
				          	material : Cesium.Color.PERU.withAlpha(1),  
				        }
				     });
				   break;
				case 'room':
					   shapeWall[shapeWallNum++] = viewer.entities.add({ 
					        name : shapeData[featureID][j][3],  
					        corridor : {
					          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(
					          			shapeData[featureID][j][2]),
					          	height : shapeData[featureID][j][1],//浮空高度,不带高度时不用设置
					          	extrudedHeight : shapeData[featureID][j][1] + 0.001 ,//拉伸高度,不带高度时不用设置
					          	width : 0.2,
					          	cornerType: Cesium.CornerType.ROUNDED,// 控制端点形状
					          	material : Cesium.Color.BLACK,
					        },
					        polylineVolume : {  
					          	positions : Cesium.Cartesian3.fromDegreesArrayHeights(  
					          			shapeData[featureID][j][2]),  
					          	shape :[new Cesium.Cartesian2(-0.1,0),  // 横截面形状，相对值，中心点距离边界的值
					          			new Cesium.Cartesian2(0.1, 0),  
					          			new Cesium.Cartesian2(0.1, shapeHeight[featureID]),  
					          			new Cesium.Cartesian2(-0.1,shapeHeight[featureID])],  
					          	cornerType : Cesium.CornerType.ROUNDED,  // 控制端点形状
					          	material : Cesium.Color.WHITE.withAlpha(1),  
					        },
					        polygon : {  
					          	hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(  // 普通不带挖空效果的polygon		
					          			shapeData[featureID][j][2]
					          	),  
					          	height : shapeData[featureID][j][0],
					          	extrudedHeight: shapeData[featureID][j][0]+0.001,
					          	// perPositionHeight : true,  //指定使用每个坐标自带的高度！
					          	material : shapeColor[featureID],  
					        }  
					     });
					   break;
				case 'desk':
					shapeDesk[shapeDeskNum++] = viewer.entities.add({  
						name : shapeData[featureID][j][3],  
						polygon : {  
							hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(
									shapeData[featureID][j][2]),
							height: shapeData[featureID][j][0] ,// 拉伸高度！
							extrudedHeight: shapeData[featureID][j][1], //基础高度！
							perPositionHeight : false,  //指定使用每个坐标自带的高度！
							material : shapeColor[featureID], //Cesium.Color.CORNSILK.withAlpha(0.5)
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
					        font : '9pt sans-serif',  
					        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
					        fillColor : Cesium.Color.ANTIQUEWHITE,
					        outlineColor : Cesium.Color.DARKSLATEGRAY,
					        outlineWidth : 4,  
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

// locate  删除再加载，改为只改变坐标，顺滑移动
var LocatesId = [];
function setEntitiesLocate(shapeData){
	if(LocatesId.length ==0 ){
		if(shapeData != undefined ){// add 第一次传进定位点
			for (var j=0;j<shapeData.length;j++){
				addEntitiesLocate(shapeData[j]);
				LocatesId[j] = shapeData[j][3];
			}
		}
	}else {
		if(shapeData != undefined ){// upd (include add and del)定位点更新
			for(var i = 0;i<LocatesId.length;i++){
				for(var j = 0;j<shapeData.length;j++){
					if(LocatesId[i] == shapeData[j][3]){
						break;
					}else if(j == shapeData.length -1){
						viewer.entities.removeById(LocatesId[i]);// del
					}
				}
			}
			for(var i = 0;i<shapeData.length;i++){
				if(LocatesId.indexOf(shapeData[i][3]) > -1){// upd
					viewer.entities.getById(shapeData[i][3]).position = Cesium.Cartesian3.fromDegrees(shapeData[i][0],shapeData[i][1],shapeData[i][2]);
				}else{// add
					addEntitiesLocate(shapeData[i]);
				}
			}
			// 更新LocatesId
			LocatesId = [];
			for (var j=0;j<shapeData.length;j++){
				LocatesId[j] = shapeData[j][3];
			}
		}else{// del 定位点全部消失
			for(var i = 0;i<LocatesId.length;i++){
				viewer.entities.removeById(LocatesId[i]);
			}
			LocatesId = [];
		}
	}
}
function addEntitiesLocate(Obj){
    /*//创建坐标  
	shapeLocate[j] = Cesium.Cartesian3.fromDegrees( shapeData[j][0],shapeData[j][1],shapeData[j][2] );  
    //创建一个东（X，红色）北（Y，绿色）上（Z，蓝色）的本地坐标系统  
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame( shapeLocate[j] );  
    // 改变3D模型的模型矩阵，可以用于移动物体  
    // 物体的世界坐标 = 物体的模型坐标 * 世界矩阵  
    gltfModel[j] = Cesium.Model.fromGltf( {//异步的加载模型  
		name : 'locate',  
        url : IconPath + '/models/CesiumMan/Cesium_Man.gltf',  
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
    		} );  */
	viewer.entities.add({  
		id : Obj[3],//'locate' + j,
		name : 'locate',  
		position : Cesium.Cartesian3.fromDegrees(Obj[0],Obj[1],Obj[2]),
		label : { //文字标签  
	        text : Obj[3],  
	        font : '9pt sans-serif',  
	        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
	        fillColor : Cesium.Color.ANTIQUEWHITE,
	        outlineColor : Cesium.Color.DARKSLATEGRAY,
	        outlineWidth : 4,  
	        //verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
	        //heightReference: 2,
	        //pixelOffset : new Cesium.Cartesian2( 36, -2 ),   //偏移量  
	        
	    },   
	    billboard : { //图标  
	        image : './icon/3d_locate.png',  
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        //eyeOffset : Cesium.Cartesian3.UNIT_Z,
	        //alignedAxis: Cesium.Cartesian3.UNIT_X,
	        width : 40,  
	        height : 40  
	    },  
	    properties: {
	    	// 'name':Obj[3],
	    	'l_id':Obj[3],
	    	// 'heart_rate':Obj[5],
	    	// 'spb':Obj[6],
	    	// 'dpb':Obj[7],
	    	// 'steps':Obj[8],
	    },	
	});
}

// polygon填充色
var shapeColor = {
	'999999': Cesium.Color.LIGHTSTEELBLUE,
	'10020401': Cesium.Color.LIGHTGREY,
	'10020511': Cesium.Color.LIGHTGREY,
	'10020101': Cesium.Color.LIGHTGREY,
	'10030101': Cesium.Color.LIGHTGREY,
	'10030102': Cesium.Color.LIGHTGREY,
	'10030103': Cesium.Color.LIGHTGREY,
	'10030104': Cesium.Color.LIGHTGREY,
	'10030105': Cesium.Color.LIGHTGREY,
	'10030106': Cesium.Color.LIGHTGREY,
	'10030107': Cesium.Color.LIGHTGREY,
	'10030108': Cesium.Color.LIGHTGREY,
	'10030109': Cesium.Color.LIGHTGREY,
	'10030110': Cesium.Color.LIGHTGREY,
	'10030111': Cesium.Color.LIGHTGREY,
	'10030112': Cesium.Color.LIGHTGREY,
	'10030113': Cesium.Color.LIGHTGREY,
	'10030114': Cesium.Color.LIGHTGREY,
	'10030115': Cesium.Color.LIGHTGREY,
	'10030116': Cesium.Color.LIGHTGREY,
	'10030501': Cesium.Color.LIGHTGREY,
	'10030502': Cesium.Color.LIGHTGREY,
	'10030503': Cesium.Color.LIGHTGREY,
	'10030504': Cesium.Color.LIGHTGREY,
	'10030505': Cesium.Color.PERU,
	'10030506': Cesium.Color.LIGHTGREY,
	'10030507': Cesium.Color.LIGHTGREY,
	'10030508': Cesium.Color.LIGHTGREY,
	'10030509': Cesium.Color.LIGHTGREY,
	'10030510': Cesium.Color.LIGHTGREY,
	'10030511': Cesium.Color.LIGHTGREY,
	'10030512': Cesium.Color.LIGHTGREY,
	'10030513': Cesium.Color.LIGHTGREY,
	'10030514': Cesium.Color.LIGHTGREY,
	'10030515': Cesium.Color.LIGHTGREY,
	'10030516': Cesium.Color.LIGHTGREY,
	'10030517': Cesium.Color.LIGHTGREY,
	'10030518': Cesium.Color.LIGHTGREY,
	'10030519': Cesium.Color.LIGHTGREY,
	'10030520': Cesium.Color.LIGHTGREY,
	'10030599': Cesium.Color.LIGHTGREY,
	
	'10030602': Cesium.Color.LIGHTGREY,
	'10030603': Cesium.Color.PERU,
	'10030604': Cesium.Color.WHITE,
	'10030605': Cesium.Color.LIGHTGREY,
	'10030606': Cesium.Color.PERU,
	'10030607': Cesium.Color.PERU,
	'10030608': Cesium.Color.PERU,
	'10030609': Cesium.Color.PERU,
	'10030610': Cesium.Color.PERU
};

//polygon拉伸高度（米）
var shapeHeight = {
		// polygon
	'999999':/* wall */ 0.2,
	'10020401'/* wall */: 2.5,
	'10020511' /* wall */: 2.6,
	'10020101' /* wall */: 2.6,
	'10030101' /* wall */: 2.5,
	'10030102' /* wall */: 2.5,
	'10030103' /* wall */: 2.5,
	'10030104' /* wall */: 2.5,
	'10030105' /* wall */: 2.5,
	'10030106' /* wall */: 2.5,
	'10030107' /* wall */: 2.5,
	'10030108' /* wall */: 2.5,
	'10030109' /* wall */: 2.5,
	'10030110' /* wall */: 2.5,
	'10030111' /* wall */: 2.5,
	'10030112' /* wall */: 2.5,
	'10030113' /* wall */: 2.5,
	'10030114' /* wall */: 2.5,
	'10030115' /* wall */: 2.5,
	'10030116' /* wall */: 2.5,
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
	'10030605' /* desk */: 2.0,
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
	'locate' /*locate*/: 2,
};
// feature ==>> shape feature
var shapeFeature = {
		// polygon
	'10020401'/* 教室*/: 'room',
	'10020511' /*公司*/: 'room',
	'10020101' /*监狱*/: 'room',
	'10030101' /*单间*/: 'room',
	'10030102' /*单间*/: 'room',
	'10030103' /*单间*/: 'room',
	'10030104' /*单间*/: 'room',
	'10030105' /*单间*/: 'room',
	'10030106' /*单间*/: 'room',
	'10030107' /*单间*/: 'room',
	'10030108' /*单间*/: 'room',
	'10030109' /*单间*/: 'room',
	'10030110' /*单间*/: 'room',
	'10030111' /*单间*/: 'room',
	'10030112' /*单间*/: 'room',
	'10030113' /*单间*/: 'room',
	'10030114' /*单间*/: 'room',
	'10030115' /*单间*/: 'room',
	'10030116' /*单间*/: 'isolation',
	'10030501' /*单间*/: 'room',
	'10030502' /*单间*/: 'room',
	'10030503' /*单间*/: 'room',
	'10030504' /*单间*/: 'room',
	'10030505' /*实物*/: 'desk',
	'10030506' /*单间*/: 'room',
	'10030507' /*单间*/: 'room',
	'10030508' /*单间*/: 'room',
	'10030509' /*单间*/: 'room',
	'10030510' /*单间*/: 'room',
	'10030511' /*单间*/: 'room',
	'10030512' /*单间*/: 'room',
	'10030513' /*单间*/: 'room',
	'10030514' /*单间*/: 'room',
	'10030515' /*单间*/: 'room',
	'10030516' /*单间*/: 'room',
	'10030517' /*单间*/: 'room',
	'10030518' /*单间*/: 'room',
	'10030519' /*单间*/: 'room',
	'10030520' /*单间*/: 'room',	
	'10030599' /*单间*/: 'room',	
	
	'10030602' /*单间*/: 'room',
	'10030603' /*实物*/: 'desk',
	'10030604' /* 电梯 */: 'wall',
	'10030605' /* 楼梯 */: 'room',
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