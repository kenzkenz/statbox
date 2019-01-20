<template>
    <div id="d3chart01"/>
</template>
<script>
  import store from '../store'
  // import Cartogram from 'cartogram-chart/dist/cartogram-chart'
  // import Cartogram from '../cartogram'
  import * as Data from '../data'
  // import d3savesvg from 'd3-save-svg'
  import Bar from '../chart/bar'
  import Scatter from '../chart/scatter'
  import Bubble from '../chart/bubble'
  import TreeMap from '../chart/treemap'
  import Map from '../chart/map'

  export default {
    name: "D3",
    computed: {
      s_stat () { return this.$store.state.base.stat },
      s_statOld () { return this.$store.state.base.statOld },
      s_chartType () { return this.$store.state.base.chartType }
    },
    watch: {
      s_stat: {
        handler: function(newValue) {
          // グラフ選択---------------------------------------------------------------------------
          switch (this.s_chartType) {
            case 'bar':
              // barCreate (this.$store,newValue);
              Bar (newValue);
              break;
            case 'scatter':
              Scatter (newValue);
              break;
            case 'bubble':
              Bubble (newValue);
              break;
            case 'tree':
              TreeMap (newValue);
              break;
            // case 'boxplot':
            //   boxplot (this.$store,newValue,false);
            //   break;
          }
          // マップ--------------------------------------------------------------------------------
          Map(newValue, true);
          // csvの元データを作成する-------------------------------------------------------------
          csvDatasetCommit ('left', newValue)
          csvDatasetCommit ('right', newValue)
        },
        deep: true
      },
      s_chartType () {
        // グラフ選択---------------------------------------------------------------------------
        switch (this.s_chartType) {
          case 'bar':
            // barCreate (this.$store,this.s_stat);
            Bar (this.s_stat);
            break;
          case 'scatter':
            Scatter (this.s_stat);
            break;
          case 'bubble':
            Bubble (this.s_stat,true);
            break;
          case 'tree':
            TreeMap (this.s_stat,true);
            break;
          // case 'boxplot':
          //   boxplot (this.$store, this.s_stat,true);
          //   break;
        }
        Map(this.s_stat, false)
      }
    }
  }
  //csv用コミット--------------------------------------------------------------------------------
  function csvDatasetCommit (side, newValue) {
    const leftObjName0 = newValue.leftSide.split('/')[0];
    const leftObjName1 = newValue.leftSide.split('/')[1];
    const rightObjName0 = newValue.rightSide.split('/')[0];
    const rightObjName1 = newValue.rightSide.split('/')[1];
    let dataset, targetColumn, statName;
    if (side === 'left') {
      if (!Data[leftObjName0]) return;
      dataset = Data[leftObjName0].data;
      targetColumn = Data[leftObjName0][leftObjName1].column;
      statName = Data[leftObjName0][leftObjName1].statName;
    } else {
      if (!Data[rightObjName0]) return;
      dataset = Data[rightObjName0].data;
      targetColumn = Data[rightObjName0][rightObjName1].column;
      statName = Data[rightObjName0][rightObjName1].statName;
    }
    const newDataset = [];
    for (let i in dataset) {
      const obj = {
        'コード': dataset[i].citycode,
        '市町村名' : dataset[i].cityname,
        [statName] : dataset[i][targetColumn]
      };
      newDataset.push(obj)
    }
    if (side === 'left') {
      store.commit('base/setLeftCsvDataset', {name:statName,data: newDataset})
    } else {
      store.commit('base/setRightCsvDataset', {name:statName,data: newDataset})
    }
  }
</script>

<style>
</style>
