import store from '../store'
import * as Data from '../data'
import * as d3 from 'd3'
import * as ChartCommon from './chartcommon'
import * as ss from 'simple-statistics'
export default function (newValue) {
  // 表示中のグラフを削除-----------------------------------------------------------------------
  d3.selectAll('.div').remove();
  d3.selectAll('.svg').remove();
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width = 800, height = 400;
  const margin = { 'top': 30, 'bottom': 50, 'right': 30, 'left': 50 };
  // 散布図作成ファンクション--------------------------------------------------------------------
  const bubbleCreate = () => {
    const leftObjName0 = newValue.leftSide.split('/')[0];
    const leftObjName1 = newValue.leftSide.split('/')[1];
    const rightObjName0 = newValue.rightSide.split('/')[0];
    const rightObjName1 = newValue.rightSide.split('/')[1];
    const tooltip = d3.select('.tooltip');
    if (!Data[leftObjName0] || !Data[rightObjName0]) {
      // alert('散布図の時は左右からデータを選んでください。');
      store.commit('base/setElDialogMsg', '散布図の時は左右からデータを選んでください。');
      store.commit('base/setElDialogVisible');
      return
    }
    const leftDataset = Data[leftObjName0].data;
    const leftTargetColumn = Data[leftObjName0][leftObjName1].column;
    const leftUnit = Data[leftObjName0][leftObjName1].unit;
    const leftStatName = Data[leftObjName0][leftObjName1].statName;
    const rightDataset = Data[rightObjName0].data;
    const rightTargetColumn = Data[rightObjName0][rightObjName1].column;
    const rightUnit = Data[rightObjName0][rightObjName1].unit;
    const rightStatName = Data[rightObjName0][rightObjName1].statName;
    const dataset = [];
    const leftDataAr = [], rightDataAr = [];
    const kaikiData = [];
    for (let i in leftDataset) {
      const obj = {
        cityname: leftDataset[i].cityname,
        leftData: leftDataset[i][leftTargetColumn],
        rightData: rightDataset[i][rightTargetColumn]
      };
      dataset.push(obj);
      // 相関係数計算用---------------------------------------------
      leftDataAr.push(leftDataset[i][leftTargetColumn]);
      rightDataAr.push(rightDataset[i][rightTargetColumn]);
      // 回帰直線計算用---------------------------------------------
      const arr = [rightDataset[i][rightTargetColumn],leftDataset[i][leftTargetColumn]];
      kaikiData.push(arr)
    }
    const soukan = ss.sampleCorrelation(leftDataAr, rightDataAr).toFixed(2);
    // SVG領域の設定--------------------------------------------------------------------------
    const svg =
      d3.select('#d3chart01').append('svg')
      .attr('id', 'scatter-svg')
      .attr('class', 'svg')
      .attr('width', width)
      .attr('height', height);
    // クリップ領域-------------------------------------------------------------------------------
    svg.append('defs').append('clipPath')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width-margin.right-margin.left)
    .attr('height', height-margin.top-margin.bottom);
    // 表名------------------------------------------------------------------------------------
    svg.append('g')
    .attr('transform', 'translate(' + (width/2) + ',' + 20 + ')')
    .append('text')
    .text('縦軸=' + leftStatName + '　×　横軸=' + rightStatName)
    .attr('text-anchor', 'middle ')
    .attr('font-weight', 'normal')
    .attr('font-size', '14px');
    // 相関係数---------------------------------------------------------------------------------
    svg.append('g')
    .attr('transform', 'translate(' + 10 + ',' + (height - 20) + ')')
    .append('text')
    .text('相関係数 = ' + soukan)
    .attr('text-anchor', 'start')
    .attr('font-size', '12px');
    // 相関係数の注釈-------------------------------------------------------------------------
    let str = '', fill = 'black';
    svg.append('g')
    .attr('transform', 'translate(' + 110 + ',' + (height - 20) + ')')
    .append('text')
    .text(function () {
      if (soukan >= 0.7) {
        str = '強い相関あり';
        fill = '#d50000'
      } else if (soukan >= 0.4) {
        str = 'やや相関あり';
        fill = '#ff8000'
      } else if (soukan >= 0.2) {
        str = '弱い相関あり';
        fill = '#00d500'
      } else if (soukan >= -0.2) {
        str = 'ほとんど相関なし';
        fill = 'black'
      } else if (soukan >= -0.4) {
        str = '弱い相関あり（負）';
        fill = '#00d500'
      } else if (soukan >= -0.7) {
        str = 'やや相関あり（負）';
        fill = '#ff8000'
      } else if (soukan >= -1) {
        str = '強い相関あり（負）';
        fill = '#d50000'
      }
      return str
    })
    .attr('text-anchor', 'start')
    .attr('font-size', '12px')
    .attr('fill', () => fill);
    // 軸スケールの設定-------------------------------------------------------------------------
    const rightMax =d3.max(dataset, d => d.rightData);
    const rightMin =d3.min(dataset, d => d.rightData);
    const xScale = d3.scaleLinear()
    .domain([rightMin*0.9, rightMax*1.1])
    .range([margin.left, width - margin.right]);
    const leftMax =d3.max(dataset, d => d.leftData);
    const leftMin =d3.min(dataset, d => d.leftData);
    const yScale = d3.scaleLinear()
    .domain([leftMin*0.9, leftMax*1.1])
    .range([height - margin.bottom, margin.top]);
    // 回帰直線--------------------------------------------------------------------------------
    const linReg = ss.linearRegression(kaikiData);
    const linRegLine = ss.linearRegressionLine(linReg);
    const kaikiLine = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .append('line')
    .attr('x1',xScale(rightMin))
    .attr('y1',yScale(linRegLine(rightMin)))
    .attr('x2',xScale(rightMin))
    .attr('y2',yScale(linRegLine(rightMin)))
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')
    .attr('stroke-dasharray', '4,4');
    kaikiLine
    .transition()
    .duration(1000)
    .ease(d3.easeCircleOut)
    .attr('x2',xScale(rightMax))
    .attr('y2',yScale(linRegLine(rightMax)));
    // 軸の表示---------------------------------------------------------------------------------
    const axisx = d3.axisBottom(xScale)
    .ticks(10)
    .tickSize(80  -height);
    const axisy = d3.axisLeft(yScale)
    .ticks(10)
    .tickSize(80 - width);
    const gX =  svg.append('g')
    .attr('transform', 'translate(' + 0 + ',' + (height - margin.bottom) + ')')
    .attr('class', 'axis')
    .call(axisx);
    const gY = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
    .attr('class', 'axis')
    .call(axisy);
    svg.selectAll('.axis path')
    .attr('stroke', 'lightgray')
    .attr('stroke-width', '1px');
    svg.selectAll('.axis line')
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', '0.5px')
    .attr('shape-rendering', 'crispEdges');
    // サークルの表示----------------------------------------------------------------------------
    const circle = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.rightData))
    .attr('cy', d => yScale(d.leftData))
    .attr('fill', 'orange')
    .on('mouseover', function(d) {
      tooltip
      .style('visibility', 'visible')
      .html(d.cityname + '<br>' + d.leftData + leftUnit + '<br>' + d.rightData + rightUnit);
    })
    .on('mousemove', function() {
      tooltip
      .style('top', (d3.event.pageY - 45) + 'px')
      .style('left', (d3.event.pageX + 10) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });
    circle.attr('r', 20)
    .transition()
    .delay((d, i) => i * 30)
    .attr('r', 6);
    // テキスト表示------------------------------------------------------------------------------
    const text = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .text(d => d.cityname)
    .attr('x', d => xScale(d.rightData) + 7)
    .attr('y', d => yScale(d.leftData) + 3)
    .attr('text-anchor', 'start')
    .attr('font-size', '10px')
    .on('mouseover', function(d) {
      tooltip
      .style('visibility', 'visible')
      .html(d.cityname + '<br>' + d.leftData + leftUnit + '<br>' + d.rightData + rightUnit);
    })
    .on('mousemove', function() {
      tooltip
      .style('top', (d3.event.pageY - 45) + 'px')
      .style('left', (d3.event.pageX + 10) + 'px');
    })
    .on('mouseout', function() {
      tooltip.style('visibility', 'hidden');
    });
    text.attr('opacity', 0)
    .transition()
    .delay((d,i) => i * 30)
    .attr('opacity', '1');
    // 縦軸単位---------------------------------------------------------------------------------
    svg.append('g')
    .attr('transform', 'translate(50, 20)')
    .append('text')
    .text('単位:' + leftUnit)
    .attr('text-anchor', 'end')
    .attr('font-size', '10px');
    // 横軸単位---------------------------------------------------------------------------------
    svg.append('g')
    .attr('transform', 'translate(' + (width - 30) + ',' + (height - 20) + ')')
    .append('text')
    .text('単位:' + rightUnit)
    .attr('text-anchor', 'end')
    .attr('font-weight', 'normal')
    .attr('font-size', '10px');

    // ズーム------------------------------------------------------------------------------------
    const zoomed = () => {
      const newXScale = d3.event.transform.rescaleX(xScale);
      const newYScale = d3.event.transform.rescaleY(yScale);
      // サークル---------------------------------------------------------------------------------
      circle
      .attr('cx', d => newXScale(d.rightData))
      .attr('cy', d => newYScale(d.leftData));
      // テキスト---------------------------------------------------------------------------------
      text
      .attr('x', d => newXScale(d.rightData) + 7)
      .attr('y', d => newYScale(d.leftData) + 3);
      gX.call(axisx.scale(d3.event.transform.rescaleX(xScale)));
      gY.call(axisy.scale(d3.event.transform.rescaleY(yScale)));
      // 回帰直線-------------------------------------------------------------------------------
      kaikiLine
      .attr('x1',newXScale(rightMin))
      .attr('y1',newYScale(linRegLine(rightMin)))
      .attr('x2',newXScale(rightMax))
      .attr('y2',newYScale(linRegLine(rightMax)))
      //-----------------------------------------------------------------------------------------
      svg.selectAll('.axis line')
      .attr('stroke', 'lightgray')
      .attr('stroke-opacity', '0.5px')
      .attr('shape-rendering', 'crispEdges');
    };
    // function resetted() {
    //   svg.transition()
    //   .duration(750)
    //   .call(zoom.transform, d3.zoomIdentity);
    // }
    const zoom = d3.zoom().on('zoom', zoomed);
    svg.call(zoom);
    // PNG保存-------------------------------------------------------------------------------
    const png =svg.append('g')
    .attr('transform', 'translate(' + (width - margin.right) + ',' + (20) + ')')
    .append('text')
    .text('グラフ保存')
    .attr('font-size', '12px')
    .attr('text-anchor', 'end')
    .attr('cursor', 'pointer')
    .on('click', function () {
      png.attr('display', 'none');
      ChartCommon.pngSave(svg, width, height, leftStatName);
      png.attr('display', 'block')
    })
  };
  bubbleCreate()
}
