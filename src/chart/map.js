import store from '../store'
import * as Data from '../data'
import * as d3 from 'd3'
import Miyazakimin from '../miyazakimin'
import * as ChartCommon from './chartcommon'
export default function (newValue,reDisplayFlg) {
  const statOld = store.state.base.statOld;
  const leftObjName0 = newValue.leftSide.split('/')[0];
  const leftObjName1 = newValue.leftSide.split('/')[1];
  const rightObjName0 = newValue.rightSide.split('/')[0];
  const rightObjName1 = newValue.rightSide.split('/')[1];
  const tooltip = d3.select(".tooltip");
  // 宮崎県のjson------------------------------------------------------------------------------
  const json = Miyazakimin;
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width=400, height=400;
 // マップ作製ファンクション-----------------------------------------------------------------------
  const mapCreate = side => {
    let dataset, id, targetColumn, statName, unit;
    if (side==='left') {
      dataset = Data[leftObjName0].data;
      targetColumn = Data[leftObjName0][leftObjName1].column;
      id = 'left-map';
      statName =Data[leftObjName0][leftObjName1].statName;
      unit = Data[leftObjName0][leftObjName1].unit;
    } else {
      //データがないときは終了
      if (!Data[rightObjName0]) return;
      dataset = Data[rightObjName0].data;
      targetColumn = Data[rightObjName0][rightObjName1].column;
      id = 'right-map';
      statName =Data[rightObjName0][rightObjName1].statName;
      unit = Data[rightObjName0][rightObjName1].unit;
    }
    const maxLeft = d3.max(dataset, d => d[targetColumn]);
    const minLeft = d3.min(dataset, d => d[targetColumn]);
    const center = [131.284, 32.1]
    // projectionを定義----------------------------------------------------------------------
    var projection = d3.geoMercator()
    .center(center)
    .translate([width / 2, height / 2]) // svgの中心
    .scale(12500);
    // pathを定義
    var path = d3.geoPath(projection);
    var color = d3.scaleLinear()
    .domain([minLeft, maxLeft])
    .range(["white", "red"]);
    // d3.json(url).then(json => {
    // svg要素を追加
    // }
    // )
    d3.select('#' + id + '-svg').remove();
    const svg = d3.select('#' + id + '-div')
    .append("svg")
    .attr('id',  id + '-svg')
    .attr('class', 'map-svg')
    .attr("width", width)
    .attr("height", height);
    svg.append("g")
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .on("mouseover", function(d) {
      const result = dataset.find((el) => el.citycode === Number(d.properties.id));
      tooltip
      .style("visibility", "visible")
      .html(result.cityname + "<br>" + result[targetColumn] + unit);
      d3.select(this)
      .attr("stroke", "black");
    })
    .on("mousemove", () => {
      tooltip
      .style("top", (d3.event.pageY - 45) + "px")
      .style("left", (d3.event.pageX + 20) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this)
      .attr("stroke", "gray");
    })
    .attr('d', path)
    .attr('stroke', 'gray')
    .attr('stroke-width', '0.3px')
    .attr('fill', 'rgba(255,255,255,0.1)')
    .transition()
    .delay((d,i) => i * 10)
    .attr("fill", d => {
      const result = dataset.find((el) => el.citycode === Number(d.properties.id));
      return color(result[targetColumn])
    });
    // 表名-------------------------------------------------------------------------------------
    const statNameG = svg.append("g")
    .attr("transform", "translate(" + (10) + "," + 30 + ")")
    .append("text")
    .text(statName)
    .attr("font-weight", "normal")
    .attr("font-size", "16px");
    // PNG保存--------------------------------------------------------------------------------
    const png =svg.append("g")
    .attr("transform", "translate(" + (width - 60) + "," + (20) + ")")
    .append("text")
    .text('画像保存')
    .attr("font-weight", "normal")
    .attr("font-size", "12px")
    .attr('cursor', 'pointer')
    .on('click', function (){
      statNameG.attr('display', 'none')
      png.attr('display', 'none')
      ChartCommon.pngSave(svg,width, height, statName)
      statNameG.attr('display', 'block')
      png.attr('display', 'block')
    })
  };
  // 左右のデータのあるなしでbubbleCreateファンクションを呼び出し------------------------------
  if (Data[leftObjName0] && statOld.leftSide !== newValue.leftSide && reDisplayFlg) mapCreate('left');
  if (Data[rightObjName0] && statOld.rightSide !== newValue.rightSide && reDisplayFlg) mapCreate('right')
}
