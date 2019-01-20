import store from '../store'
import * as Data from '../data'
import * as d3 from 'd3'
import * as ChartCommon from './chartcommon'
export default function (newValue,reDisplayFlg) {
  const statOld = store.state.base.statOld;
  const leftObjName0 = newValue.leftSide.split('/')[0];
  const leftObjName1 = newValue.leftSide.split('/')[1];
  const rightObjName0 = newValue.rightSide.split('/')[0];
  const rightObjName1 = newValue.rightSide.split('/')[1];
  const tooltip = d3.select('.tooltip');
  // 表示中のグラフを削除-----------------------------------------------------------------------
  d3.select('#bar-svg').remove();
  d3.selectAll('.bubble-div').remove();
  d3.select('#scatter-svg').remove();
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width = 400, height = 400;
  // 圏域---------------------------------------------------------------------------------------
  const dataKeniki = {
    "children": [
      {
        "name": "宮崎東諸県圏域",
        "color": "orangered",
        "children": [
          { "name": "宮崎市"}, { "name": "国富町"}, { "name": "綾町"}
        ]
      },
      {
        "name": "日南・串間圏域",
        "color": "palevioletred",
        "children": [
          { "name": "日南市"}, { "name": "串間市"}
        ]
      },
      {
        "name": "都城北諸県圏域",
        "color": "gold",
        "children": [
          { "name": "都城市"}, { "name": "三股町"}
        ]
      },
      {
        "name": "西諸県圏域",
        "color": "mediumseagreen",
        "children": [
          { "name": "小林市"}, { "name": "えびの市"}, { "name": "高原町"}
        ]
      },
      {
        "name": "西都児湯圏域",
        "color": "olive",
        "children": [
          { "name": "西都市"}, { "name": "高鍋町"}, { "name": "新富町"}, { "name": "西米良村"},
          { "name": "木城町"}, { "name": "川南町"}, { "name": "都農町"}
        ]
      },
      {
        "name": "宮崎県北部圏域",
        "color": "royalblue",
        "children": [
          { "name": "延岡市"}, { "name": "日向市"}, { "name": "門川町"}, { "name": "諸塚村"}, { "name": "椎葉村"},
          { "name": "美郷町"}, { "name": "高千穂町"}, { "name": "日之影町"}, { "name": "五ヶ瀬町"}
        ]
      }
    ]
  };
  // ツリーマップ作製-----------------------------------------------------------------------------
  const treeCreate = side => {
    let dataset, id, targetColumn, position, statName, unit;
    if (side === 'left') {
      dataset = Data[leftObjName0].data;
      targetColumn = Data[leftObjName0][leftObjName1].column;
      id = 'left-tree-div';
      position = 'static';
      statName =Data[leftObjName0][leftObjName1].statName;
      unit = Data[leftObjName0][leftObjName1].unit;
    } else {
      //データがないときは終了
      if (!Data[rightObjName0]) return;
      dataset = Data[rightObjName0].data;
      targetColumn = Data[rightObjName0][rightObjName1].column;
      id = 'right-tree-div';
      position = 'absolute';
      statName =Data[rightObjName0][rightObjName1].statName;
      unit = Data[rightObjName0][rightObjName1].unit;
    }
    for (let i in dataset) {
      let result, result2;
      switch(dataset[i].cityname) {
        case '宮崎市':case '国富町':case '綾町':
          result = dataKeniki.children.find((el) => el.name === '宮崎東諸県圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
        case '日南市':case '串間市':
          result = dataKeniki.children.find((el) => el.name === '日南・串間圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
        case '都城市':case '三股町':
          result = dataKeniki.children.find((el) => el.name === '都城北諸県圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
        case '小林市':case 'えびの市':case '高原町':
          result = dataKeniki.children.find((el) => el.name === '西諸県圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
        case '西都市':case '高鍋町':case '新富町':case '西米良村':case '木城町':case '川南町':case '都農町':
          result = dataKeniki.children.find((el) => el.name === '西都児湯圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
        case '延岡市':case '日向市':case '門川町':case '諸塚村':case '椎葉村':case '美郷町':case '高千穂町':case '日之影町':case '五ヶ瀬町':
          result = dataKeniki.children.find((el) => el.name === '宮崎県北部圏域');
          result2 = result.children.find((el) => el.name === dataset[i].cityname);
          result2.value = dataset[i][targetColumn];
          break;
      }
    }
    // 描画用のデータ変換-----------------------------------------------------------------------
    const root = d3.hierarchy(dataKeniki);
    root
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
    const treemap = d3.treemap()
    .size([width-20, height-40])// ツリーマップ全体の大きさ
    .padding(0)
    // .paddingOuter(2)
    .round(true);
    treemap(root);
    // DIV作成---------------------------------------------------------------------------------
    d3.select('#' + id).remove();
    d3.select('#d3chart01').append('div')
    .attr('id', id)
    .attr('class', 'div tree-div')
    .style('height', height + 'px')
    .style('width', width + 'px')
    .style('background','silver')
    .style('position', ()  => position)
    .style('top',0) //absoluteの時だけ有効
    .style('right',0); //absoluteの時だけ有効
    // SVG領域作成---------------------------------------------------------------------------
    const svg = d3.select('#' + id).append('svg')
    .attr('width', width)
    .attr('height', height);
    // 表名-------------------------------------------------------------------------------------
    const statNameG = svg.append('g')
    .attr('transform', 'translate(10, 20)')
    .append('text')
    .text(statName)
    .attr('font-size', '16px');
    // ツリーマップ--------------------------------------------------------------------------------
    const treeSvg = svg.append('g')
    .attr('class', 'svg')
    .selectAll('.node')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d =>'translate(' + (d.x0 + 10) + ',' + (d.y0 + 30) + ')')
    .on('mouseover', function(d) {
      const value = d.data.value;
      const keinikiTotal = d.parent.value;
      const total = d.parent.parent.value;
      const ritu0 = Math.floor(keinikiTotal / total*1000)/10 + '%';
      const ritu1 = Math.floor(value / total*1000)/10 + '%';
      tooltip
      .style('visibility', 'visible')
      .html(d.parent.data.name + '計 = ' + ritu0 + '<br>' +d.data.name + ' = ' + ritu1 + '<br>' + value + unit);
      d3.select(this)
      .attr('style', 'fill:white');
    })
    .on('mousemove', () => {
      tooltip
      .style('top', (d3.event.pageY - 65) + 'px')
      .style('left', (d3.event.pageX + 20) + 'px');
    })
    .on('mouseout', function () {
      tooltip.style('visibility', 'hidden');
      d3.select(this)
      .attr('style', 'fill:black');
    });
    // ブロック作成------------------------------------------------------------------------------
    treeSvg.append('rect')
    .attr('width', 0)
    .attr('height', 0)
    .transition()
    .delay((d,i) => i * 15)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('stroke', 'black')
    .attr('stroke-width', '0.3px')
    .attr('fill', d => {
      while(d.depth > 1) d = d.parent;
      return d.data.color;
    });
    const maxVal = d3.max(dataset, d => d[targetColumn]);
    const minVal = d3.min(dataset, d => d[targetColumn]);
    const fontScale = d3.scaleLinear()
    .domain([minVal, maxVal])
    .range([6, 28]);
    treeSvg.append('text')
    .attr('text-anchor', 'start')
    .attr('x', 2)
    .attr('dy', d => fontScale(d.data.value))
    .attr('font-size', d => fontScale(d.data.value))
    .attr('class', 'node-label')
    .text(d => d.data.name)
    // .attr('style', 'fill:silver')
    .attr('opacity', 0)
    .transition()
    .delay((d,i) => i* 10)
    .attr('opacity', 1);
    // PNG保存-------------------------------------------------------------------------------
    const png =svg.append('g')
    .attr('transform', 'translate(' + (width -20) + ', 20)')
    .append('text')
    .text('画像保存')
    .attr('font-size', '12px')
    .attr('text-anchor', 'end')
    .attr('cursor', 'pointer')
    .on('click', function () {
      statNameG.attr('display', 'none');
      png.attr('display', 'none');
      ChartCommon.pngSave(svg, width, height, statName);
      png.attr('display', 'block');
      statNameG.attr('display', 'block')
    })
  };
  // 左右のデータのあるなしでtreeCreateファンクションを呼び出し---------------------------------
  if ((Data[leftObjName0] && statOld.leftSide !== newValue.leftSide) || reDisplayFlg) treeCreate('left');
  if ((Data[rightObjName0] && statOld.rightSide !== newValue.rightSide)|| reDisplayFlg) treeCreate('right');
}
