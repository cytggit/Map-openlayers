var viewer;
var scene;  
var camera;
function load3dMap (){	
	viewer = new Cesium.Viewer('cesiumContainer',{
		animation: false,										//控制视图动画的播放(左下角)。 默认true
		// baseLayerPicker: false,							//控制底图和投影选择。默认true
		fullscreenButton: false,							//控制全屏。默认true
		// vrButton: true,										//控制VR（双屏）模式。默认false
		// geocoder: false,										//位置搜索框。默认true
		homeButton: false,									//控制viewer回到初始状态（比例尺和中心点）。默认true
		// infoBox: true,											//点击要素之后显示的信息（气泡窗口）。默认true
		sceneModePicker: false,							//控制2D,3D,2.5D。默认true
		// selectionIndicator:true,							//选中地图要素的标识控件。默认true
		timeline:false,											//指示当前时间，并允许用户跳转到特定时间。 。默认true
		navigationHelpButton:false, 					//帮助按钮(mouse or touch如何拖拽)。默认true
		// navigationInstructionsInitiallyVisible: false,	//帮助按钮相关，不懂！！！
		// scene3DOnly: true,									//3D,true时sceneModePicker为false。默认false
		// clockViewModel										//控制时间的模型
		// selectedImageryProviderViewModel		//不解释
		imageryProviderViewModels: [/*new Cesium.ProviderViewModel(
		           {
		               name : '高德地图',
		               iconUrl : '5555',//Cesium.buildModuleUrl(model.iconUrl),
		               tooltip : '6666',
		               creationFunction : function() {
		                 return cesiumAmap;
		                }
		           })*/],	/*设置自己的地图服务-影像图*/			//设置地图切换控件绑定底图数据源，跟baseLayerPicker属性设置true配合使用
		// selectedTerrainProviderViewModel			//不解释
		// terrainProviderViewModels:/*设置自己的地图服务-地形图*/,				//设置地图切换控件绑定底图数据源，跟baseLayerPicker属性设置true配合使用
		// imageryProvider:											//不解释
		// terrainProvider											//不解释
		// skyBox														//天空（星星）的渲染，3D时有效
		// skyAtmosphere										//地球周围的光芒，3D时有效
		// fullscreenElement: 'cesiumContainer',		//全屏时被放进全屏的页面元素，fullscreenButton为true时有效。默认document.body
		// useDefaultRenderLoop:true,					//控制渲染循环，false的时候不出图。默认true
		// targetFrameRate										//不懂！！！
		// showRenderLoopErrors							//渲染循环发生错误时提示error
		// automaticallyTrackDataSourceClocks		//不懂！！！
		// contextOptions										//上下文和WebGL创建属性对应options传递给Scene。不懂！！！
		//sceneMode: Cesium.SceneMode.COLUMBUS_VIEW,							//控制默认3D模式，可设置默认为2D\3D\2.5D模式
		// mapProjection											//地图投影，2D、哥伦布视图有效
		// globe														//地球渲染，
		// orderIndependentTranslucency				//不懂！！！如果配置支持则使用独立的半透明
		creditContainer: 'cesiumContainer',							//底部信息展示的窗口，没有指定的话，默认在控件本身的底部
		// dataSources											//
		// terrainExaggeration:1.0,							//用来夸大地形的标量。
		// shadows: true,										//是否投下阴影。没试出来效果
		// terrainShadows										//确定地形或接收来自太阳的阴影。
		// mapMode2D:Cesium.MapMode2D.ROTATE,//控制地图缩放和旋转，默认可滚动缩放，不可旋转。2D时有效
		// projectionPicker:true,									//控制投影。默认false

	});
	
	scene = viewer.scene;
	camera = viewer.camera;
	// TODO 可以设置成公司logo
    viewer._cesiumWidget._creditContainer.style.display="none";  
	//viewer._cesiumWidget._creditContainer.innerHTML = 
    
    // 去除toolbar的图层切换button
    //console.log(viewer._toolbar);
    $('.cesium-viewer-toolbar button').remove(); 
    
    // 修改自带图标样式
    $('.cesium-geocoder-searchButton').css("background-color", "#ffffff");
    $('.cesium-geocoder-searchButton').css("fill", "#339aff");
    $('.cesium-geocoder-searchButton').css("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.2))");
    $('.cesium-geocoder-input').css("border", "solid 1px #fcfafa");
    
    
    // 加载底图
    viewAddBottomMap(); 
	// 切换初始角度
    changeCamera([mapCenter(placeid)[0]+0.0003,mapCenter(placeid)[1]-0.00025],(floorid-1) * 3 +80,-42.4);
	
}

//加载底图
function viewAddBottomMap(){
    viewer.entities.add({ 
        polygon : {  
          	hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(  // 普通不带挖空效果的polygon		
          			[10.0, 0.0,0,
          			160.0, 0.0,0,
          			160.0, 90.0,0,
          			10.0, 90.0,0,
          			10.0, 0.0,0]
          	),  
          	height : -1000,
          	extrudedHeight: 100,
          	material : /*Cesium.Color.LIGHTGREY, */new Cesium.Color(0.05,0.35,0.69, 1)
        }  
     });
}

function changeMap(mapType){
	switch (mapType){
	case 'to3d': 
		$("#map").css("width", "0%");
		$("#cesiumContainer").css("width", "100%");
		//隐藏功能button
		$(".feature-select ul li a").hide();
		$(".feature-select ul .divider").hide();
		$("#changeMap-Act a").show();
		//更改执行函数
		$("#changeMap-Act").attr("onClick","changeMap('to2d');")
		//更改图标
		$("#changeMap-Img").attr("src","./icon/2d.png");
		$("#changeMap-Span").html("二维");
		break;
	case 'to2d': 
		$("#map").css("width", "100%");
		$("#cesiumContainer").css("width", "0%");
		//显示功能button
		$(".feature-select ul .divider").show();
		$(".feature-select ul li a").show();
		//更改执行函数
		$("#changeMap-Act").attr("onClick","changeMap('to3d');")
		//更改图标
		$("#changeMap-Img").attr("src","./icon/3d.png");
		$("#changeMap-Span").html("三维");
		map.updateSize();
		break;
	default: 
		break;
	}
}
// 切换视角
function changeCamera(center,high,heading){
	camera.flyTo({
		destination :  Cesium.Cartesian3.fromDegrees(center[0],center[1],high), // 设置位置
        orientation: {
            heading : Cesium.Math.toRadians(heading), // 方向
            pitch : Cesium.Math.toRadians(-60.0),// 倾斜角度
            roll : 0
        },
        //duration:5, // 设置飞行持续时间，默认会根据距离来计算
        complete: function () {
            // 到达位置后执行的回调函数
            //console.log('到达目的地');
        },
        cancle: function () {
            // 如果取消飞行则会调用此函数
            //console.log('飞行取消')
        },
	});
}