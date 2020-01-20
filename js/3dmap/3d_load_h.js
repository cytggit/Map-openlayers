/*DATA*/
var shapeBackgrounds;
var shapePolygons;
var shapePenups;
var shapePOIs;
var shapeLocates;
/*Entities*/
// building
var shapeBuilding = [];
// Background
var shapeBackground = [];
// Polygon
var shapeWall = [],shapeWallNum = 0; // 
var shapeDoor = [],shapeDoorNum = 0; 
var shapeDesk = [],shapeDeskNum = 0; // 
// POI
var shapePoiAll = [],shapePoiAllNum = 0;
var shapeLabel = [],shapeLabelNum = 0;
var shapeBillboard = [],shapeBillboardNum = 0;
// Locate
// var shapeLocate = [];var gltfModel=[];
/*model*/
var model;

var modelParent,DetailParent;
function getModel(){
    //创建坐标  
	var modelCenter = Cesium.Cartesian3.fromDegrees(mapCenter(buildingid)[0],mapCenter(buildingid)[1],0.2 );  
    //创建一个东（X，红色）北（Y，绿色）上（Z，蓝色）的本地坐标系统  
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame( modelCenter );  
    // 改变3D模型的模型矩阵，可以用于移动物体  
    var buildModel = Cesium.Model.fromGltf( {//异步的加载模型  
		name : 'build',  
        // url : './js/Cesium/gltf/p51'+placeid+'.gltf',  
        url : './js/Cesium/gltf/p51.gltf',  
        modelMatrix : modelMatrix, //模型矩阵  
        scale : 0.0000395 //缩放  
    } );
    model = scene.primitives.add( buildModel );
}	
function getBuildingPOI(){
	for (var i=0;i<featuresBuilding.length;i++){
		var buildingCenter = featuresBuilding[i].getGeometry().getCoordinates();
		var buildingName = featuresBuilding[i].get('name');
		shapeBuilding[i] = viewer.entities.add( {  
	        parent : modelParent,
		    name : buildingName,  
		    position : Cesium.Cartesian3.fromDegrees(buildingCenter[0],buildingCenter[1],18),   
		    label : { //文字标签  
		        text : buildingName,  
		        font : '18pt sans-serif',  
		        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
		        fillColor : Cesium.Color.ANTIQUEWHITE,
		        outlineColor : Cesium.Color.ANTIQUEWHITE,
		        outlineWidth : 2,  
		        showBackground: true,
		        scale: 0.5,
		        verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置  
		    }, 
		    properties: {
		    	'building':featuresBuilding[i].get('building_id'),
		    	'buildingPoi': 1
		    },	
		} ); 
	}
}

