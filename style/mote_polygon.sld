<?xml version="1.0" encoding="GB2312"?>
<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0">
    <sld:UserLayer>
        <sld:LayerFeatureConstraints>
            <sld:FeatureTypeConstraint/>
        </sld:LayerFeatureConstraints>
        <sld:UserStyle>
            <sld:Name>polygon</sld:Name>
            <sld:FeatureTypeStyle>
                <sld:Name>group 0</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:SemanticTypeIdentifier>generic:geometry</sld:SemanticTypeIdentifier>
                <sld:SemanticTypeIdentifier>simple</sld:SemanticTypeIdentifier>
                <sld:Rule>
                    <sld:Name>10020511</sld:Name>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>feature_id</ogc:PropertyName>
                            <ogc:Literal>10020511</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>4500.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
					     <sld:Geometry>
                            <ogc:Function name="isometric">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#999999</sld:CssParameter>
                        </sld:Fill>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>  
			<sld:FeatureTypeStyle>
                <sld:Name>group 1</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:SemanticTypeIdentifier>generic:geometry</sld:SemanticTypeIdentifier>
                <sld:SemanticTypeIdentifier>simple</sld:SemanticTypeIdentifier>
                <sld:Rule>
                    <sld:Name>10020511</sld:Name>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>feature_id</ogc:PropertyName>
                            <ogc:Literal>10020511</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>4500.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="offset">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0</ogc:Literal>
                                <ogc:Literal>0</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#FFFFFF</sld:CssParameter>
                        </sld:Fill>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
            <sld:FeatureTypeStyle>
                <sld:Name>group 2</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:Rule>
                    <sld:Name>10030500</sld:Name>
                    <ogc:Filter>
                        <ogc:Or>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030501</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030502</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030602</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030504</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Or>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>2000.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="isometric">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0.00001</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#FF8040</sld:CssParameter>
                            <sld:CssParameter name="fill-opacity">0.5</sld:CssParameter>
                        </sld:Fill>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
            <sld:FeatureTypeStyle>
                <sld:Name>group 3</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:Rule>
                    <sld:Name>10030500</sld:Name>
                    <ogc:Filter>
                        <ogc:Or>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030501</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030502</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030602</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030504</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Or>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>2000.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="offset">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0</ogc:Literal>
                                <ogc:Literal>0.00001</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#FFC2A6</sld:CssParameter>
                            <sld:CssParameter name="fill-opacity">1</sld:CssParameter>
                        </sld:Fill>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
            <sld:FeatureTypeStyle>
                <sld:Name>group 4</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:Rule>
                    <sld:Name>10030505</sld:Name>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>feature_id</ogc:PropertyName>
                            <ogc:Literal>10030505</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>1500.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="isometric">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0.000005</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#7a45d6</sld:CssParameter>
                        </sld:Fill>
                        <sld:Stroke>
                            <sld:CssParameter name="stroke">#7a45d6</sld:CssParameter>
                            <sld:CssParameter name="stroke-width">0</sld:CssParameter>
                        </sld:Stroke>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
            <sld:FeatureTypeStyle>
                <sld:Name>group 5</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:Rule>
                    <sld:Name>10030505</sld:Name>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>feature_id</ogc:PropertyName>
                            <ogc:Literal>10030505</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>1500.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="offset">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0</ogc:Literal>
                                <ogc:Literal>0.000005</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Fill>
                            <sld:CssParameter name="fill">#936cd6</sld:CssParameter>
                        </sld:Fill>
                        <sld:Stroke>
                            <sld:CssParameter name="stroke">#936cd6</sld:CssParameter>
                            <sld:CssParameter name="stroke-width">0</sld:CssParameter>
                        </sld:Stroke>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
            <sld:FeatureTypeStyle>
                <sld:Name>group 6</sld:Name>
                <sld:FeatureTypeName>Feature</sld:FeatureTypeName>
                <sld:Rule>
                    <sld:Name>10030500</sld:Name>
                    <ogc:Filter>
                        <ogc:Or>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030501</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030502</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030602</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                            <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>feature_id</ogc:PropertyName>
                                <ogc:Literal>10030504</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Or>
                    </ogc:Filter>
                    <sld:MaxScaleDenominator>2000.0</sld:MaxScaleDenominator>
                    <sld:PolygonSymbolizer>
                        <sld:Geometry>
                            <ogc:Function name="isometric">
                                <ogc:PropertyName>geom</ogc:PropertyName>
                                <ogc:Literal>0.00001</ogc:Literal>
                            </ogc:Function>
                        </sld:Geometry>
                        <sld:Stroke>
                            <sld:CssParameter name="stroke">#DDDDDD</sld:CssParameter>
                            <sld:CssParameter name="stroke-width">0.0</sld:CssParameter>
                            <sld:CssParameter name="stroke-opacity">0.3</sld:CssParameter>
                        </sld:Stroke>
                    </sld:PolygonSymbolizer>
                </sld:Rule>
            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:UserLayer>
</sld:StyledLayerDescriptor>
