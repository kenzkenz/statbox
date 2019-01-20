import store from '../store'
import * as Data from '../data'
import * as d3 from 'd3'
import * as ChartCommon from './chartcommon'
export default function (newValue) {
  // 表示中のグラフを削除-----------------------------------------------------------------------
  d3.selectAll('.div').remove();
  d3.selectAll('.svg').remove();
  // 大元のSVG領域の大きさを設定-------------------------------------------------------------
  const width = 800, height = 400;
  const margin = { 'top': 50, 'bottom': 80, 'right': 50, 'left': 50 };
  // 散布図作成ファンクション--------------------------------------------------------------------
  const barPathCreate = () => {
    const statOld = store.state.base.statOld;
    const leftObjName0 = newValue.leftSide.split('/')[0];
    const leftObjName1 = newValue.leftSide.split('/')[1];
    const rightObjName0 = newValue.rightSide.split('/')[0];
    const rightObjName1 = newValue.rightSide.split('/')[1];
    const tooltip = d3.select('.tooltip');
    // SVG領域の設定-------------------------------------------------------------------------
    d3.selectAll('.div').remove();
    d3.selectAll('.svg').remove();
    const svg =
      d3.select('#d3chart01').append('svg')
      .attr('id', 'bar-svg')
      .attr('class', 'svg')
      .attr('width', width)
      .attr('height', height);
    // ソート------------------------------------------------------------------------------------
    /*
    svg.append('g')
    .attr('transform', 'translate(' + (10) + ',' + 20 + ')')
    .append('text')
    .attr('id', 'sortButton')
    .text('ソート')
    .attr('font-weight', 'normal')
    .attr('font-size', '10px')
    .attr('text-decoration', 'underline')
    .on( 'click', function() {
      if (d3.select(this).text() === 'ソート') {
        d3.select(this).text('解除');
        leftDataset.sort((a,b) => {
          if(a[leftTargetColumn] > b[leftTargetColumn]) return -1;
          if(a[leftTargetColumn] < b[leftTargetColumn]) return 1;
          return 0;
        });
      } else {
        d3.select(this).text('ソート');
        leftDataset.sort((a,b) => {
          if(a.citycode < b.citycode) return -1;
          if(a.citycode > b.citycode) return 1;
          return 0;
        });
      }
      barCreate ();
      pathCreate();
    })
    .on('mouseover', function(){
      d3.select(this).attr('fill', 'red');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', '');
    });
    */
    let xScale = null;
    let xAxis = null;
    // 棒グラフ作成ファンクション--------------------------------------------------------------
    const barCreate = () => {
      store.commit('base/updateBottomFlg', true);
      let leftDataset = Data[leftObjName0].data;
      const leftTargetColumn = Data[leftObjName0][leftObjName1].column;
      const leftUnit = Data[leftObjName0][leftObjName1].unit;
      const leftStatName = Data[leftObjName0][leftObjName1].statName;
      // ソートして順位をつける-------------------------------------------------------------------
      leftDataset.sort((a,b) => {
        if(a[leftTargetColumn] > b[leftTargetColumn]) return -1;
        if(a[leftTargetColumn] < b[leftTargetColumn]) return 1;
        return 0;
      });
      for (let i in leftDataset) {
        leftDataset[i]['leftTop'] = Number(i) + 1
      }
      leftDataset.sort((a,b) => {
        if(a.citycode < b.citycode) return -1;
        if(a.citycode > b.citycode) return 1;
        return 0;
      });
      // 軸スケールの設定------------------------------------------------------------------------
      // バー横軸--------------------------------------------------------------------------------
      xScale = d3.scaleBand()
      .rangeRound([margin.left, width - margin.right])
      .padding(0.1)
      .domain(leftDataset.map(d => d.cityname));
      // バー縦軸--------------------------------------------------------------------------------
      const maxVal = d3.max(leftDataset, d => d[leftTargetColumn]);
      let minVal = d3.min(leftDataset, d => d[leftTargetColumn]);
      if (minVal >= 0) {
        minVal = 0
      } else {
        minVal = minVal*1.1
      }
      const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([height - margin.bottom, margin.top]);
      // 軸の表示--------------------------------------------------------------------------------
      // x軸
      d3.selectAll('.x_text').remove();
      xAxis = svg.append('g')
      .attr('transform', 'translate(' + 0 + ',' + (height - margin.bottom + 0) + ')')
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('x', 0)
      .attr('y', 3)
      .attr('writing-mode', 'vertical-rl')
      .attr('font-size', '10px')
      .attr('letter-spacing', '-0.1em')
      .attr('text-anchor','start');
      // y軸バー-------------------------------------------------------------------------------
      d3.selectAll('.y_text').remove();
      svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
      .attr('class', 'y_text')
      .call(d3.axisLeft(yScale));
      // バーの表示------------------------------------------------------------------------------
      d3.selectAll('.bar').remove();
      svg.append('g')
      .selectAll('rect')
      .data(leftDataset)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.cityname))
      .attr('class', 'bar')
      .on('mouseover', function (d) {
        tooltip
        .style('visibility', 'visible')
        .html(d.leftTop + '位　' + d.cityname + '<br>' + d[leftTargetColumn] + leftUnit);
        d3.select(this) // マウスに重なった要素を選択
        .attr('style', 'fill:rgb(0,0,255)');
      })
      .on('mousemove', () => {
        tooltip
        .style('top', (d3.event.pageY - 20) + 'px')
        .style('left', (d3.event.pageX + 10) + 'px')
      })
      .on('mouseout', function ()  {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('style', 'lightskyblue');
      })
      .attr('width', xScale.bandwidth())
      .attr('fill', 'lightskyblue')
      .attr('y', yScale(0))
      .attr('height', 0) //棒の長さ0
      .transition()
      .duration(() => { if (statOld.leftSide !== newValue.leftSide) return 1500 })
      .attr('y', function (d){
        const val = d[leftTargetColumn];
        if (val>=0) {
          return yScale(d[leftTargetColumn])
        } else {
          d3.select(this).attr('fill', 'coral');
          return yScale(0)
        }
      })
      .attr('height', d => Math.abs(yScale(d[leftTargetColumn]) - yScale(0)));
      // バーの中に数値-------------------------------------------------------------------------
      d3.selectAll('.bar-text').remove();
      svg.append('g')
      .selectAll('text')
      .data(leftDataset)
      .enter()
      .append('text')
      .attr('class', 'bar-text')
      .text(function(d) {
        return Math.floor(d[leftTargetColumn]);
      })
      .attr('text-anchor', 'start')
      .attr('x', d => xScale(d.cityname) + 2)
      .attr('y', d => yScale(d[leftTargetColumn])- 5)
      .attr('font-size', '8px')
      .attr('fill', 'rgba(0,0,0,0)')
      .transition()
      .duration(() => {
        if (statOld.leftSide !== newValue.leftSide) return 4000
      })
      .attr('fill', 'black');
      // 単位------------------------------------------------------------------------------------
      svg.append('g')
      .attr('transform', 'translate(10,40)')
      .append('text')
      .text('単位:' + leftUnit)

      .attr('font-size', '10px');
      // 表名------------------------------------------------------------------------------------
      svg.append('g')
      .attr('transform', 'translate(80,30)')
      .append('text')
      .text('棒 = ' + leftStatName)
      .attr('font-size', '16px');
    };

    // 折れ線グラフ作成ファンクション--------------------------------------------------------------
    const pathCreate = () => {
      const rightDataset = Data[rightObjName0].data;
      const rightTargetColumn = Data[rightObjName0][rightObjName1].column;
      const rightUnit = Data[rightObjName0][rightObjName1].unit;
      const rightStatName = Data[rightObjName0][rightObjName1].statName;
      // ソートして順位をつける-------------------------------------------------------------------
      rightDataset.sort((a,b) => {
        if(a[rightTargetColumn] > b[rightTargetColumn]) return -1;
        if(a[rightTargetColumn] < b[rightTargetColumn]) return 1;
        return 0;
      });
      for (let i in rightDataset) {
        rightDataset[i]['rightTop'] = Number(i) + 1
      }
      rightDataset.sort((a,b) => {
        if(a.citycode < b.citycode) return -1;
        if(a.citycode > b.citycode) return 1;
        return 0;
      });
      // 軸スケールの設定------------------------------------------------------------------------
      if (!xScale) {
        xScale = d3.scaleBand()
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1)
        .domain(rightDataset.map(d => d.cityname));
      }
      if (!xAxis) {
        xAxis = svg.append('g')
        .attr('transform', 'translate(' + 0 + ',' + (height - margin.bottom + 0) + ')')
        .attr('class', 'x_text')
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('x', 0)
        .attr('y', 3)
        .style('text-anchor','start');
      }
      // 折れ線縦軸-----------------------------------------------------------------------------
      const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(rightDataset, d => d[rightTargetColumn])])
      .range([height - margin.bottom, margin.top]);
      svg.append('g')
      .attr('transform', 'translate(' + (width - margin.right) + ',' + 0 + ')')
      .call(d3.axisRight(yScale2));
      //折れ線（パス）の表示-------------------------------------------------------------------
      const datasetPath = [];
      for(let i = 0; i < rightDataset.length; i++){
        if(rightDataset[i][rightTargetColumn] !== null){
          datasetPath.push(rightDataset[i])
        }
      }
      const path = svg.append('path')
      .datum(datasetPath)
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('stroke-width', 1)
      .attr('d', d3.line()
      .x(function (d) {
        return xScale(d.cityname) + xScale.bandwidth()/2;
      })
      .y(function (d) {
        return yScale2(d[rightTargetColumn]);
      }));
      //パスの長さを取得-------------------------------------------------------------------------
      const pathLength = path.node().getTotalLength();
      path.attr('stroke-dasharray', pathLength + ' ' + pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(() => {
        if (statOld.rightSide !== newValue.rightSide) return 1500
      })
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);
      //サークル設置-----------------------------------------------------------------------------
      svg.append('g')
      .selectAll('circle')
      .data(datasetPath)
      .enter()
      .append('circle')
      .on('mouseover', function (d)  {
        tooltip.style('visibility', 'visible')
        .html('折れ線<br>' + d.rightTop + '位　' + d.cityname + '<br>' + d[rightTargetColumn] + rightUnit);
        d3.select(this)
        .attr('r', 8)
        .attr('style', 'fill:rgb(0,0,255)');
      })
      .on('mousemove', () => {
        tooltip.style('top', (d3.event.pageY - 20) + 'px')
        .style('left', (d3.event.pageX + 10) + 'px');
      })
      .on('mouseout', function ()  {
        tooltip.style('visibility', 'hidden');
        d3.select(this)
        .attr('r', 4)
        .attr('style', 'orange');
      })
      .attr('r', 0)
      .attr('cx', d => xScale(d.cityname) + xScale.bandwidth()/2)
      .attr('cy', d => yScale2(d[rightTargetColumn]))
      .attr('fill', 'orange')
      .transition()
      .delay((d,i) => {
        if (statOld.rightSide !== newValue.rightSide) {
          return 1000 + (i * 50);
        } else {
          return 0
        }
      })
      .attr('r', 4);

      // 単位------------------------------------------------------------------------------------
      svg.append('g')
      .attr('transform', 'translate(' + (width - margin.right) + ',' + 40 + ')')
      .append('text')
      .text('単位:' + rightUnit)
      .attr('font-size', '10px');
      // 表名------------------------------------------------------------------------------------
      svg.append('g')
      .attr('transform', 'translate(' + (width - margin.right - 30) + ',' + 30 + ')')
      .append('text')
      .text('折れ線 = ' + rightStatName)
      .attr('text-anchor', 'end')
      .attr('font-size', '16px');
    };
    // -----------------------------------------------------------------------------------------
    if (Data[leftObjName0]) barCreate();
    if(Data[rightObjName0]) pathCreate();
    // PNG保存-------------------------------------------------------------------------------
    const png =svg.append('g')
    .attr('transform', 'translate(' + (width - 10) + ',' + (20) + ')')
    .append('text')
    .text('グラフ保存')
    .attr('font-size', '12px')
    .attr('text-anchor', 'end')
    .attr('cursor', 'pointer')
    .on('click', function () {
      png.attr('display', 'none')
      ChartCommon.pngSave(svg, width, height, 'グラフ')
      png.attr('display', 'block')
    })
  };
  barPathCreate()
}