function setEntitiesBackground(shapeData){
	if(shapeData != undefined){
		for (var j=0;j<shapeData.length;j++){
			shapeBackground = viewer.entities.add({ 
				parent : DetailParent,			
				name : shapeData[j][3],  
				polygon : {  
					hierarchy : Cesium.Cartesian3.fromDegreesArray(shapeData[j][2]),
					height: shapeData[j][1],// 拉伸高度！
					extrudedHeight: shapeData[j][0], //高度！
					//perPositionHeight : true,  //指定使用每个坐标自带的高度！
					material : shapeColor['999999'],  
					//outline : true,  
					//outlineColor : Cesium.Color.BLACK  
				}  
			});
			//viewer.zoomTo(shapeBackground);
		}
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
			        parent : DetailParent,
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
				        parent : DetailParent,
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
				        parent : DetailParent,
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
					        parent : DetailParent,
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
						parent : DetailParent,
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
					    parent : DetailParent, 
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
					    // billboard : { //图标  
					        // image : './icon/' + shapeIcon[featureID]+ '.png',  
					        // width : 26,  
					        // height : 26  
					    // },  
					} );  
				   break;
				case 'label':
					shapeLabel[shapeLabelNum++] = viewer.entities.add( {  
					    parent : DetailParent, 
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
					    parent : DetailParent,
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
	        font : '18pt sans-serif',  
	        style : Cesium.LabelStyle.FILL_AND_OUTLINE,  
	        fillColor : Cesium.Color.ANTIQUEWHITE,
	        outlineColor : Cesium.Color.ANTIQUEWHITE,
			outlineWidth : 1,  
			showBackground: true,
			backgroundColor : Cesium.Color.DARKSLATEGRAY,
			//scale: 0.5,
			scaleByDistance: new Cesium.NearFarScalar(Obj[2], 0.5, 150, 0.2)
	    },   
	    billboard : { //图标  
	        image : './icon/3d_locate.png',  
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        //eyeOffset : Cesium.Cartesian3.UNIT_Z,
	        //alignedAxis: Cesium.Cartesian3.UNIT_X,
	        width : 40,  
	        height : 40,
			scaleByDistance: new Cesium.NearFarScalar(Obj[2], 1, 150, 0.4)
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
	'10020101': Cesium.Color.LIGHTGREY,
	'10020301': Cesium.Color.LIGHTGREY,
	'10020401': Cesium.Color.LIGHTGREY,
	'10020511': Cesium.Color.LIGHTGREY,
	'10020601': Cesium.Color.LIGHTGREY,
	'10020602': Cesium.Color.LIGHTGREY,
	'10020603': Cesium.Color.LIGHTGREY,
	'10020604': Cesium.Color.LIGHTGREY,
	'10020605': Cesium.Color.LIGHTGREY,
	'10020606': Cesium.Color.LIGHTGREY,
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
	'10030117': Cesium.Color.LIGHTGREY,
	'10030118': Cesium.Color.LIGHTGREY,
	'10030119': Cesium.Color.LIGHTGREY,
	'10030120': Cesium.Color.LIGHTGREY,
	'10030121': Cesium.Color.LIGHTGREY,
	'10030122': Cesium.Color.LIGHTGREY,
	'10030123': Cesium.Color.LIGHTGREY,
	'10030124': Cesium.Color.LIGHTGREY,
	'10030125': Cesium.Color.LIGHTGREY,
	'10030126': Cesium.Color.LIGHTGREY,
	'10030127': Cesium.Color.LIGHTGREY,
	'10030128': Cesium.Color.LIGHTGREY,
	'10030130': Cesium.Color.LIGHTGREY,
	'10030131': Cesium.Color.LIGHTGREY,
	'10030132': Cesium.Color.LIGHTGREY,
	'10030133': Cesium.Color.LIGHTGREY,
	'10030134': Cesium.Color.LIGHTGREY,
	'10030199': Cesium.Color.LIGHTGREY,
	'10030201': Cesium.Color.LIGHTGREY,
	'10030202': Cesium.Color.LIGHTGREY,
	'10030203': Cesium.Color.LIGHTGREY,
	'10030204': Cesium.Color.LIGHTGREY,
	'10030205': Cesium.Color.LIGHTGREY,
	'10030206': Cesium.Color.LIGHTGREY,
	'10030207': Cesium.Color.LIGHTGREY,
	'10030301': Cesium.Color.LIGHTGREY,
	'10030302': Cesium.Color.LIGHTGREY,
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
	'10030610': Cesium.Color.PERU,
	'10030611': Cesium.Color.LIGHTGREY,
	'10030612': Cesium.Color.LIGHTGREY,
	'10030613': Cesium.Color.LIGHTGREY
};

//polygon拉伸高度（米）
var shapeHeight = {
		// polygon
	'999999':/* wall */ 0.2,
	'10020101' /* wall */: 2.6,
	'10020301' /* wall */: 2.6,
	'10020401' /* wall */: 2.5,
	'10020511' /* wall */: 2.6,
	'10020601' /* wall */: 0.3,
	'10020602' /* wall */: 2.5,
	'10020603' /* wall */: 2.5,
	'10020604' /* wall */: 2.5,
	'10020605' /* wall */: 2.5,
	'10020606' /* wall */: 2.5,
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
	'10030117' /* wall */: 2.5,
	'10030118' /* wall */: 2.5,
	'10030119' /* wall */: 2.5,
	'10030120' /* wall */: 2.5,
	'10030121' /* wall */: 2.5,
	'10030122' /* wall */: 2.5,
	'10030123' /* wall */: 2.5,
	'10030124' /* wall */: 2.5,
	'10030125' /* wall */: 2.5,
	'10030126' /* wall */: 2.5,
	'10030127' /* wall */: 2.5,
	'10030128' /* wall */: 2.5,
	'10030130' /* wall */: 2.5,
	'10030131' /* wall */: 2.5,
	'10030132' /* wall */: 2.5,
	'10030133' /* wall */: 2.5,
	'10030134' /* wall */: 2.5,
	'10030199' /* wall */: 2.5,
	'10030201' /* wall */: 2.5,
	'10030202' /* wall */: 2.5,
	'10030203' /* wall */: 2.5,
	'10030204' /* wall */: 2.5,
	'10030205' /* wall */: 2.5,
	'10030206' /* wall */: 2.5,
	'10030207' /* wall */: 2.5,
	'10030301' /* wall */: 2.5,
	'10030302' /* wall */: 2.5,
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
	'10030611' /* wall */: 2.5,
	'10030612' /* wall */: 2.5,
	'10030613' /* wall */: 2.5,
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
	'10020101' /*监狱*/: 'room',
	'10020301'/* 工厂*/: 'room',
	'10020401'/* 教室*/: 'room',
	'10020511' /*公司*/: 'room',
	'10020601' /*停车场*/: 'room',
	'10020602' /*晾晒房*/: 'room',
	'10020603' /*礼堂*/: 'room',
	'10020604' /*操场*/: 'room',
	'10020605' /*食堂*/: 'room',
	'10020606' /*锅炉房*/: 'room',
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
	'10030117' /*单间*/: 'room',
	'10030118' /*单间*/: 'room',
	'10030119' /*单间*/: 'room',
	'10030120' /*单间*/: 'room',
	'10030121' /*单间*/: 'room',
	'10030122' /*单间*/: 'room',
	'10030123' /*单间*/: 'room',
	'10030124' /*单间*/: 'room',
	'10030125' /*单间*/: 'room',
	'10030126' /*单间*/: 'room',
	'10030127' /*单间*/: 'room',
	'10030130' /*单间*/: 'room',
	'10030131' /*单间*/: 'room',
	'10030132' /*单间*/: 'room',
	'10030133' /*单间*/: 'room',
	'10030134' /*单间*/: 'room',
	'10030199' /*单间*/: 'room',
	'10030201' /*单间*/: 'room',
	'10030202' /*单间*/: 'room',
	'10030203' /*单间*/: 'room',
	'10030204' /*单间*/: 'room',
	'10030205' /*单间*/: 'room',
	'10030206' /*单间*/: 'room',
	'10030207' /*单间*/: 'room',
	'10030301' /*单间*/: 'room',
	'10030302' /*单间*/: 'room',
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
	'10030604' /*电梯*/: 'wall',
	'10030605' /*楼梯*/: 'room',
	'10030606' /*实物*/: 'desk',
	'10030607' /*实物*/: 'desk',
	'10030608' /*实物*/: 'desk',
	'10030609' /*实物*/: 'desk',
	'10030610' /*实物*/: 'desk',
	'10030611' /*餐厅*/: 'room',
	'10030612' /*厨房*/: 'room',
	'10030613' /*晒衣间*/: 'room',
	
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